import { Binding, register } from "astal";
import { App, Astal, Gdk, Widget } from "astal/gtk3";
import { bar } from "config";
import AstalHyprland from "gi://AstalHyprland";

const extendProp = <T>(
    prop: T | Binding<T | undefined> | undefined,
    override: (prop: T | undefined) => T | undefined
) => prop && (prop instanceof Binding ? prop.as(override) : override(prop));

@register()
export default class PopupWindow extends Widget.Window {
    constructor(props: Widget.WindowProps) {
        super({
            keymode: Astal.Keymode.ON_DEMAND,
            borderWidth: 20, // To allow shadow, cause if not it gets cut off
            ...props,
            visible: false,
            application: App,
            name: props.monitor ? extendProp(props.name, n => (n ? n + props.monitor : undefined)) : props.name,
            namespace: extendProp(props.name, n => `caelestia-${n}`),
            onKeyPressEvent: (self, event) => {
                // Close window on escape
                if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();

                return props.onKeyPressEvent?.(self, event);
            },
        });
    }

    popup_at_widget(widget: JSX.Element, event: Gdk.Event | Astal.ClickEvent) {
        const { width, height } = widget.get_allocation();
        const { width: mWidth, height: mHeight } = AstalHyprland.get_default().get_focused_monitor();
        const pWidth = this.get_preferred_width()[1];
        const pHeight = this.get_preferred_height()[1];
        const [, x, y] = event instanceof Gdk.Event ? event.get_coords() : [null, event.x, event.y];
        const { x: cx, y: cy } = AstalHyprland.get_default().get_cursor_position();

        let marginLeft = 0;
        let marginTop = 0;
        if (bar.vertical.get()) {
            marginLeft = cx + (width - x);
            marginTop = cy + ((height - pHeight) / 2 - y);
            if (marginTop < 0) marginTop = 0;
            else if (marginTop + pHeight > mHeight) marginTop = mHeight - pHeight;
        } else {
            marginLeft = cx + ((width - pWidth) / 2 - x);
            if (marginLeft < 0) marginLeft = 0;
            else if (marginLeft + pWidth > mWidth) marginLeft = mWidth - pWidth;
            marginTop = cy + (height - y);
        }

        this.anchor = Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT;
        this.exclusivity = Astal.Exclusivity.IGNORE;
        this.marginLeft = marginLeft;
        this.marginTop = marginTop;

        this.show();
    }

    popup_at_corner(corner: `${"top" | "bottom"} ${"left" | "right"}`) {
        let anchor = 0;
        if (corner.includes("top")) anchor |= Astal.WindowAnchor.TOP;
        else anchor |= Astal.WindowAnchor.BOTTOM;
        if (corner.includes("left")) anchor |= Astal.WindowAnchor.LEFT;
        else anchor |= Astal.WindowAnchor.RIGHT;

        this.anchor = anchor;
        this.exclusivity = Astal.Exclusivity.NORMAL;
        this.marginLeft = 0;
        this.marginTop = 0;

        this.show();
    }
}
