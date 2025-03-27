import News from "./modules/news";
import Updates from "./modules/updates";

export default () => (
    <box vertical className="pane packages" name="packages">
        <box className="separator" />
        <News />
    </box>
);
