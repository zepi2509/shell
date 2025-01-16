import { Binding, register } from "astal";
import { App, Astal, Gdk, Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

export const setupCustomTooltip = (self: any, text: string | Binding<string>) => {
    if (!text) return null;

    const window = (
        <window
            visible={false}
            namespace="caelestia-tooltip"
            keymode={Astal.Keymode.NONE}
            exclusivity={Astal.Exclusivity.IGNORE}
            anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT}
        >
            <label className="tooltip" label={text} />
        </window>
    ) as Widget.Window;
    self.set_tooltip_window(window);

    let dirty = true;
    let lastX = 0;
    self.connect("size-allocate", () => (dirty = true));
    window.connect("size-allocate", () => {
        window.marginLeft = lastX + (self.get_allocated_width() - window.get_preferred_width()[1]) / 2;
    });
    if (text instanceof Binding) self.hook(text, (_: any, v: string) => !v && window.hide());

    self.connect("query-tooltip", (_: any, x: number, y: number) => {
        if (text instanceof Binding && !text.get()) return false;
        if (dirty) {
            const { width, height } = self.get_allocation();
            const { x: cx, y: cy } = AstalHyprland.get_default().get_cursor_position();
            window.marginLeft = cx + ((width - window.get_preferred_width()[1]) / 2 - x);
            window.marginTop = cy + (height - y);
            lastX = cx - x;
            dirty = false;
        }
        return true;
    });

    self.connect("destroy", () => window.destroy());

    return window;
};

export const setupChildClickthrough = (self: any) =>
    self.connect("size-allocate", () => self.get_window()?.set_child_input_shapes());

const extendProp = <T,>(
    prop: T | Binding<T | undefined> | undefined,
    override: (prop: T | undefined) => T | undefined
) => prop && (prop instanceof Binding ? prop.as(override) : override(prop));

@register()
export class PopupWindow extends Widget.Window {
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
