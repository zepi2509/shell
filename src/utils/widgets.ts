import { Binding, register } from "astal";
import { Astal, astalify, Gtk, Widget, type ConstructProps } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";
import type { AstalWidget } from "./types";

export const setupCustomTooltip = (
    self: AstalWidget,
    text: string | Binding<string>,
    labelProps: Widget.LabelProps = {}
) => {
    if (!text) return null;

    self.set_has_tooltip(true);

    const window = new Widget.Window({
        visible: false,
        namespace: "caelestia-tooltip",
        layer: Astal.Layer.OVERLAY,
        keymode: Astal.Keymode.NONE,
        exclusivity: Astal.Exclusivity.IGNORE,
        anchor: Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT,
        child: new Widget.Label({ ...labelProps, className: "tooltip", label: text }),
    });
    self.set_tooltip_window(window);

    if (text instanceof Binding) self.hook(text, (_, v) => !v && window.hide());

    const positionWindow = ({ x, y }: { x: number; y: number }) => {
        const { width: mWidth, height: mHeight } = AstalHyprland.get_default().get_focused_monitor();
        const { width: pWidth, height: pHeight } = window.get_preferred_size()[1]!;
        const cursorSize = Gtk.Settings.get_default()?.gtkCursorThemeSize ?? 0;

        let marginLeft = x - pWidth / 2;
        if (marginLeft < 0) marginLeft = 0;
        else if (marginLeft + pWidth > mWidth) marginLeft = mWidth - pWidth;

        let marginTop = y + cursorSize;
        if (marginTop < 0) marginTop = 0;
        else if (marginTop + pHeight > mHeight) marginTop = y - pHeight;

        window.marginLeft = marginLeft;
        window.marginTop = marginTop;
    };

    let lastPos = { x: 0, y: 0 };

    window.connect("size-allocate", () => positionWindow(lastPos));
    self.connect("query-tooltip", () => {
        if (text instanceof Binding && !text.get()) return false;
        if (window.visible) return true;

        const cPos = AstalHyprland.get_default().get_cursor_position();
        positionWindow(cPos);
        lastPos = cPos;

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
export class FlowBox extends astalify(Gtk.FlowBox) {
    constructor(props: ConstructProps<FlowBox, Gtk.FlowBox.ConstructorProps>) {
        super(props as any);
    }
}
