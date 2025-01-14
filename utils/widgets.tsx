import { Binding, property, register, timeout } from "astal";
import { App, Astal, Gdk, Gtk, Widget } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";

export const setupCustomTooltip = (self: any, text: string | Binding<string>) => {
    if (!text) return null;

    const window = (
        <window
            visible={false}
            namespace="tooltip"
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

export enum TransitionType {
    FADE = "",
    SLIDE_DOWN = "margin-top: -${height}px; margin-bottom: ${height}px;",
    SLIDE_UP = "margin-top: ${height}px; margin-bottom: -${height}px;",
    SLIDE_RIGHT = "margin-left: -${width}px; margin-right: ${width}px;",
    SLIDE_LEFT = "margin-left: ${width}px; margin-right: -${width}px;",
}

@register()
export class PopupWindow extends Widget.Window {
    readonly transitionType: TransitionType;
    readonly transitionInDuration: number;
    readonly transitionOutDuration: number;
    readonly transitionAmount: number;

    readonly #content: Widget.Box;
    #visible: boolean = false;

    @property(Boolean)
    get realVisible() {
        return this.#visible;
    }

    set realVisible(v: boolean) {
        if (v) this.show();
        else this.hide();
    }

    constructor(
        props: Widget.WindowProps & {
            transitionType?: TransitionType;
            transitionInDuration?: number;
            transitionOutDuration?: number;
            transitionAmount?: number;
        }
    ) {
        const {
            clickThrough,
            child,
            halign = Gtk.Align.START,
            valign = Gtk.Align.START,
            transitionType = TransitionType.FADE,
            transitionInDuration = 300,
            transitionOutDuration = 200,
            transitionAmount = 0.2,
            ...sProps
        } = props;

        sProps.visible = false;
        sProps.application = App;
        sProps.namespace = `caelestia-${props.name}`;
        sProps.anchor =
            Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT;
        sProps.exclusivity = Astal.Exclusivity.IGNORE;
        if (!sProps.keymode) sProps.keymode = Astal.Keymode.ON_DEMAND;
        sProps.onKeyPressEvent = (self, event) => {
            // Close window on escape
            if (event.get_keyval()[1] === Gdk.KEY_Escape) self.hide();

            return props.onKeyPressEvent?.(self, event);
        };
        super(sProps);

        this.transitionType = transitionType;
        this.transitionInDuration = transitionInDuration;
        this.transitionOutDuration = transitionOutDuration;
        this.transitionAmount = transitionAmount;

        // Wrapper box for animations
        this.#content = (
            <box halign={halign} valign={valign} className={`${props.name}-wrapper`}>
                {clickThrough ? <eventbox>{child}</eventbox> : child}
            </box>
        ) as Widget.Box;
        this.#content.css = this.#getTransitionCss(false);
        this.add(this.#content);

        if (clickThrough) setupChildClickthrough(this);
    }

    #getTransitionCss(visible: boolean) {
        return (
            `transition-duration: ${visible ? this.transitionInDuration : this.transitionOutDuration}ms;` +
            (visible
                ? "opacity: 1;" + this.transitionType.replaceAll("${width}", "0").replaceAll("${height}", "0")
                : "opacity: 0;" +
                  this.transitionType
                      .replaceAll("${width}", String(this.#content.get_preferred_width()[1] * this.transitionAmount))
                      .replaceAll("${height}", String(this.#content.get_preferred_height()[1] * this.transitionAmount)))
        );
    }

    show() {
        this.#visible = true;
        this.notify("real-visible");

        super.show();
        this.#content.toggleClassName("visible", true);
        this.#content.css = this.#getTransitionCss(true);
    }

    hide() {
        this.#visible = false;
        this.notify("real-visible");

        this.#content.toggleClassName("visible", false);
        this.#content.css = this.#getTransitionCss(false);
        timeout(this.transitionOutDuration, () => !this.#visible && super.hide());
    }

    toggle() {
        if (this.#visible) this.hide();
        else this.show();
    }
}
