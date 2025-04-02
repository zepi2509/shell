import { bindCurrentTime } from "@/utils/system";
import { Gtk } from "astal/gtk3";
import Calendar from "./modules/calendar";
import Upcoming from "./modules/upcoming";

const TimeDate = () => (
    <box vertical className="time-date">
        <box halign={Gtk.Align.CENTER}>
            <label label={bindCurrentTime("%I:%M:%S")} />
            <label className="ampm" label={bindCurrentTime("%p", c => (c.get_hour() < 12 ? "AM" : "PM"))} />
        </box>
        <label className="date" label={bindCurrentTime("%A, %d %B")} />
    </box>
);

export default () => (
    <box vertical className="pane time" name="time">
        <TimeDate />
        <box className="separator" />
        <Upcoming />
        <box className="separator" />
        <Calendar />
    </box>
);
