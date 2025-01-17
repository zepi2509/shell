import { bind, Variable } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalBluetooth from "gi://AstalBluetooth";
import PopdownWindow from "../../widgets/popdownwindow";

const BluetoothDevice = (device: AstalBluetooth.Device) => (
    <box className={bind(device, "connected").as(c => `device ${c ? "active" : ""}`)}>
        <icon
            className="icon"
            icon={bind(device, "icon").as(i =>
                Astal.Icon.lookup_icon(`${i}-symbolic`) ? `${i}-symbolic` : "bluetooth-symbolic"
            )}
        />
        <label
            truncate
            xalign={0}
            setup={self => {
                const update = () =>
                    (self.label = `${device.alias}${
                        device.connected || device.paired ? ` (${device.connected ? "Connected" : "Paired"})` : ""
                    }`);
                self.hook(device, "notify::alias", update);
                self.hook(device, "notify::connected", update);
                self.hook(device, "notify::paired", update);
                update();
            }}
        />
        <box hexpand />
        <button
            cursor="pointer"
            onClicked={self => {
                if (device.connected)
                    device.disconnect_device((_, res) => {
                        self.sensitive = true;
                        device.disconnect_device_finish(res);
                    });
                else
                    device.connect_device((_, res) => {
                        self.sensitive = true;
                        device.connect_device_finish(res);
                    });
                self.sensitive = false;
            }}
            label={bind(device, "connected").as(c => (c ? "Disconnect" : "Connect"))}
        />
        <button
            cursor="pointer"
            onClicked={() => AstalBluetooth.get_default().adapter.remove_device(device)}
            label="Remove"
        />
    </box>
);

const List = () => (
    <box vertical valign={Gtk.Align.START} className="list">
        {bind(AstalBluetooth.get_default(), "devices").as(d => d.map(BluetoothDevice))}
    </box>
);

export default () => {
    const bluetooth = AstalBluetooth.get_default();
    const label = Variable("");

    const update = () => {
        const devices = bluetooth.get_devices();
        const connected = devices.filter(d => d.connected).length;
        label.set(`${connected} connected device${connected === 1 ? "" : "s"} (${devices.length} available)`);
    };
    bluetooth.get_devices().forEach(d => d.connect("notify::connected", update));
    bluetooth.connect("device-added", (_, device) => device.connect("notify::connected", update));
    bluetooth.connect("notify::devices", update);
    update();

    return (
        <PopdownWindow
            name="bluetooth-devices"
            count={bind(bluetooth, "devices").as(n => n.length)}
            countLabel={bind(label)}
            headerButtons={[
                {
                    label: bind(bluetooth, "isPowered").as(p => (p ? "Disable" : "Enable")),
                    onClicked: () => bluetooth.toggle(),
                },
                {
                    label: "Discovery",
                    onClicked: () => {
                        if (bluetooth.adapter.discovering) bluetooth.adapter.start_discovery();
                        else bluetooth.adapter.stop_discovery();
                    },
                    enabled: bind(bluetooth.adapter, "discovering"),
                },
            ]}
            emptyIcon="bluetooth_disabled"
            emptyLabel="No Bluetooth devices"
            list={<List />}
        />
    );
};
