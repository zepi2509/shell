import { bind, type Binding } from "astal";
import { Gdk, Gtk, type Widget } from "astal/gtk3";
import type cairo from "cairo";

export default ({
    value,
    onChange,
}: {
    value: Binding<number>;
    onChange?: (self: Widget.DrawingArea, value: number) => void;
}) => (
    <drawingarea
        hexpand
        valign={Gtk.Align.CENTER}
        className="slider"
        css={bind(value).as(v => `font-size: ${v}px;`)}
        setup={self => {
            const halfPi = Math.PI / 2;

            const styleContext = self.get_style_context();
            self.set_size_request(-1, styleContext.get_property("min-height", Gtk.StateFlags.NORMAL) as number);

            self.connect("draw", (_, cr: cairo.Context) => {
                const styleContext = self.get_style_context();

                const width = self.get_allocated_width();
                const height = styleContext.get_property("min-height", Gtk.StateFlags.NORMAL) as number;
                self.set_size_request(-1, height);

                const progressValue = styleContext.get_property("font-size", Gtk.StateFlags.NORMAL) as number;
                let radius = styleContext.get_property("border-radius", Gtk.StateFlags.NORMAL) as number;

                const bg = styleContext.get_background_color(Gtk.StateFlags.NORMAL);
                cr.setSourceRGBA(bg.red, bg.green, bg.blue, bg.alpha);

                // Background
                cr.arc(radius, radius, radius, -Math.PI, -halfPi); // Top left
                cr.arc(width - radius, radius, radius, -halfPi, 0); // Top right
                cr.arc(width - radius, height - radius, radius, 0, halfPi); // Bottom right
                cr.arc(radius, height - radius, radius, halfPi, Math.PI); // Bottom left
                cr.fill();

                // Flatten when near 0
                radius = Math.min(radius, Math.min(width * progressValue, height) / 2);

                const progressPosition = width * progressValue - radius;
                const fg = styleContext.get_color(Gtk.StateFlags.NORMAL);
                cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);

                // Foreground
                cr.arc(radius, radius, radius, -Math.PI, -halfPi); // Top left
                cr.arc(progressPosition, radius, radius, -halfPi, 0); // Top right
                cr.arc(progressPosition, height - radius, radius, 0, halfPi); // Bottom right
                cr.arc(radius, height - radius, radius, halfPi, Math.PI); // Bottom left
                cr.fill();
            });

            self.add_events(Gdk.EventMask.BUTTON_PRESS_MASK);
            self.connect("button-press-event", (_, event: Gdk.Event) =>
                onChange?.(self, event.get_coords()[1] / self.get_allocated_width())
            );
        }}
    />
);
