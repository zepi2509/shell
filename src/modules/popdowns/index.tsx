import BluetoothDevices from "./bluetoothdevices";
import Media from "./media";
import Networks from "./networks";
import Notifications from "./notifications";
import SideLeft from "./sideleft";
import SideRight from "./sideright";
import Updates from "./updates";

export default () => {
    <Notifications />;
    <Updates />;
    <BluetoothDevices />;
    <Networks />;
    <Media />;
    <SideRight />;
    <SideLeft />;

    return null;
};
