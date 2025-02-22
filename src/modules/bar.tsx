import type { Monitor } from "@/services/monitors";
import Players from "@/services/players";
import Updates from "@/services/updates";
import { getAppCategoryIcon } from "@/utils/icons";
import { ellipsize } from "@/utils/strings";
import { bindCurrentTime, osIcon } from "@/utils/system";
import type { AstalWidget } from "@/utils/types";
import { setupCustomTooltip } from "@/utils/widgets";
import type PopupWindow from "@/widgets/popupwindow";
import { execAsync, Variable } from "astal";
import { bind, kebabify } from "astal/binding";
import { App, Astal, Gtk } from "astal/gtk3";
import { bar as config } from "config";
import AstalBattery from "gi://AstalBattery";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalHyprland from "gi://AstalHyprland";
import AstalNetwork from "gi://AstalNetwork";
import AstalNotifd from "gi://AstalNotifd";
import AstalTray from "gi://AstalTray";
import AstalWp01 from "gi://AstalWp";

const hyprland = AstalHyprland.get_default();

const getBatteryIcon = (perc: number) => {
    if (perc < 0.1) return "󰁺";
    if (perc < 0.2) return "󰁻";
    if (perc < 0.3) return "󰁼";
    if (perc < 0.4) return "󰁽";
    if (perc < 0.5) return "󰁾";
    if (perc < 0.6) return "󰁿";
    if (perc < 0.7) return "󰂀";
    if (perc < 0.8) return "󰂁";
    if (perc < 0.9) return "󰂂";
    return "󰁹";
};

const formatSeconds = (sec: number) => {
    if (sec >= 3600) {
        const hours = Math.floor(sec / 3600);
        let str = `${hours} hour${hours === 1 ? "" : "s"}`;
        const mins = Math.floor((sec % 3600) / 60);
        if (mins > 0) str += ` ${mins} minute${mins === 1 ? "" : "s"}`;
        return str;
    } else if (sec >= 60) {
        const mins = Math.floor(sec / 60);
        return `${mins} minute${mins === 1 ? "" : "s"}`;
    } else return `${sec} second${sec === 1 ? "" : "s"}`;
};

const hookFocusedClientProp = (
    self: AstalWidget,
    prop: keyof AstalHyprland.Client,
    callback: (c: AstalHyprland.Client | null) => void
) => {
    let id: number | null = null;
    let lastClient: AstalHyprland.Client | null = null;
    self.hook(hyprland, "notify::focused-client", () => {
        if (id) lastClient?.disconnect(id);
        lastClient = hyprland.focusedClient; // Can be null
        id = lastClient?.connect(`notify::${kebabify(prop)}`, () => callback(lastClient));
        callback(lastClient);
    });
    self.connect("destroy", () => id && lastClient?.disconnect(id));
    callback(lastClient);
};

const togglePopup = (self: JSX.Element, event: Astal.ClickEvent, name: string) => {
    const popup = App.get_window(name) as PopupWindow | null;
    if (popup) {
        if (popup.visible) popup.hide();
        else popup.popup_at_widget(self, event);
    }
};

const OSIcon = () => (
    <button
        className="module os-icon"
        onClick={(self, event) => event.button === Astal.MouseButton.PRIMARY && togglePopup(self, event, "sideleft")}
    >
        {osIcon}
    </button>
);

const ActiveWindow = () => (
    <box
        vertical={config.vertical}
        className="module active-window"
        setup={self => {
            const title = Variable("");
            const updateTooltip = (c: AstalHyprland.Client | null) =>
                title.set(c?.class && c?.title ? `${c.class}: ${c.title}` : "");
            hookFocusedClientProp(self, "class", updateTooltip);
            hookFocusedClientProp(self, "title", updateTooltip);
            updateTooltip(hyprland.focusedClient);

            const window = setupCustomTooltip(self, bind(title));
            if (window) {
                self.hook(title, (_, v) => !v && window.hide());
                self.hook(window, "map", () => !title.get() && window.hide());
            }
        }}
    >
        <label
            className="icon"
            setup={self =>
                hookFocusedClientProp(self, "class", c => {
                    self.label = c?.class ? getAppCategoryIcon(c.class) : "desktop_windows";
                })
            }
        />
        <label
            angle={config.vertical ? 270 : 0}
            setup={self =>
                hookFocusedClientProp(
                    self,
                    "title",
                    c => (self.label = c?.title ? ellipsize(c.title, config.vertical ? 25 : 40) : "Desktop")
                )
            }
        />
    </box>
);

const MediaPlaying = () => {
    const players = Players.get_default();
    const getLabel = (fallback = "") =>
        players.lastPlayer ? `${players.lastPlayer.title} - ${players.lastPlayer.artist}` : fallback;
    return (
        <button
            onClick={(self, event) => {
                if (event.button === Astal.MouseButton.PRIMARY) {
                    togglePopup(self, event, "media");
                } else if (event.button === Astal.MouseButton.SECONDARY) players.lastPlayer?.play_pause();
                else if (event.button === Astal.MouseButton.MIDDLE) players.lastPlayer?.raise();
            }}
            setup={self => {
                const label = Variable(getLabel());
                players.hookLastPlayer(self, ["notify::title", "notify::artist"], () => label.set(getLabel()));
                setupCustomTooltip(self, bind(label));
            }}
        >
            <box vertical={config.vertical} className="module media-playing">
                <icon
                    setup={self =>
                        players.hookLastPlayer(self, "notify::identity", () => {
                            const icon = `caelestia-${players.lastPlayer?.identity
                                .toLowerCase()
                                .replaceAll(" ", "-")}-symbolic`;
                            self.icon = players.lastPlayer
                                ? Astal.Icon.lookup_icon(icon)
                                    ? icon
                                    : "caelestia-media-generic-symbolic"
                                : "caelestia-media-none-symbolic";
                        })
                    }
                />
                <label
                    angle={config.vertical ? 270 : 0}
                    setup={self =>
                        players.hookLastPlayer(self, ["notify::title", "notify::artist"], () => {
                            self.label = ellipsize(getLabel("No media"), config.vertical ? 25 : 40); // TODO: scroll text when playing or hover
                        })
                    }
                />
            </box>
        </button>
    );
};

const Workspace = ({ idx }: { idx: number }) => {
    let wsId = hyprland.focusedWorkspace
        ? Math.floor((hyprland.focusedWorkspace.id - 1) / config.modules.workspaces.shown) *
              config.modules.workspaces.shown +
          idx
        : idx;
    return (
        <button
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            onClicked={() => hyprland.dispatch("workspace", String(wsId))}
            setup={self => {
                const update = () =>
                    self.toggleClassName(
                        "occupied",
                        hyprland.clients.some(c => c.workspace?.id === wsId)
                    );

                self.hook(hyprland, "notify::focused-workspace", () => {
                    if (!hyprland.focusedWorkspace) return;
                    wsId =
                        Math.floor((hyprland.focusedWorkspace.id - 1) / config.modules.workspaces.shown) *
                            config.modules.workspaces.shown +
                        idx;
                    self.toggleClassName("focused", hyprland.focusedWorkspace.id === wsId);
                    update();
                });
                self.hook(hyprland, "client-added", update);
                self.hook(hyprland, "client-moved", update);
                self.hook(hyprland, "client-removed", update);

                self.toggleClassName("focused", hyprland.focusedWorkspace?.id === wsId);
                update();
            }}
        />
    );
};

const Workspaces = () => (
    <eventbox
        onScroll={(_, event) => {
            const activeWs = hyprland.focusedClient?.workspace.name;
            if (activeWs?.startsWith("special:")) hyprland.dispatch("togglespecialworkspace", activeWs.slice(8));
            else if (event.delta_y > 0 || hyprland.focusedWorkspace?.id > 1)
                hyprland.dispatch("workspace", (event.delta_y < 0 ? "-" : "+") + 1);
        }}
    >
        <box vertical={config.vertical} className="module workspaces">
            {Array.from({ length: config.modules.workspaces.shown }).map((_, idx) => (
                <Workspace idx={idx + 1} /> // Start from 1
            ))}
        </box>
    </eventbox>
);

const TrayItem = (item: AstalTray.TrayItem) => (
    <menubutton
        onButtonPressEvent={(_, event) => event.get_button()[1] === Astal.MouseButton.SECONDARY && item.activate(0, 0)}
        usePopover={false}
        direction={config.vertical ? Gtk.ArrowType.RIGHT : Gtk.ArrowType.DOWN}
        menuModel={bind(item, "menuModel")}
        actionGroup={bind(item, "actionGroup").as(a => ["dbusmenu", a])}
        setup={self => setupCustomTooltip(self, bind(item, "tooltipMarkup"))}
    >
        <icon halign={Gtk.Align.CENTER} gicon={bind(item, "gicon")} />
    </menubutton>
);

const Tray = () => (
    <box
        vertical={config.vertical}
        className="module tray"
        visible={bind(AstalTray.get_default(), "items").as(i => i.length > 0)}
    >
        {bind(AstalTray.get_default(), "items").as(i => i.map(TrayItem))}
    </box>
);

const Network = () => (
    <button
        onClick={(self, event) => {
            const network = AstalNetwork.get_default();
            if (event.button === Astal.MouseButton.PRIMARY) {
                togglePopup(self, event, "networks");
            } else if (event.button === Astal.MouseButton.SECONDARY) network.wifi.enabled = !network.wifi.enabled;
            else if (event.button === Astal.MouseButton.MIDDLE)
                execAsync("uwsm app -- gnome-control-center wifi").catch(() => {
                    network.wifi.scan();
                    execAsync(
                        "uwsm app -- foot -T nmtui fish -c 'sleep .1; set -e COLORTERM; TERM=xterm-old nmtui connect'"
                    ).catch(() => {}); // Ignore errors
                });
        }}
        setup={self => {
            const network = AstalNetwork.get_default();
            const tooltipText = Variable("");
            const update = () => {
                if (network.primary === AstalNetwork.Primary.WIFI) {
                    if (network.wifi.internet === AstalNetwork.Internet.CONNECTED)
                        tooltipText.set(`${network.wifi.ssid} | Strength: ${network.wifi.strength}/100`);
                    else if (network.wifi.internet === AstalNetwork.Internet.CONNECTING)
                        tooltipText.set(`Connecting to ${network.wifi.ssid}`);
                    else tooltipText.set("Disconnected");
                } else if (network.primary === AstalNetwork.Primary.WIRED) {
                    if (network.wired.internet === AstalNetwork.Internet.CONNECTED)
                        tooltipText.set(`Speed: ${network.wired.speed}`);
                    else if (network.wired.internet === AstalNetwork.Internet.CONNECTING) tooltipText.set("Connecting");
                    else tooltipText.set("Disconnected");
                } else {
                    tooltipText.set("Unknown");
                }
            };
            self.hook(network, "notify::primary", update);
            self.hook(network.wifi, "notify::internet", update);
            self.hook(network.wifi, "notify::ssid", update);
            self.hook(network.wifi, "notify::strength", update);
            if (network.wired) {
                self.hook(network.wired, "notify::internet", update);
                self.hook(network.wired, "notify::speed", update);
            }
            update();
            setupCustomTooltip(self, bind(tooltipText));
        }}
    >
        <stack
            transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
            transitionDuration={120}
            shown={bind(AstalNetwork.get_default(), "primary").as(p =>
                p === AstalNetwork.Primary.WIFI ? "wifi" : "wired"
            )}
        >
            <stack
                name="wifi"
                transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
                transitionDuration={120}
                setup={self => {
                    const network = AstalNetwork.get_default();
                    const update = () => {
                        if (network.wifi.internet === AstalNetwork.Internet.CONNECTED)
                            self.shown = String(Math.ceil(network.wifi.strength / 25));
                        else if (network.wifi.internet === AstalNetwork.Internet.CONNECTING) self.shown = "connecting";
                        else self.shown = "disconnected";
                    };
                    self.hook(network.wifi, "notify::internet", update);
                    self.hook(network.wifi, "notify::strength", update);
                    update();
                }}
            >
                <label className="icon" label="wifi_off" name="disconnected" />
                <label className="icon" label="settings_ethernet" name="connecting" />
                <label className="icon" label="signal_wifi_0_bar" name="0" />
                <label className="icon" label="network_wifi_1_bar" name="1" />
                <label className="icon" label="network_wifi_2_bar" name="2" />
                <label className="icon" label="network_wifi_3_bar" name="3" />
                <label className="icon" label="signal_wifi_4_bar" name="4" />
            </stack>
            <stack
                name="wired"
                transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
                transitionDuration={120}
                setup={self => {
                    const network = AstalNetwork.get_default();
                    const update = () => {
                        if (network.primary !== AstalNetwork.Primary.WIRED) return;

                        if (network.wired.internet === AstalNetwork.Internet.CONNECTED) self.shown = "connected";
                        else if (network.wired.internet === AstalNetwork.Internet.CONNECTING) self.shown = "connecting";
                        else self.shown = "disconnected";
                    };
                    self.hook(network, "notify::primary", update);
                    if (network.wired) self.hook(network.wired, "notify::internet", update);
                    update();
                }}
            >
                <label className="icon" label="wifi_off" name="disconnected" />
                <label className="icon" label="settings_ethernet" name="connecting" />
                <label className="icon" label="lan" name="connected" />
            </stack>
        </stack>
    </button>
);

const BluetoothDevice = (device: AstalBluetooth.Device) => (
    <button
        visible={bind(device, "connected")}
        onClick={(self, event) => {
            if (event.button === Astal.MouseButton.PRIMARY) togglePopup(self, event, "bluetooth-devices");
            else if (event.button === Astal.MouseButton.SECONDARY)
                device.disconnect_device((_, res) => device.disconnect_device_finish(res));
            else if (event.button === Astal.MouseButton.MIDDLE)
                execAsync("uwsm app -- blueman-manager").catch(console.error);
        }}
        setup={self => setupCustomTooltip(self, bind(device, "alias"))}
    >
        <icon
            icon={bind(device, "icon").as(i =>
                Astal.Icon.lookup_icon(`${i}-symbolic`) ? `${i}-symbolic` : "caelestia-bluetooth-device-symbolic"
            )}
        />
    </button>
);

const Bluetooth = () => (
    <box vertical={config.vertical} className="bluetooth">
        <button
            onClick={(self, event) => {
                if (event.button === Astal.MouseButton.PRIMARY) togglePopup(self, event, "bluetooth-devices");
                else if (event.button === Astal.MouseButton.SECONDARY) AstalBluetooth.get_default().toggle();
                else if (event.button === Astal.MouseButton.MIDDLE)
                    execAsync("uwsm app -- blueman-manager").catch(console.error);
            }}
            setup={self => {
                const bluetooth = AstalBluetooth.get_default();
                const tooltipText = Variable("");
                const update = () => {
                    const devices = bluetooth.get_devices().filter(d => d.connected);
                    tooltipText.set(
                        devices.length > 0
                            ? `Connected devices: ${devices.map(d => d.alias).join(", ")}`
                            : "No connected devices"
                    );
                };
                const hookDevice = (device: AstalBluetooth.Device) => {
                    self.hook(device, "notify::connected", update);
                    self.hook(device, "notify::alias", update);
                };
                bluetooth.get_devices().forEach(hookDevice);
                self.hook(bluetooth, "device-added", (_, device) => {
                    hookDevice(device);
                    update();
                });
                update();
                setupCustomTooltip(self, bind(tooltipText));
            }}
        >
            <stack
                transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
                transitionDuration={120}
                shown={bind(AstalBluetooth.get_default(), "isPowered").as(p => (p ? "enabled" : "disabled"))}
            >
                <label className="icon" label="bluetooth" name="enabled" />
                <label className="icon" label="bluetooth_disabled" name="disabled" />
            </stack>
        </button>
        {bind(AstalBluetooth.get_default(), "devices").as(d => d.map(BluetoothDevice))}
    </box>
);

const StatusIcons = () => (
    <box vertical={config.vertical} className="module status-icons">
        <Network />
        <Bluetooth />
    </box>
);

const PkgUpdates = () => (
    <button
        onClick={(self, event) => event.button === Astal.MouseButton.PRIMARY && togglePopup(self, event, "updates")}
        setup={self =>
            setupCustomTooltip(
                self,
                bind(Updates.get_default(), "numUpdates").as(n => `${n} update${n === 1 ? "" : "s"} available`)
            )
        }
    >
        <box vertical={config.vertical} className="module pkg-updates">
            <label className="icon" label="download" />
            <label label={bind(Updates.get_default(), "numUpdates").as(String)} />
        </box>
    </button>
);

const NotifCount = () => (
    <button
        onClick={(self, event) =>
            event.button === Astal.MouseButton.PRIMARY && togglePopup(self, event, "notifications")
        }
        setup={self =>
            setupCustomTooltip(
                self,
                bind(AstalNotifd.get_default(), "notifications").as(
                    n => `${n.length} notification${n.length === 1 ? "" : "s"}`
                )
            )
        }
    >
        <box vertical={config.vertical} className="module notif-count">
            <label className="icon" label="info" />
            <label label={bind(AstalNotifd.get_default(), "notifications").as(n => String(n.length))} />
        </box>
    </button>
);

const Battery = () => {
    const className = Variable.derive(
        [bind(AstalBattery.get_default(), "percentage"), bind(AstalBattery.get_default(), "charging")],
        (p, c) => `module battery ${c ? "charging" : p < 0.2 ? "low" : ""}`
    );
    const tooltip = Variable.derive(
        [bind(AstalBattery.get_default(), "timeToEmpty"), bind(AstalBattery.get_default(), "timeToFull")],
        (e, f) => (f > 0 ? `${formatSeconds(f)} until full` : `${formatSeconds(e)} remaining`)
    );

    return (
        <box
            vertical={config.vertical}
            className={bind(className)}
            setup={self => setupCustomTooltip(self, bind(tooltip))}
            onDestroy={() => {
                className.drop();
                tooltip.drop();
            }}
        >
            <label className="icon" label={bind(AstalBattery.get_default(), "percentage").as(getBatteryIcon)} />
            <label label={bind(AstalBattery.get_default(), "percentage").as(p => `${Math.round(p * 100)}%`)} />
        </box>
    );
};

const DateTime = () => (
    <button
        onClick={(self, event) => event.button === Astal.MouseButton.PRIMARY && togglePopup(self, event, "sideright")}
        setup={self => setupCustomTooltip(self, bindCurrentTime(config.modules.dateTime.detailedFormat))}
    >
        <box className="module date-time">
            <label className="icon" label="calendar_month" />
            <label label={bindCurrentTime(config.modules.dateTime.format)} />
        </box>
    </button>
);

const DateTimeVertical = () => (
    <button
        onClick={(self, event) => event.button === Astal.MouseButton.PRIMARY && togglePopup(self, event, "sideright")}
        setup={self => setupCustomTooltip(self, bindCurrentTime(config.modules.dateTime.detailedFormat))}
    >
        <box vertical className="module date-time">
            <label className="icon" label="calendar_month" />
            <label label={bindCurrentTime("%H")} />
            <label label={bindCurrentTime("%M")} />
        </box>
    </button>
);

const Power = () => (
    <button
        className="module power"
        label="power_settings_new"
        onClick={(_, event) => event.button === Astal.MouseButton.PRIMARY && App.toggle_window("session")}
    />
);

export default ({ monitor }: { monitor: Monitor }) => (
    <window
        namespace="caelestia-bar"
        monitor={monitor.id}
        anchor={
            Astal.WindowAnchor.TOP |
            Astal.WindowAnchor.LEFT |
            (config.vertical ? Astal.WindowAnchor.BOTTOM : Astal.WindowAnchor.RIGHT)
        }
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
    >
        <centerbox vertical={config.vertical} className={`bar ${config.vertical ? "vertical" : " horizontal"}`}>
            <box vertical={config.vertical}>
                {config.modules.osIcon.enabled && <OSIcon />}
                {config.modules.activeWindow.enabled && <ActiveWindow />}
                {config.modules.mediaPlaying.enabled && <MediaPlaying />}
                <button
                    expand
                    onScroll={(_, event) =>
                        event.delta_y > 0 ? (monitor.brightness -= 0.1) : (monitor.brightness += 0.1)
                    }
                />
            </box>
            {config.modules.workspaces.enabled && <Workspaces />}
            <box vertical={config.vertical}>
                <button
                    expand
                    onScroll={(_, event) => {
                        const speaker = AstalWp01.get_default()?.audio.defaultSpeaker;
                        if (!speaker) return;
                        speaker.mute = false;
                        if (event.delta_y > 0) speaker.volume -= 0.1;
                        else speaker.volume += 0.1;
                    }}
                />
                {config.modules.tray.enabled && <Tray />}
                {config.modules.statusIcons.enabled && <StatusIcons />}
                {config.modules.pkgUpdates.enabled && <PkgUpdates />}
                {config.modules.notifCount.enabled && <NotifCount />}
                {config.modules.battery.enabled && AstalBattery.get_default().isBattery && <Battery />}
                {config.modules.dateTime.enabled && (config.vertical ? <DateTimeVertical /> : <DateTime />)}
                {config.modules.power.enabled && <Power />}
            </box>
        </centerbox>
    </window>
);
