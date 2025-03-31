import type { Binding } from "astal";
import { Gtk, type Widget } from "astal/gtk3";
import type cairo from "cairo";

type Place = "topleft" | "topright" | "bottomleft" | "bottomright";

export default ({ place, ...rest }: Widget.DrawingAreaProps & { place: Place | Binding<Place> }) => (
    <drawingarea
        {...rest}
        className="screen-corner"
        setup={self => {
            self.connect("realize", () => self.get_window()?.set_pass_through(true));

            const r = self.get_style_context().get_property("border-radius", Gtk.StateFlags.NORMAL) as number;
            self.set_size_request(r, r);
            self.connect("draw", (_, cr: cairo.Context) => {
                const c = self.get_style_context().get_background_color(Gtk.StateFlags.NORMAL);
                const r = self.get_style_context().get_property("border-radius", Gtk.StateFlags.NORMAL) as number;
                self.set_size_request(r, r);

                switch (typeof place === "string" ? place : place.get()) {
                    case "topleft":
                        cr.arc(r, r, r, Math.PI, (3 * Math.PI) / 2);
                        cr.lineTo(0, 0);
                        break;

                    case "topright":
                        cr.arc(0, r, r, (3 * Math.PI) / 2, 2 * Math.PI);
                        cr.lineTo(r, 0);
                        break;

                    case "bottomleft":
                        cr.arc(r, 0, r, Math.PI / 2, Math.PI);
                        cr.lineTo(0, r);
                        break;

                    case "bottomright":
                        cr.arc(0, 0, r, 0, Math.PI / 2);
                        cr.lineTo(r, r);
                        break;
                }

                cr.closePath();
                cr.setSourceRGBA(c.red, c.green, c.blue, c.alpha);
                cr.fill();
            });
        }}
    />
);
