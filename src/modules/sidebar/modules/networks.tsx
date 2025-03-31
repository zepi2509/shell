import { bind, execAsync, Variable, type Binding } from "astal";
import { Gtk } from "astal/gtk3";
import AstalNetwork from "gi://AstalNetwork";

const sortAPs = (saved: string[], a: AstalNetwork.AccessPoint, b: AstalNetwork.AccessPoint) => {
    const { wifi } = AstalNetwork.get_default();
    if (a === wifi.activeAccessPoint || b === wifi.activeAccessPoint) return a === wifi.activeAccessPoint ? -1 : 1;
    if (saved.includes(a.ssid) || saved.includes(b.ssid)) return saved.includes(a.ssid) ? -1 : 1;
    return b.strength - a.strength;
};

const Network = (accessPoint: AstalNetwork.AccessPoint) => (
    <box
        className={bind(AstalNetwork.get_default().wifi, "activeAccessPoint").as(
            a => `network ${a === accessPoint ? "connected" : ""}`
        )}
    >
        <icon className="icon" icon={bind(accessPoint, "iconName")} />
        <box vertical hexpand>
            <label truncate xalign={0} label={bind(accessPoint, "ssid").as(s => s ?? "Unknown")} />
            <label
                truncate
                xalign={0}
                className="sublabel"
                label={bind(accessPoint, "strength").as(s => `${accessPoint.frequency > 5000 ? 5 : 2.4}GHz • ${s}/100`)}
            />
        </box>
        <box hexpand />
        <button
            valign={Gtk.Align.CENTER}
            visible={false}
            cursor="pointer"
            onClicked={() => execAsync(`nmcli c delete id '${accessPoint.ssid}'`).catch(console.error)}
            label="delete_forever"
            setup={self => {
                let destroyed = false;
                execAsync(`fish -c "nmcli -t -f name,type c show | sed -nE 's/(.*)\\:.*wireless/\\1/p'"`)
                    .then(out => !destroyed && (self.visible = out.split("\n").includes(accessPoint.ssid)))
                    .catch(console.error);
                self.connect("destroy", () => (destroyed = true));
            }}
        />
        <button
            valign={Gtk.Align.CENTER}
            cursor="pointer"
            onClicked={self => {
                let destroyed = false;
                const id = self.connect("destroy", () => (destroyed = true));
                const cmd =
                    AstalNetwork.get_default().wifi.activeAccessPoint === accessPoint ? "c down id" : "d wifi connect";
                execAsync(`nmcli ${cmd} '${accessPoint.ssid}'`)
                    .then(() => {
                        if (!destroyed) {
                            self.sensitive = true;
                            self.disconnect(id);
                        }
                    })
                    .catch(console.error);
                self.sensitive = false;
            }}
            label={bind(AstalNetwork.get_default().wifi, "activeAccessPoint").as(a =>
                a === accessPoint ? "wifi_off" : "wifi"
            )}
        />
    </box>
);

const List = () => {
    const { wifi } = AstalNetwork.get_default();
    const children = Variable<JSX.Element[]>([]);

    const update = async () => {
        const out = await execAsync(`fish -c "nmcli -t -f name,type c show | sed -nE 's/(.*)\\:.*wireless/\\1/p'"`);
        const saved = out.split("\n");
        const aps = wifi.accessPoints
            .filter(a => a.ssid)
            .sort((a, b) => sortAPs(saved, a, b))
            .map(Network);
        children.set(aps);
    };

    wifi.connect("notify::active-access-point", () => update().catch(console.error));
    wifi.connect("notify::access-points", () => update().catch(console.error));
    update().catch(console.error);

    return (
        <box vertical valign={Gtk.Align.START} className="list" onDestroy={() => children.drop()}>
            {bind(children)}
        </box>
    );
};

const NoNetworks = ({ label }: { label: Binding<string> | string }) => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="wifi_off" />
            <label label={label} />
        </box>
    </box>
);

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
        <box vertical className="networks">
            <box className="header-bar">
                <label label={bind(label)} />
                <box hexpand />
                <button
                    sensitive={network.get_wifi() ? bind(network.wifi, "scanning").as(e => !e) : false}
                    className={network.get_wifi() ? bind(network.wifi, "scanning").as(s => (s ? "enabled" : "")) : ""}
                    cursor="pointer"
                    onClicked={() => network.get_wifi()?.scan()}
                    label={
                        network.get_wifi()
                            ? bind(network.wifi, "scanning").as(s => (s ? "󰀂 Scanning" : "󰀂 Scan"))
                            : "󰀂 Scan"
                    }
                />
            </box>
            {network.get_wifi() ? (
                <stack
                    transitionType={Gtk.StackTransitionType.CROSSFADE}
                    transitionDuration={200}
                    shown={bind(network.wifi, "accessPoints").as(a => (a.length > 0 ? "list" : "empty"))}
                >
                    <NoNetworks
                        label={bind(network.wifi, "enabled").as(p => (p ? "No available networks" : "Wifi is off"))}
                    />
                    <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                        <List />
                    </scrollable>
                </stack>
            ) : (
                <NoNetworks label="Wifi not available" />
            )}
        </box>
    );
};
