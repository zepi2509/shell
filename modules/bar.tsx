import { execAsync, GLib, register, Variable } from "astal";
import { bind, kebabify } from "astal/binding";
import { App, Astal, astalify, Gdk, Gtk, type ConstructProps } from "astal/gtk3";
import AstalBluetooth from "gi://AstalBluetooth";
import AstalHyprland from "gi://AstalHyprland";
import AstalNetwork from "gi://AstalNetwork";
import AstalNotifd from "gi://AstalNotifd";
import AstalTray from "gi://AstalTray";
import { bar as config } from "../config";
import type { Monitor } from "../services/monitors";
import Players from "../services/players";
import Updates from "../services/updates";
import { getAppCategoryIcon } from "../utils/icons";
import { ellipsize } from "../utils/strings";
import { osIcon } from "../utils/system";
import { setupCustomTooltip } from "../utils/widgets";

const hyprland = AstalHyprland.get_default();

const hookFocusedClientProp = (
    self: any, // Ugh why is there no base Widget type
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

const OSIcon = () => <label className="module os-icon" label={osIcon} />;

const ActiveWindow = () => (
    <box
        hasTooltip
        className="module active-window"
        setup={self => {
            const title = Variable(hyprland.focusedClient?.title ?? "");
            hookFocusedClientProp(self, "title", c => title.set(c?.title ?? ""));

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
            setup={self =>
                hookFocusedClientProp(self, "title", c => (self.label = c?.title ? ellipsize(c.title) : "Desktop"))
            }
        />
    </box>
);

const MediaPlaying = () => {
    const players = Players.get_default();
    const getLabel = (fallback = "") =>
        players.lastPlayer ? `${players.lastPlayer.title} - ${players.lastPlayer.artist}` : fallback;
    return (
        <box
            className="module media-playing"
            setup={self => {
                const label = Variable(getLabel());
                players.hookLastPlayer(self, ["notify::title", "notify::artist"], () => label.set(getLabel()));
                setupCustomTooltip(self, bind(label));
            }}
        >
            <icon
                setup={self =>
                    players.hookLastPlayer(self, "notify::identity", () => {
                        const icon = `caelestia-${players.lastPlayer?.identity.toLowerCase()}-symbolic`;
                        self.icon = players.lastPlayer
                            ? Astal.Icon.lookup_icon(icon)
                                ? icon
                                : "caelestia-media-generic-symbolic"
                            : "caelestia-media-none-symbolic";
                    })
                }
            />
            <label
                setup={self =>
                    players.hookLastPlayer(self, ["notify::title", "notify::artist"], () => {
                        self.label = ellipsize(getLabel("No media")); // TODO: scroll text
                    })
                }
            />
        </box>
    );
};

const Workspace = ({ idx }: { idx: number }) => {
    let wsId = Math.floor((hyprland.focusedWorkspace.id - 1) / config.wsPerGroup) * config.wsPerGroup + idx;
    return (
        <button
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.CENTER}
            onClicked={() => hyprland.dispatch("workspace", String(wsId))}
            setup={self => {
                const update = () => {
                    self.toggleClassName(
                        "occupied",
                        hyprland.clients.some(c => c.workspace.id === wsId)
                    );
                    self.toggleClassName("focused", hyprland.focusedWorkspace.id === wsId);
                };

                self.hook(hyprland, "notify::focused-workspace", () => {
                    wsId = Math.floor((hyprland.focusedWorkspace.id - 1) / config.wsPerGroup) * config.wsPerGroup + idx;
                    update();
                });
                self.hook(hyprland, "client-added", update);
                self.hook(hyprland, "client-moved", update);
                self.hook(hyprland, "client-removed", update);

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
            else if (event.delta_y > 0 || hyprland.focusedWorkspace.id > 1)
                hyprland.dispatch("workspace", (event.delta_y < 0 ? "-" : "+") + 1);
        }}
    >
        <box className="module workspaces">
            {Array.from({ length: config.wsPerGroup }).map((_, idx) => (
                <Workspace idx={idx + 1} /> // Start from 1
            ))}
        </box>
    </eventbox>
);

@register()
class TrayItemMenu extends astalify(Gtk.Menu) {
    constructor(props: ConstructProps<TrayItemMenu, Gtk.Menu.ConstructorProps> & { item: AstalTray.TrayItem }) {
        const { item, ...sProps } = props;
        super(sProps as any);

        this.hook(item, "notify::menu-model", () => this.bind_model(item.menuModel, null, true));
        this.hook(item, "notify::action-group", () => this.insert_action_group("dbusmenu", item.actionGroup));
        this.bind_model(item.menuModel, null, true);
        this.insert_action_group("dbusmenu", item.actionGroup);
    }
}

const TrayItem = (item: AstalTray.TrayItem) => {
    const menu = (<TrayItemMenu item={item} />) as TrayItemMenu;
    return (
        <button
            onClick={(self, event) => {
                if (event.button === Astal.MouseButton.PRIMARY) {
                    if (item.isMenu) menu.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
                    else item.activate(0, 0);
                } else if (event.button === Astal.MouseButton.SECONDARY)
                    menu.popup_at_widget(self, Gdk.Gravity.SOUTH, Gdk.Gravity.NORTH, null);
            }}
            onScroll={(_, event) => {
                if (event.delta_x !== 0) item.scroll(event.delta_x, "horizontal");
                if (event.delta_y !== 0) item.scroll(event.delta_y, "vertical");
            }}
            onDestroy={() => menu.destroy()}
            setup={self => setupCustomTooltip(self, bind(item, "tooltipMarkup"))}
        >
            <icon halign={Gtk.Align.CENTER} gicon={bind(item, "gicon")} />
        </button>
    );
};

const Tray = () => <box className="module tray">{bind(AstalTray.get_default(), "items").as(i => i.map(TrayItem))}</box>;

const Network = () => (
    <button
        onClick={(_, event) => {
            const network = AstalNetwork.get_default();
            if (event.button === Astal.MouseButton.PRIMARY) {
                // TODO: networks panel
            } else if (event.button === Astal.MouseButton.SECONDARY) network.wifi.enabled = !network.wifi.enabled;
            else if (event.button === Astal.MouseButton.MIDDLE)
                execAsync("uwsm app -- gnome-control-center wifi").catch(() => {
                    network.wifi.scan();
                    execAsync(
                        "uwsm app -- foot -T nmtui fish -c 'sleep .1; set -e COLORTERM; TERM=xterm-old nmtui connect'"
                    ).catch(err => {
                        // Idk why but foot always throws this error when it opens
                        if (
                            err.message !==
                            "warn: wayland.c:1619: compositor does not implement the XDG toplevel icon protocol\nwarn: terminal.c:1973: slave exited with signal 1 (Hangup)"
                        )
                            console.error(err);
                    });
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

const Bluetooth = () => (
    <button
        onClick={(_, event) => {
            if (event.button === Astal.MouseButton.PRIMARY) {
                // TODO: bluetooth panel
            } else if (event.button === Astal.MouseButton.SECONDARY) AstalBluetooth.get_default().toggle();
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
);

const StatusIcons = () => (
    <box className="module status-icons">
        <Network />
        <Bluetooth />
    </box>
);

const PkgUpdates = () => (
    <box
        className="module updates"
        setup={self =>
            setupCustomTooltip(
                self,
                bind(Updates.get_default(), "numUpdates").as(n => `${n} update${n === 1 ? "" : "s"} available`)
            )
        }
    >
        <label className="icon" label="download" />
        <label label={bind(Updates.get_default(), "numUpdates").as(String)} />
    </box>
);

const Notifications = () => {
    const unreadCount = Variable(0);
    return (
        <box
            className="module notifications"
            setup={self =>
                setupCustomTooltip(
                    self,
                    bind(unreadCount).as(n => `${n} unread notification${n === 1 ? "" : "s"}`)
                )
            }
        >
            <label className="icon" label="info" />
            <label
                label="0"
                setup={self => {
                    const notifd = AstalNotifd.get_default();
                    let notifsOpen = false;
                    let unread = new Set<number>();

                    self.hook(notifd, "notified", (self, id, replaced) => {
                        if (!notifsOpen && !replaced) {
                            unread.add(id);
                            unreadCount.set(unread.size);
                            self.label = String(unread.size);
                        }
                    });
                    self.hook(notifd, "resolved", (self, id) => {
                        if (unread.delete(id)) {
                            unreadCount.set(unread.size);
                            self.label = String(unread.size);
                        }
                    });
                    self.hook(App, "window-toggled", (_, window) => {
                        if (window.name === "notifications") {
                            notifsOpen = window.visible;
                            if (notifsOpen) {
                                unread.clear();
                                unreadCount.set(0);
                            }
                        }
                    });
                }}
            />
        </box>
    );
};

const DateTime = () => (
    <box className="module date-time">
        <label className="icon" label="calendar_month" />
        <label
            setup={self => {
                const pollVar = Variable(null).poll(5000, () => {
                    self.label =
                        GLib.DateTime.new_now_local().format(config.dateTimeFormat) ?? new Date().toLocaleString();
                    return null;
                });
                self.connect("destroy", () => pollVar.drop());
            }}
        />
    </box>
);

const Power = () => (
    <button
        className="module power"
        label="power_settings_new"
        onClicked={() => execAsync("fish -c 'pkill wlogout || wlogout -p layer-shell'").catch(console.error)}
    />
);

export default ({ monitor }: { monitor: Monitor }) => (
    <window
        namespace="caelestia-bar"
        monitor={monitor.id}
        anchor={Astal.WindowAnchor.TOP}
        exclusivity={Astal.Exclusivity.EXCLUSIVE}
    >
        <centerbox className="bar" css={"min-width: " + monitor.width * 0.8 + "px;"}>
            <box halign={Gtk.Align.START}>
                <OSIcon />
                <ActiveWindow />
                <MediaPlaying />
            </box>
            <Workspaces />
            <box halign={Gtk.Align.END}>
                <Tray />
                <StatusIcons />
                <PkgUpdates />
                <Notifications />
                <DateTime />
                <Power />
            </box>
        </centerbox>
    </window>
);
