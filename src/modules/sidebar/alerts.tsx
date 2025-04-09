import Headlines from "./modules/headlines";
import Notifications from "./modules/notifications";

export default () => (
    <box vertical className="pane alerts" name="alerts">
        <Notifications />
        <box className="separator" />
        <Headlines />
    </box>
);
