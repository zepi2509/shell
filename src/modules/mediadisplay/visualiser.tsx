import { Gtk } from "astal/gtk3";
import cairo from "cairo";
import AstalCava from "gi://AstalCava";
import PangoCairo from "gi://PangoCairo";

export default () => (
    <drawingarea
        className="visualiser"
        setup={self => {
            const cava = AstalCava.get_default();

            if (cava) {
                cava.set_stereo(true);
                cava.set_noise_reduction(0.77);
                cava.set_input(AstalCava.Input.PIPEWIRE);

                self.hook(cava, "notify::values", () => self.queue_draw());
                self.connect("size-allocate", () => {
                    const width = self.get_allocated_width();
                    const barWidth = self
                        .get_style_context()
                        .get_property("min-width", Gtk.StateFlags.NORMAL) as number;
                    const gaps = self.get_style_context().get_margin(Gtk.StateFlags.NORMAL).right;
                    const bars = Math.floor((width - gaps) / (barWidth + gaps));
                    if (bars > 0) cava.set_bars(bars % 2 ? bars : bars - 1);
                });
            }

            self.connect("draw", (_, cr: cairo.Context) => {
                const { width, height } = self.get_allocation();

                if (!cava) {
                    // Show error text if cava unavailable
                    const fg = self.get_style_context().get_color(Gtk.StateFlags.NORMAL);
                    cr.setSourceRGBA(fg.red, fg.green, fg.blue, fg.alpha);
                    const layout = self.create_pango_layout("Visualiser module requires Cava");
                    const [w, h] = layout.get_pixel_size();
                    cr.moveTo((width - w) / 2, (height - h) / 2);
                    cr.setAntialias(cairo.Antialias.BEST);
                    PangoCairo.show_layout(cr, layout);

                    return;
                }

                const bg = self.get_style_context().get_background_color(Gtk.StateFlags.NORMAL);
                cr.setSourceRGBA(bg.red, bg.green, bg.blue, bg.alpha);
                const barWidth = self.get_style_context().get_property("min-width", Gtk.StateFlags.NORMAL) as number;
                const gaps = self.get_style_context().get_margin(Gtk.StateFlags.NORMAL).right;

                const values = cava.get_values();
                const len = values.length - 1;
                const radius = barWidth / 2;
                const xOff = (width - len * (barWidth + gaps) - gaps) / 2 - radius;
                const center = height / 2;
                const half = len / 2;

                const renderPill = (x: number, value: number) => {
                    x = x * (barWidth + gaps) + xOff;
                    value *= center;
                    cr.arc(x, center + value, radius, 0, Math.PI);
                    cr.arc(x, center - value, radius, Math.PI, Math.PI * 2);
                    cr.fill();
                };

                // Render channels facing each other
                for (let i = half - 1; i >= 0; i--) renderPill(half - i, values[i]);
                for (let i = half; i < len; i++) renderPill(i + 1, values[i]);
            });
        }}
    />
);
