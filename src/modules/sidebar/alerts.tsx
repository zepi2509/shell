import type { Monitor } from "@/services/monitors";
import Headlines from "./modules/headlines";
import Notifications from "./modules/notifications";

export default ({ monitor }: { monitor: Monitor }) => (
    <box vertical className="pane alerts" name="alerts">
        <Notifications />
        <box className="separator" />
        <Headlines monitor={monitor} />
    </box>
);
