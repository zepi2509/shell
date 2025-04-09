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
    startDate: ical.Time;
    endDate: ical.Time;
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
    #cachedEvents: { [date: string]: IEvent[] } = {};
    #cachedMonths: Set<string> = new Set();

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

    getEventsForMonth(date: ical.Time) {
        const start = date.startOfMonth();

        if (this.#cachedMonths.has(start.toJSDate().toDateString())) return this.#cachedEvents;

        this.#cachedMonths.add(start.toJSDate().toDateString());
        const end = date.endOfMonth();

        const modDates = new Set<string>();

        for (const [name, cal] of Object.entries(this.#calendars)) {
            for (const e of cal.getAllSubcomponents()) {
                const event = new ical.Event(e);

                // Skip invalid events
                if (!event.startDate) continue;

                if (event.isRecurring()) {
                    // Recurring events
                    const iter = event.iterator();
                    for (let next = iter.next(); next && next.compare(end) <= 0; next = iter.next())
                        if (next.compare(start) >= 0) {
                            const date = next.toJSDate().toDateString();
                            if (!this.#cachedEvents.hasOwnProperty(date)) this.#cachedEvents[date] = [];

                            const end = next.clone();
                            end.addDuration(event.duration);
                            this.#cachedEvents[date].push({ calendar: name, event, startDate: next, endDate: end });
                            modDates.add(date);
                        }
                } else if (event.startDate.compare(start) >= 0 && event.startDate.compare(end) <= 0) {
                    const date = event.startDate.toJSDate().toDateString();
                    if (!this.#cachedEvents.hasOwnProperty(date)) this.#cachedEvents[date] = [];
                    this.#cachedEvents[date].push({
                        calendar: name,
                        event,
                        startDate: event.startDate,
                        endDate: event.endDate,
                    });
                    modDates.add(date);
                }
            }
        }

        for (const date of modDates) this.#cachedEvents[date].sort((a, b) => a.startDate.compare(b.startDate));

        return this.#cachedEvents;
    }

    getEventsForDay(date: ical.Time) {
        return this.getEventsForMonth(date)[date.toJSDate().toDateString()] ?? [];
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
                if (GLib.file_test(`${this.#cacheDir}/${webcal}`, GLib.FileTest.EXISTS))
                    icalStr = await readFileAsync(`${this.#cacheDir}/${webcal}`);
            }

            if (icalStr) {
                const comp = new ical.Component(ical.parse(icalStr));
                const name = (comp.getFirstPropertyValue("x-wr-calname") ?? `Calendar ${this.#calCount++}`) as string;
                this.#calendars[name] = comp;
                writeFileAsync(`${this.#cacheDir}/${webcal}`, icalStr).catch(console.error);
            }
        }
        this.#cachedEvents = {};
        this.#cachedMonths.clear();

        this.notify("calendars");

        this.updateUpcoming();

        this.#loading = false;
        this.notify("loading");
    }

    updateUpcoming() {
        this.#upcoming = {};

        for (let i = 0; i < config.upcomingDays.get(); i++) {
            const date = ical.Time.now().adjust(i, 0, 0, 0);
            const events = this.getEventsForDay(date);
            if (events.length > 0) this.#upcoming[date.toJSDate().toDateString()] = events;
        }

        this.notify("upcoming");
        this.notify("num-upcoming");

        this.setReminders();
    }

    #notifyEvent(event: IEvent) {
        const start = GLib.DateTime.new_from_unix_local(event.startDate.toUnixTime());
        const end = GLib.DateTime.new_from_unix_local(event.endDate.toUnixTime());
        const time = `${start.format(`%A, %-d %B`)} • Now — ${end.format("%-I:%M%P")}`;
        const locIfExists = event.event.location ? ` ${event.event.location}\n` : "";
        const descIfExists = event.event.description ? `󰒿 ${event.event.description}\n` : "";

        notify({
            summary: `󰨱   ${event.event.summary}   󰨱`,
            body: `${time}\n${locIfExists}${descIfExists}󰃭 ${event.calendar}`,
        }).catch(console.error);
    }

    #createReminder(event: IEvent) {
        const diff = event.startDate.toJSDate().getTime() - ical.Time.now().toJSDate().getTime();
        if (diff > 0) this.#reminders.push(timeout(diff, () => this.#notifyEvent(event)));
    }

    setReminders() {
        this.#reminders.forEach(r => r.cancel());
        this.#reminders = [];

        if (!config.notify.get()) return;

        for (const events of Object.values(this.#upcoming)) for (const event of events) this.#createReminder(event);
    }

    constructor() {
        super();

        GLib.mkdir_with_parents(this.#cacheDir, 0o755);

        const cals = config.webcals.get().map(async c => {
            const webcal = pathToFileName(c);

            if (GLib.file_test(`${this.#cacheDir}/${webcal}`, GLib.FileTest.EXISTS)) {
                const data = await readFileAsync(`${this.#cacheDir}/${webcal}`);
                const comp = new ical.Component(ical.parse(data));
                const name = (comp.getFirstPropertyValue("x-wr-calname") ?? `Calendar ${this.#calCount++}`) as string;
                this.#calendars[name] = comp;
            }
        });
        Promise.allSettled(cals).then(() => {
            this.#cachedEvents = {};
            this.#cachedMonths.clear();
            this.notify("calendars");
            this.updateUpcoming();
        });

        this.updateCalendars().catch(console.error);
        config.webcals.subscribe(() => this.updateCalendars().catch(console.error));
        config.upcomingDays.subscribe(() => this.updateUpcoming());
        config.notify.subscribe(() => this.setReminders());
    }
}
