import { bind, Variable } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalBluetooth from "gi://AstalBluetooth";

const sortDevices = (a: AstalBluetooth.Device, b: AstalBluetooth.Device) => {
    if (a.connected || b.connected) return a.connected ? -1 : 1;
    if (a.paired || b.paired) return a.paired ? -1 : 1;
    return 0;
};

const BluetoothDevice = (device: AstalBluetooth.Device) => (
    <box className={bind(device, "connected").as(c => `device ${c ? "connected" : ""}`)}>
        <icon
            className="icon"
            icon={bind(device, "icon").as(i =>
                Astal.Icon.lookup_icon(`${i}-symbolic`) ? `${i}-symbolic` : "bluetooth-symbolic"
            )}
        />
        <box vertical hexpand>
            <label truncate xalign={0} label={bind(device, "alias")} />
            <label
                truncate
                className="sublabel"
                xalign={0}
                setup={self => {
                    const update = () => {
                        self.label =
                            (device.connected ? "Connected" : "Paired") +
                            (device.batteryPercentage >= 0 ? ` (${device.batteryPercentage * 100}%)` : "");
                        self.visible = device.connected || device.paired;
                    };
                    self.hook(device, "notify::connected", update);
                    self.hook(device, "notify::paired", update);
                    self.hook(device, "notify::battery-percentage", update);
                    update();
                }}
            />
        </box>
        <button
            valign={Gtk.Align.CENTER}
            visible={bind(device, "paired")}
            cursor="pointer"
            onClicked={() => AstalBluetooth.get_default().adapter.remove_device(device)}
            label="delete"
        />
        <button
            valign={Gtk.Align.CENTER}
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
            label={bind(device, "connected").as(c => (c ? "bluetooth_disabled" : "bluetooth_searching"))}
        />
    </box>
);

const List = ({ devNotify }: { devNotify: Variable<boolean> }) => (
    <box vertical valign={Gtk.Align.START} className="list">
        {bind(devNotify).as(() => AstalBluetooth.get_default().devices.sort(sortDevices).map(BluetoothDevice))}
    </box>
);

const NoDevices = () => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="bluetooth_searching" />
            <label label="No Bluetooth devices" />
        </box>
    </box>
);

export default () => {
    const bluetooth = AstalBluetooth.get_default();
    const devNotify = Variable(false); // Aggregator for device state changes (connected/paired)

    const update = () => devNotify.set(!devNotify.get());
    const connectSignals = (device: AstalBluetooth.Device) => {
        device.connect("notify::connected", update);
        device.connect("notify::paired", update);
    };
    bluetooth.get_devices().forEach(connectSignals);
    bluetooth.connect("device-added", (_, device) => connectSignals(device));
    bluetooth.connect("notify::devices", update);

    return (
        <box vertical className="bluetooth">
            <box className="header-bar">
                <label
                    label={bind(devNotify).as(() => {
                        const nConnected = bluetooth.get_devices().filter(d => d.connected).length;
                        return `${nConnected} connected device${nConnected === 1 ? "" : "s"}`;
                    })}
                />
                <box hexpand />
                <button
                    className={bind(bluetooth.adapter, "discovering").as(d => (d ? "enabled" : ""))}
                    cursor="pointer"
                    onClicked={() => {
                        if (bluetooth.adapter.discovering) bluetooth.adapter.start_discovery();
                        else bluetooth.adapter.stop_discovery();
                    }}
                    label="󰀂 Discovery"
                />
            </box>
            <stack
                transitionType={Gtk.StackTransitionType.CROSSFADE}
                transitionDuration={200}
                shown={bind(bluetooth, "devices").as(d => (d.length > 0 ? "list" : "empty"))}
            >
                <NoDevices />
                <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                    <List devNotify={devNotify} />
                </scrollable>
            </stack>
        </box>
    );
};
