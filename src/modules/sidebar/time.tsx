import Calendar from "./modules/calendar";
import Upcoming from "./modules/upcoming";

const TimeDate = () => <box></box>;

export default () => (
    <box vertical className="pane time" name="time">
        <TimeDate />
        <box className="separator" />
        <Upcoming />
        <box className="separator" />
        <Calendar />
    </box>
);
