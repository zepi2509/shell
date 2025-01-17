import { bind, execAsync, Variable } from "astal";
import { Gtk } from "astal/gtk3";
import AstalNetwork from "gi://AstalNetwork";
import PopdownWindow from "../../widgets/popdownwindow";

const Network = (accessPoint: AstalNetwork.AccessPoint) => (
    <box className="network">
        <icon className="icon" icon={bind(accessPoint, "iconName")} />
        <label
            truncate
            xalign={0}
            setup={self => {
                const update = () =>
                    (self.label = `${accessPoint.ssid}${` (${accessPoint.frequency > 5000 ? 5 : 2.4}GHz | ${
                        accessPoint.strength
                    }/100)`}`);
                self.hook(accessPoint, "notify::ssid", update);
                self.hook(accessPoint, "notify::frequency", update);
                self.hook(accessPoint, "notify::strength", update);
                update();
            }}
        />
        <box hexpand />
        <button
            cursor="pointer"
            onClicked={self => {
                const cmd =
                    AstalNetwork.get_default().wifi.activeAccessPoint === accessPoint ? "c down id" : "d wifi connect";
                execAsync(`nmcli ${cmd} '${accessPoint.ssid}'`)
                    .then(() => (self.sensitive = true))
                    .catch(console.error);
                self.sensitive = false;
            }}
            label={bind(AstalNetwork.get_default().wifi, "activeAccessPoint").as(a =>
                a === accessPoint ? "Disconnect" : "Connect"
            )}
        />
        <button
            cursor="pointer"
            onClicked={() => execAsync(`nmcli c delete id '${accessPoint.ssid}'`).catch(() => {})}
            label="Forget"
        />
    </box>
);

const List = () => {
    const { wifi } = AstalNetwork.get_default();
    const children = Variable.derive([bind(wifi, "accessPoints"), bind(wifi, "activeAccessPoint")], (aps, ac) =>
        aps
            .filter(a => a.ssid)
            .sort((a, b) => (a === ac ? -1 : b.strength - a.strength))
            .map(Network)
    );

    return (
        <box vertical valign={Gtk.Align.START} className="list" onDestroy={() => children.drop()}>
            {bind(children)}
        </box>
    );
};

export default () => {
    const network = AstalNetwork.get_default();
    const label = Variable("");

    const update = () => {
        if (network.primary === AstalNetwork.Primary.WIFI) label.set(network.wifi.ssid ?? "Disconnected");
        else if (network.primary === AstalNetwork.Primary.WIRED) label.set(`Ethernet (${network.wired.speed})`);
        else label.set("No Wifi");
    };
    network.connect("notify::primary", update);
    network.get_wifi()?.connect("notify::ssid", update);
    network.get_wired()?.connect("notify::speed", update);
    update();

    return (
        <PopdownWindow
            name="networks"
            count={bind(network.wifi, "accessPoints").as(a => a.length)}
            countLabel={bind(label)}
            headerButtons={[
                {
                    label: bind(network.wifi, "enabled").as(p => (p ? "Disable" : "Enable")),
                    onClicked: () => (network.wifi.enabled = !network.wifi.enabled),
                },
                {
                    label: "Scan",
                    onClicked: () => network.wifi.scan(),
                    enabled: bind(network.wifi, "scanning"),
                },
            ]}
            emptyIcon="wifi_off"
            emptyLabel={bind(network.wifi, "enabled").as(p => (p ? "No available networks" : "Wifi is off"))}
            list={<List />}
        />
    );
};
