import { Binding, register } from "astal";
import { App, Astal, Gdk, Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

const extendProp = <T>(
    prop: T | Binding<T | undefined> | undefined,
    override: (prop: T | undefined) => T | undefined
) => prop && (prop instanceof Binding ? prop.as(override) : override(prop));

@register()
export default class PopupWindow extends Widget.Window {
    constructor(props: Widget.WindowProps) {
        super({
            keymode: Astal.Keymode.ON_DEMAND,
            exclusivity: Astal.Exclusivity.IGNORE,
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
            borderWidth: 20, // To allow shadow, cause if not it gets cut off
        });
    }

    popup_at_widget(widget: JSX.Element, event: Gdk.Event) {
        const { width, height } = widget.get_allocation();
        const [_, x, y] = event.get_coords();
        const { x: cx, y: cy } = AstalHyprland.get_default().get_cursor_position();
        this.marginLeft = cx + ((width - this.get_preferred_width()[1]) / 2 - x);
        this.marginTop = cy + (height - y);
        this.show();
    }
}
