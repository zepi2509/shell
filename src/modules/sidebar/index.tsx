import type { Monitor } from "@/services/monitors";
import { bind, register, Variable } from "astal";
import { App, Astal, Gtk, Widget } from "astal/gtk3";
import Dashboard from "./dashboard";

@register()
export default class SideBar extends Widget.Window {
    readonly shown: Variable<string> = Variable("dashboard");

    constructor({ monitor }: { monitor: Monitor }) {
        super({
            application: App,
            name: "sidebar",
            namespace: "caelestia-sidebar",
            monitor: monitor.id,
            anchor: Astal.WindowAnchor.LEFT | Astal.WindowAnchor.TOP | Astal.WindowAnchor.BOTTOM,
            exclusivity: Astal.Exclusivity.EXCLUSIVE,
            // visible: false,
        });

        this.add(
            <box vertical className="sidebar">
                <stack
                    vexpand
                    transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
                    transitionDuration={200}
                    shown={bind(this.shown)}
                >
                    <Dashboard />
                </stack>
            </box>
        );
    }
}
