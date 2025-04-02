import Calendar from "@/services/calendar";
import { setupCustomTooltip } from "@/utils/widgets";
import { bind, GLib, Variable } from "astal";
import { Gtk } from "astal/gtk3";
import ical from "ical.js";

const isLeapYear = (year: number) => year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0);

const getMonthDays = (month: number, year: number) => {
    const leapYear = isLeapYear(year);
    if (month === 2 && leapYear) return leapYear ? 29 : 28;
    if ((month <= 7 && month % 2 === 1) || (month >= 8 && month % 2 === 0)) return 31;
    return 30;
};

const getNextMonthDays = (month: number, year: number) => {
    if (month === 12) return 31;
    return getMonthDays(month + 1, year);
};

const getPrevMonthDays = (month: number, year: number) => {
    if (month === 1) return 31;
    return getMonthDays(month - 1, year);
};

export function getCalendarLayout(date: ical.Time) {
    const weekdayOfMonthFirst = date.startOfMonth().dayOfWeek(ical.Time.MONDAY);
    const daysInMonth = getMonthDays(date.month, date.year);
    const daysInPrevMonth = getPrevMonthDays(date.month, date.year);

    const calendar: ical.Time[][] = [];
    let idx = -weekdayOfMonthFirst + 2;

    for (let i = 0; i < 6; i++) {
        calendar.push([]);

        for (let j = 0; j < 7; j++) {
            let cDay = idx++;
            let cMonth = date.month;
            let cYear = date.year;

            if (idx < 0) {
                cDay = daysInPrevMonth + cDay;
                cMonth--;

                if (cMonth < 0) {
                    cMonth += 12;
                    cYear--;
                }
            } else if (idx > daysInMonth) {
                cDay -= daysInMonth;
                cMonth++;

                if (cMonth > 12) {
                    cMonth -= 12;
                    cYear++;
                }
            }

            calendar[i].push(ical.Time.fromData({ day: cDay, month: cMonth, year: cYear }));
        }
    }

    return calendar;
}

const dateToMonthYear = (date: ical.Time) => {
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    return `${months[date.month - 1]} ${date.year}`;
};

const addMonths = (date: ical.Time, num: number) => {
    date = date.clone();
    if (num > 0) for (let i = 0; i < num; i++) date.adjust(getNextMonthDays(date.month, date.year), 0, 0, 0);
    else for (let i = 0; i > num; i--) date.adjust(-getPrevMonthDays(date.month, date.year), 0, 0, 0);
    return date;
};

const getDayClassName = (day: ical.Time, current: Variable<ical.Time>) => {
    const isToday = day.toJSDate().toDateString() === new Date().toDateString() ? "today" : "";
    const numEvents = Math.min(5, Calendar.get_default().getEventsForDay(day).length);
    return `day ${isToday} ${day.month !== current.get().month ? "dim" : ""} events-${numEvents}`;
};

const getDayTooltip = (day: ical.Time) => {
    const events = Calendar.get_default().getEventsForDay(day);
    if (!events.length) return "";
    const eventsStr = events
        .map(e => {
            const start = GLib.DateTime.new_from_unix_local(e.startDate.toUnixTime());
            const end = GLib.DateTime.new_from_unix_local(e.endDate.toUnixTime());
            const sameAmPm = start.format("%P") === end.format("%P");
            const time = `${start.format(`%-I:%M${sameAmPm ? "" : "%P"}`)} — ${end.format("%-I:%M%P")}`;
            return `<b>${e.event.summary.replaceAll("&", "&amp;")}</b> • ${time}`;
        })
        .join("\n");
    return `${events.length} event${events.length === 1 ? "" : "s"}\n${eventsStr}`;
};

const Day = ({ day, shown, current }: { day: ical.Time; shown: Variable<string>; current: Variable<ical.Time> }) => (
    <button
        className={bind(Calendar.get_default(), "calendars").as(() => getDayClassName(day, current))}
        cursor="pointer"
        onClicked={() => {
            shown.set("events");
            current.set(day);
        }}
        setup={self =>
            setupCustomTooltip(
                self,
                bind(Calendar.get_default(), "calendars").as(() => getDayTooltip(day)),
                { useMarkup: true }
            )
        }
    >
        <box vertical>
            <label label={day.day.toString()} />
            <box className="indicator" />
        </box>
    </button>
);

const CalendarView = ({ shown, current }: { shown: Variable<string>; current: Variable<ical.Time> }) => (
    <box vertical className="calendar-view" name="calendar">
        <box className="header">
            <button
                cursor="pointer"
                onClicked={() => current.set(ical.Time.now())}
                label={bind(current).as(dateToMonthYear)}
            />
            <box hexpand />
            <button cursor="pointer" onClicked={() => current.set(addMonths(current.get(), -1))} label="" />
            <button cursor="pointer" onClicked={() => current.set(addMonths(current.get(), 1))} label="" />
        </box>
        <box halign={Gtk.Align.CENTER} className="weekdays">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                <label label={d} />
            ))}
        </box>
        <box vertical halign={Gtk.Align.CENTER} className="month">
            {bind(current).as(c =>
                getCalendarLayout(c).map(r => (
                    <box className="week">
                        {r.map(d => (
                            <Day day={d} shown={shown} current={current} />
                        ))}
                    </box>
                ))
            )}
        </box>
    </box>
);
const Events = ({ shown, current }: { shown: Variable<string>; current: Variable<ical.Time> }) => (
    <box className="events" name="events"></box>
);

export default () => {
    const shown = Variable("calendar");
    const current = Variable(ical.Time.now());

    return (
        <box vertical className="calendar">
            <stack
                transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                transitionDuration={150}
                shown={bind(shown)}
            >
                <CalendarView shown={shown} current={current} />
                <Events shown={shown} current={current} />
            </stack>
        </box>
    );
};
