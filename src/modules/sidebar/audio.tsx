import DeviceSelector from "./modules/deviceselector";
import Media from "./modules/media";
import Streams from "./modules/streams";

export default () => (
    <box vertical className="pane audio" name="audio">
        <Media />
        <box className="separator" />
        <Streams />
        <box className="separator" />
        <DeviceSelector />
    </box>
);
