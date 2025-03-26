import Bluetooth from "./modules/bluetooth";
import Networks from "./modules/networks";

export default () => (
    <box vertical className="pane connectivity" name="connectivity">
        <Networks />
        <box className="separator" />
        <Bluetooth />
    </box>
);
