import { execAsync, GObject, property, register } from "astal";
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

    #calCount = 1;
    #loading = false;
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
        for (const cal of cals) {
            if (cal.status === "fulfilled") {
                const comp = new ical.Component(ical.parse(cal.value));
                const name = (comp.getFirstPropertyValue("x-wr-calname") ?? `Calendar ${this.#calCount++}`) as string;
                this.#calendars[name] = comp;
            } else console.error(`Failed to get calendar: ${cal.reason}`);
        }
        this.notify("calendars");

        this.updateUpcoming();

        this.#loading = false;
        this.notify("loading");
    }

    updateUpcoming() {
        this.#upcoming = {};

        for (const [name, cal] of Object.entries(this.#calendars)) {
            const today = ical.Time.now();
            const upcoming = ical.Time.now().adjust(config.upcomingDays.get(), 0, 0, 0);

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
                            this.#upcoming[date].push({ calendar: name, event });
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
    }

    constructor() {
        super();

        this.updateCalendars().catch(console.error);
        config.webcals.subscribe(() => this.updateCalendars().catch(console.error));
        config.upcomingDays.subscribe(() => this.updateUpcoming());
    }
}
