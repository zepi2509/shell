import Calendar, { type IEvent } from "@/services/calendar";
import { setupCustomTooltip } from "@/utils/widgets";
import { bind, GLib } from "astal";
import { Gtk } from "astal/gtk3";

const getDateHeader = (events: IEvent[]) => {
    const date = events[0].event.startDate;
    const isToday = date.toJSDate().toDateString() === new Date().toDateString();
    return (
        (isToday ? "Today • " : "") +
        GLib.DateTime.new_from_unix_local(date.toUnixTime()).format("%B %-d • %A") +
        ` • ${events.length} event${events.length === 1 ? "" : "s"}`
    );
};

const getEventHeader = (e: IEvent) => {
    const start = GLib.DateTime.new_from_unix_local(e.event.startDate.toUnixTime());
    const time = `${start.format("%-I")}${start.get_minute() > 0 ? `:${start.get_minute()}` : ""}${start.format("%P")}`;
    return `${time} <b>${e.event.summary}</b>`;
};

const getEventTooltip = (e: IEvent) => {
    const start = GLib.DateTime.new_from_unix_local(e.event.startDate.toUnixTime());
    const end = GLib.DateTime.new_from_unix_local(e.event.endDate.toUnixTime());
    const sameAmPm = start.format("%P") === end.format("%P");
    const time = `${start.format(`%A, %-d %B • %-I:%M${sameAmPm ? "" : "%P"}`)} — ${end.format("%-I:%M%P")}`;
    const locIfExists = e.event.location ? ` ${e.event.location}\n` : "";
    const descIfExists = e.event.description ? `󰒿 ${e.event.description}\n` : "";
    return `<b>${e.event.summary}</b>\n${time}\n${locIfExists}${descIfExists}󰃭 ${e.calendar}`;
};

const Event = (event: IEvent) => (
    <box className="event" setup={self => setupCustomTooltip(self, getEventTooltip(event), { useMarkup: true })}>
        <box className={`calendar-indicator c${Calendar.get_default().getCalendarIndex(event.calendar)}`} />
        <box vertical>
            <label truncate useMarkup xalign={0} label={getEventHeader(event)} />
            {event.event.location && <label truncate xalign={0} label={event.event.location} className="sublabel" />}
            {event.event.description && (
                <label truncate useMarkup xalign={0} label={event.event.description} className="sublabel" />
            )}
        </box>
    </box>
);

const Day = ({ events }: { events: IEvent[] }) => (
    <box vertical className="day">
        <label className="date" xalign={0} label={getDateHeader(events)} />
        <box vertical className="events">
            {events.map(Event)}
        </box>
    </box>
);

const List = () => (
    <box vertical valign={Gtk.Align.START}>
        {bind(Calendar.get_default(), "upcoming").as(u =>
            Object.values(u)
                .sort((a, b) => a[0].event.startDate.compare(b[0].event.startDate))
                .map(e => <Day events={e} />)
        )}
    </box>
);

const NoEvents = () => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="calendar_month" />
            <label label="No upcoming events" />
        </box>
    </box>
);

export default () => (
    <box vertical className="upcoming">
        <box className="header-bar">
            <label
                label={bind(Calendar.get_default(), "numUpcoming").as(n => `${n} upcoming event${n === 1 ? "" : "s"}`)}
            />
            <box hexpand />
            <button
                className={bind(Calendar.get_default(), "loading").as(l => (l ? "enabled" : ""))}
                sensitive={bind(Calendar.get_default(), "loading").as(l => !l)}
                cursor="pointer"
                onClicked={() => Calendar.get_default().updateCalendars().catch(console.error)}
                label={bind(Calendar.get_default(), "loading").as(l => (l ? "󰑓 Loading" : "󰑓 Reload"))}
            />
        </box>
        <stack
            transitionType={Gtk.StackTransitionType.CROSSFADE}
            transitionDuration={200}
            shown={bind(Calendar.get_default(), "numUpcoming").as(n => (n > 0 ? "list" : "empty"))}
        >
            <NoEvents />
            <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                <List />
            </scrollable>
        </stack>
    </box>
);
