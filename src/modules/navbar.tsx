import type { Monitor } from "@/services/monitors";
import type { AstalWidget } from "@/utils/types";
import { Variable } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import { navbar as config } from "config";
import AstalHyprland from "gi://AstalHyprland";
import SideBar, { awaitSidebar, paneNames, switchPane, type PaneName } from "./sidebar";

const getPaneIcon = (name: PaneName) => {
    if (name === "dashboard") return "dashboard";
    if (name === "audio") return "tune";
    if (name === "connectivity") return "settings_ethernet";
    if (name === "packages") return "package_2";
    if (name === "notifpane") return "notifications";
    return "date_range";
};

const getPaneName = (name: PaneName) => {
    if (name === "dashboard") return "Dash";
    if (name === "audio") return "Audio";
    if (name === "connectivity") return "Conn";
    if (name === "packages") return "Pkgs";
    if (name === "notifpane") return "Alrts";
    return "Time";
};

const hookIsCurrent = (
    self: AstalWidget,
    sidebar: Variable<SideBar | null>,
    name: PaneName,
    callback: (isCurrent: boolean) => void
) => {
    const unsub = sidebar.subscribe(s => {
        if (!s) return;
        self.hook(s.shown, (_, v) => callback(s.visible && v === name));
        self.hook(s, "notify::visible", () => callback(s.visible && s.shown.get() === name));
        callback(s.visible && s.shown.get() === name);
        unsub();
    });
};

const PaneButton = ({
    monitor,
    name,
    sidebar,
}: {
    monitor: Monitor;
    name: PaneName;
    sidebar: Variable<SideBar | null>;
}) => (
    <button
        cursor="pointer"
        onClick={() => switchPane(monitor, name)}
        setup={self => hookIsCurrent(self, sidebar, name, c => self.toggleClassName("current", c))}
    >
        <box vertical className="pane-button">
            <label className="icon" label={getPaneIcon(name)} />
            <revealer
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                transitionDuration={150}
                setup={self => hookIsCurrent(self, sidebar, name, c => self.set_reveal_child(c))}
            >
                <label className="label" label={getPaneName(name)} />
            </revealer>
        </box>
    </button>
);

export default ({ monitor }: { monitor: Monitor }) => {
    const sidebar = Variable<SideBar | null>(null);
    awaitSidebar(monitor).then(s => sidebar.set(s));

    return (
        <window
            namespace="caelestia-navbar"
            monitor={monitor.id}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            visible={config.persistent.get()}
            setup={self => {
                const hyprland = AstalHyprland.get_default();
                const visible = Variable(config.persistent.get());

                visible.poll(100, () => {
                    const width = self.visible
                        ? Math.max(config.appearWidth.get(), self.get_allocated_width())
                        : config.appearWidth.get();
                    return hyprland.get_cursor_position().x < width;
                });
                if (config.persistent.get()) visible.stopPoll();

                self.hook(config.persistent, (_, v) => {
                    if (v) {
                        visible.stopPoll();
                        visible.set(true);
                    } else visible.startPoll();
                });

                self.hook(visible, (_, v) => self.set_visible(v));
                self.connect("destroy", () => visible.drop());
            }}
        >
            <eventbox
                onScroll={(_, event) => {
                    const shown = sidebar.get()?.shown;
                    if (!shown) return;
                    const idx = paneNames.indexOf(shown.get());
                    if (event.delta_y > 0) shown.set(paneNames[Math.min(paneNames.length - 1, idx + 1)]);
                    else shown.set(paneNames[Math.max(0, idx - 1)]);
                }}
            >
                <box vertical className="navbar">
                    {paneNames.map(n => (
                        <PaneButton monitor={monitor} name={n} sidebar={sidebar} />
                    ))}
                </box>
            </eventbox>
        </window>
    );
};
