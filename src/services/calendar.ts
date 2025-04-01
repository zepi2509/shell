import { pathToFileName } from "@/utils/strings";
import { notify } from "@/utils/system";
import {
    execAsync,
    GLib,
    GObject,
    property,
    readFileAsync,
    register,
    timeout,
    writeFileAsync,
    type AstalIO,
} from "astal";
import { calendar as config } from "config";
import ical from "ical.js";

export interface IEvent {
    calendar: string;
    event: ical.Event;
}

@register({ GTypeName: "Calendar" })
export default class Calendar extends GObject.Object {
    static instance: Calendar;
    static get_default() {
        if (!this.instance) this.instance = new Calendar();

        return this.instance;
    }

    readonly #cacheDir = `${CACHE}/calendars`;

    #calCount: number = 1;
    #reminders: AstalIO.Time[] = [];
    #loading: boolean = false;
    #calendars: { [name: string]: ical.Component } = {};
    #upcoming: { [date: string]: IEvent[] } = {};

    @property(Boolean)
    get loading() {
        return this.#loading;
    }

    @property(Object)
    get calendars() {
        return this.#calendars;
    }

    @property(Object)
    get upcoming() {
        return this.#upcoming;
    }

    @property(Number)
    get numUpcoming() {
        return Object.values(this.#upcoming).reduce((acc, e) => acc + e.length, 0);
    }

    getCalendarIndex(name: string) {
        return Object.keys(this.#calendars).indexOf(name) + 1;
    }

    async updateCalendars() {
        this.#loading = true;
        this.notify("loading");

        this.#calendars = {};
        this.#calCount = 1;

        const cals = await Promise.allSettled(config.webcals.get().map(c => execAsync(["curl", c])));
        for (let i = 0; i < cals.length; i++) {
            const cal = cals[i];
            const webcal = pathToFileName(config.webcals.get()[i]);

            let icalStr;
            if (cal.status === "fulfilled") {
                icalStr = cal.value;
            } else {
                console.error(`Failed to get calendar from ${config.webcals.get()[i]}:\n${cal.reason}`);
                icalStr = await readFileAsync(`${this.#cacheDir}/${webcal}`);
            }

            if (icalStr) {
                const comp = new ical.Component(ical.parse(icalStr));
                const name = (comp.getFirstPropertyValue("x-wr-calname") ?? `Calendar ${this.#calCount++}`) as string;
                this.#calendars[name] = comp;
                writeFileAsync(`${this.#cacheDir}/${webcal}`, icalStr).catch(console.error);
            }
        }
        this.notify("calendars");

        this.updateUpcoming();

        this.#loading = false;
        this.notify("loading");
    }

    updateUpcoming() {
        this.#upcoming = {};

        const today = ical.Time.now();
        const upcoming = ical.Time.now().adjust(config.upcomingDays.get(), 0, 0, 0);
        for (const [name, cal] of Object.entries(this.#calendars)) {
            for (const e of cal.getAllSubcomponents()) {
                const event = new ical.Event(e);

                // Skip invalid events
                if (!event.startDate) continue;

                if (event.isRecurring()) {
                    // Recurring events
                    const iter = event.iterator();
                    for (let next = iter.next(); next && next.compare(upcoming) <= 0; next = iter.next())
                        if (next.compare(today) >= 0) {
                            const date = next.toJSDate().toDateString();
                            if (!this.#upcoming.hasOwnProperty(date)) this.#upcoming[date] = [];

                            const rEvent = new ical.Event(e);
                            rEvent.startDate = next;
                            this.#upcoming[date].push({ calendar: name, event: rEvent });
                        }
                } else if (event.startDate.compare(today) >= 0 && event.startDate.compare(upcoming) <= 0) {
                    // Add to upcoming if in upcoming range
                    const date = event.startDate.toJSDate().toDateString();
                    if (!this.#upcoming.hasOwnProperty(date)) this.#upcoming[date] = [];
                    this.#upcoming[date].push({ calendar: name, event });
                }
            }
        }

        for (const events of Object.values(this.#upcoming))
            events.sort((a, b) => a.event.startDate.compare(b.event.startDate));

        this.notify("upcoming");
        this.notify("num-upcoming");

        this.setReminders();
    }

    #notifyEvent(event: ical.Event, calendar: string) {
        const start = GLib.DateTime.new_from_unix_local(event.startDate.toUnixTime());
        const end = GLib.DateTime.new_from_unix_local(event.endDate.toUnixTime());
        const time = `${start.format(`%A, %-d %B`)} • Now — ${end.format("%-I:%M%P")}`;
        const locIfExists = event.location ? ` ${event.location}\n` : "";
        const descIfExists = event.description ? `󰒿 ${event.description}\n` : "";

        notify({
            summary: `󰨱   ${event.summary}   󰨱`,
            body: `${time}\n${locIfExists}${descIfExists}󰃭 ${calendar}`,
        }).catch(console.error);
    }

    #createReminder(event: ical.Event, calendar: string, next: ical.Time) {
        const diff = next.toUnixTime() - ical.Time.now().toUnixTime();
        if (diff > 0) this.#reminders.push(timeout(diff * 1000, () => this.#notifyEvent(event, calendar)));
    }

    setReminders() {
        this.#reminders.forEach(r => r.cancel());
        this.#reminders = [];

        if (!config.notify.get()) return;

        const today = ical.Time.now();
        const upcoming = ical.Time.now().adjust(config.upcomingDays.get(), 0, 0, 0);
        for (const [name, cal] of Object.entries(this.#calendars)) {
            for (const e of cal.getAllSubcomponents()) {
                const event = new ical.Event(e);

                // Skip invalid events
                if (!event.startDate) continue;

                if (event.isRecurring()) {
                    // Recurring events
                    const iter = event.iterator();
                    for (let next = iter.next(); next && next.compare(upcoming) <= 0; next = iter.next())
                        if (next.compare(today) >= 0) this.#createReminder(event, name, next);
                } else if (event.startDate.compare(today) >= 0 && event.startDate.compare(upcoming) <= 0)
                    // Create reminder if in upcoming range
                    this.#createReminder(event, name, event.startDate);
            }
        }
    }

    constructor() {
        super();

        GLib.mkdir_with_parents(this.#cacheDir, 0o755);

        this.updateCalendars().catch(console.error);
        config.webcals.subscribe(() => this.updateCalendars().catch(console.error));
        config.upcomingDays.subscribe(() => this.updateUpcoming());
        config.notify.subscribe(() => this.setReminders());
    }
}
