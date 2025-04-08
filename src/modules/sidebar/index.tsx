import type { Monitor } from "@/services/monitors";
import { bind, idle, register, Variable } from "astal";
import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { sidebar as config } from "config";
import Alerts from "./alerts";
import Audio from "./audio";
import Connectivity from "./connectivity";
import Dashboard from "./dashboard";
import Packages from "./packages";
import Time from "./time";

export const paneNames = ["dashboard", "audio", "connectivity", "packages", "alerts", "time"] as const;
export type PaneName = (typeof paneNames)[number];

export const switchPane = (monitor: Monitor, name: PaneName) => {
    const sidebar = App.get_window(`sidebar${monitor.id}`) as SideBar | null;
    if (sidebar) {
        if (sidebar.visible && sidebar.shown.get() === name) sidebar.hide();
        else sidebar.show();
        sidebar.shown.set(name);
    }
};

export const awaitSidebar = (monitor: Monitor) =>
    new Promise<SideBar>(resolve => {
        let sidebar: SideBar | null = null;

        const awaitSidebar = () => {
            sidebar = App.get_window(`sidebar${monitor.id}`) as SideBar | null;
            if (sidebar) resolve(sidebar);
            else idle(awaitSidebar);
        };
        idle(awaitSidebar);
    });

const getPane = (name: PaneName) => {
    if (name === "dashboard") return <Dashboard />;
    if (name === "audio") return <Audio />;
    if (name === "connectivity") return <Connectivity />;
    if (name === "packages") return <Packages />;
    if (name === "alerts") return <Alerts />;
    return <Time />;
};

@register()
export default class SideBar extends Widget.Window {
    readonly shown: Variable<PaneName>;

    constructor({ monitor }: { monitor: Monitor }) {
        super({
            application: App,
            name: `sidebar${monitor.id}`,
            namespace: "caelestia-sidebar",
            monitor: monitor.id,
            anchor: Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM,
            exclusivity: Astal.Exclusivity.EXCLUSIVE,
            visible: false,
        });

        this.shown = Variable(paneNames[0]);

        this.add(
            <eventbox
                onScroll={(_, event) => {
                    if (event.modifier & Gdk.ModifierType.BUTTON1_MASK) {
                        const index = paneNames.indexOf(this.shown.get()) + (event.delta_y < 0 ? -1 : 1);
                        if (index < 0 || index >= paneNames.length) return;
                        this.shown.set(paneNames[index]);
                    }
                }}
            >
                <box vertical className="sidebar">
                    <stack
                        vexpand
                        transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
                        transitionDuration={200}
                        shown={bind(this.shown)}
                    >
                        {paneNames.map(getPane)}
                    </stack>
                </box>
            </eventbox>
        );

        if (config.showOnStartup.get()) idle(() => this.show());
    }
}
