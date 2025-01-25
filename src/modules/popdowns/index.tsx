import BluetoothDevices from "./bluetoothdevices";
import Media from "./media";
import Networks from "./networks";
import Notifications from "./notifications";
import Updates from "./updates";

export default () => {
    <Notifications />;
    <Updates />;
    <BluetoothDevices />;
    <Networks />;
    <Media />;

    return null;
};
