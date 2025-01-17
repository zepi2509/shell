import BluetoothDevices from "./bluetoothdevices";
import Networks from "./networks";
import Notifications from "./notifications";
import Updates from "./updates";

export default () => {
    <Notifications />;
    <Updates />;
    <BluetoothDevices />;
    <Networks />;

    return null;
};
