import type { Monitor } from "@/services/monitors";
import { bind, idle, register, Variable } from "astal";
import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import { sidebar as config } from "config";
import Connectivity from "./connectivity";
import Dashboard from "./dashboard";
import NotifPane from "./notifpane";

@register()
export default class SideBar extends Widget.Window {
    readonly shown: Variable<string>;

    constructor({ monitor }: { monitor: Monitor }) {
        super({
            application: App,
            name: "sidebar",
            namespace: "caelestia-sidebar",
            monitor: monitor.id,
            anchor: Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM,
            exclusivity: Astal.Exclusivity.EXCLUSIVE,
            visible: false,
        });

        const panes = [<Dashboard />, <Connectivity />, <NotifPane />];
        this.shown = Variable(panes[0].name);

        this.add(
            <eventbox
                onScroll={(_, event) => {
                    if (event.modifier & Gdk.ModifierType.BUTTON1_MASK) {
                        const index = panes.findIndex(p => p.name === this.shown.get()) + (event.delta_y < 0 ? -1 : 1);
                        if (index < 0 || index >= panes.length) return;
                        this.shown.set(panes[index].name);
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
                        {panes}
                    </stack>
                </box>
            </eventbox>
        );

        if (config.showOnStartup.get()) idle(() => this.show());
    }
}
