import { Binding, register } from "astal";
import { Astal, astalify, Gtk, Widget, type ConstructProps } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";
import type { AstalWidget } from "./types";

export const setupCustomTooltip = (self: AstalWidget, text: string | Binding<string>) => {
    if (!text) return null;

    self.set_has_tooltip(true);

    const window = new Widget.Window({
        visible: false,
        namespace: "caelestia-tooltip",
        layer: Astal.Layer.OVERLAY,
        keymode: Astal.Keymode.NONE,
        exclusivity: Astal.Exclusivity.IGNORE,
        anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT,
        child: new Widget.Label({ className: "tooltip", label: text }),
    });
    self.set_tooltip_window(window);

    let lastX = 0;
    window.connect("size-allocate", () => {
        const mWidth = AstalHyprland.get_default().get_focused_monitor().get_width();
        const pWidth = window.get_preferred_width()[1];

        let marginLeft = lastX - pWidth / 2;
        if (marginLeft < 0) marginLeft = 0;
        else if (marginLeft + pWidth > mWidth) marginLeft = mWidth - pWidth;

        window.marginLeft = marginLeft;
    });
    if (text instanceof Binding) self.hook(text, (_, v) => !v && window.hide());

    self.connect("query-tooltip", () => {
        if (text instanceof Binding && !text.get()) return false;
        if (window.visible) return true;

        const mWidth = AstalHyprland.get_default().get_focused_monitor().get_width();
        const pWidth = window.get_preferred_width()[1];
        const { x, y } = AstalHyprland.get_default().get_cursor_position();
        const cursorSize = Gtk.Settings.get_default()?.gtkCursorThemeSize ?? 0;

        let marginLeft = x - pWidth / 2;
        if (marginLeft < 0) marginLeft = 0;
        else if (marginLeft + pWidth > mWidth) marginLeft = mWidth - pWidth;

        window.marginLeft = marginLeft;
        window.marginTop = y + cursorSize;
        lastX = x;

        return true;
    });

    self.connect("destroy", () => window.destroy());

    return window;
};

export const setupChildClickthrough = (self: AstalWidget) =>
    self.connect("size-allocate", () => self.get_window()?.set_child_input_shapes());

@register()
export class MenuItem extends astalify(Gtk.MenuItem) {
    constructor(props: ConstructProps<MenuItem, Gtk.MenuItem.ConstructorProps, { onActivate: [] }>) {
        super(props as any);
    }
}

@register()
export class Calendar extends astalify(Gtk.Calendar) {
    constructor(props: ConstructProps<Calendar, Gtk.Calendar.ConstructorProps>) {
        super(props as any);
    }
}
