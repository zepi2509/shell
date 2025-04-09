import type { Monitor } from "@/services/monitors";
import News from "./modules/news";
import Updates from "./modules/updates";

export default ({ monitor }: { monitor: Monitor }) => (
    <box vertical className="pane packages" name="packages">
        <Updates />
        <box className="separator" />
        <News monitor={monitor} />
    </box>
);
