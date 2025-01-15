import { timeout, Variable, type Time } from "astal";
import { Astal, Gtk, type Widget } from "astal/gtk3";
import cairo from "cairo";
import AstalWp from "gi://AstalWp";
import Pango from "gi://Pango";
import PangoCairo from "gi://PangoCairo";
import { osds as config } from "../config";
import { type Monitor } from "../services/monitors";
import { PopupWindow } from "../utils/widgets";

const getStyle = (context: Gtk.StyleContext, prop: string) => context.get_property(prop, Gtk.StateFlags.NORMAL);
const getNumStyle = (context: Gtk.StyleContext, prop: string) => getStyle(context, prop) as number;

const mix = (a: number, b: number, r: number) => a * r + b * (1 - r);

const pangoWeightToStr = (weight: Pango.Weight) => {
    switch (weight) {
        case Pango.Weight.ULTRALIGHT:
            return "UltraLight";
        case Pango.Weight.LIGHT:
            return "Light";
        case Pango.Weight.BOLD:
            return "Bold";
        case Pango.Weight.ULTRABOLD:
            return "UltraBold";
        case Pango.Weight.HEAVY:
            return "Heavy";
        default:
            return "Normal";
    }
};

const SliderOsd = ({
    fillIcons,
    monitor,
    type,
    windowSetup,
    className = "",
    initValue,
    drawAreaSetup,
}: {
    fillIcons?: boolean;
    monitor: Monitor;
    type: keyof typeof config;
    windowSetup: (self: Widget.Window, hideAfterTimeout: () => void) => void;
    className?: string;
    initValue: number;
    drawAreaSetup: (self: Widget.DrawingArea, icon: Variable<string>) => void;
}) => (
    <PopupWindow
        name={type}
        monitor={monitor.id}
        keymode={Astal.Keymode.NONE}
        anchor={config[type].position}
        margin={config[type].margin}
        setup={self => {
            let time: Time | null = null;
            const hideAfterTimeout = () => {
                time?.cancel();
                time = timeout(config[type].hideDelay, () => self.hide());
            };
            self.connect("show", hideAfterTimeout);
            windowSetup(self, hideAfterTimeout);
        }}
    >
        <box className={type}>
            <drawingarea
                className={`inner ${className}`}
                css={"font-size: " + initValue + "px;"}
                setup={self => {
                    const halfPi = Math.PI / 2;
                    const vertical =
                        config[type].position === Astal.WindowAnchor.LEFT ||
                        config[type].position === Astal.WindowAnchor.RIGHT;

                    const icon = Variable("");
                    drawAreaSetup(self, icon);

                    // Init size
                    const styleContext = self.get_style_context();
                    const width = getNumStyle(styleContext, "min-width");
                    const height = getNumStyle(styleContext, "min-height");
                    if (vertical) self.set_size_request(height, width);
                    else self.set_size_request(width, height);

                    let fontDesc: Pango.FontDescription | null = null;

                    self.connect("draw", (_, cr: cairo.Context) => {
                        const styleContext = self.get_style_context();

                        let width = getNumStyle(styleContext, "min-width");
                        let height = getNumStyle(styleContext, "min-height");

                        const progressValue = getNumStyle(styleContext, "font-size");
                        let radius = getNumStyle(styleContext, "border-radius");
                        // Flatten when near 0, do before swap cause its simpler
                        radius = Math.min(radius, Math.min(width * progressValue, height) / 2);

                        if (vertical) [width, height] = [height, width]; // Swap if vertical
                        self.set_size_request(width, height);

                        const progressPosition = vertical
                            ? height * (1 - progressValue) + radius // Top is 0, but we want it to start from the bottom
                            : width * progressValue - radius;

                        const bg = styleContext.get_background_color(Gtk.StateFlags.NORMAL);
                        cr.setSourceRGBA(bg.red, bg.green, bg.blue, bg.alpha);

                        if (vertical) {
                            cr.arc(radius, progressPosition, radius, -Math.PI, -halfPi); // Top left
                            cr.arc(width - radius, progressPosition, radius, -halfPi, 0); // Top right
                            cr.arc(width - radius, height - radius, radius, 0, halfPi); // Bottom right
                        } else {
                            cr.arc(radius, radius, radius, -Math.PI, -halfPi); // Top left
                            cr.arc(progressPosition, radius, radius, -halfPi, 0); // Top right
                            cr.arc(progressPosition, height - radius, radius, 0, halfPi); // Bottom right
                        }
                        cr.arc(radius, height - radius, radius, halfPi, Math.PI); // Bottom left
                        cr.fill();

                        const parent = self.get_parent();
                        if (parent) {
                            if (fontDesc === null) {
                                const pContext = parent.get_style_context();
                                const families = (getStyle(pContext, "font-family") as string[]).join(",");
                                const weight = pangoWeightToStr(getStyle(pContext, "font-weight") as Pango.Weight);
                                const size = getNumStyle(pContext, "font-size");
                                fontDesc = Pango.font_description_from_string(`${families} ${weight} ${size}px`);
                                // Ugh GTK CSS doesn't support font-variations, so you need to manually create the layout and font desc instead of using Gtk.Widget#create_pango_layout
                                if (fillIcons) fontDesc.set_variations("FILL=1");
                            }

                            const layout = PangoCairo.create_layout(cr);
                            layout.set_font_description(fontDesc);
                            layout.set_text(icon.get(), -1);

                            const [w, h] = layout.get_pixel_size();
                            let diff;
                            if (vertical) {
                                diff = (progressValue * height) / h;
                                cr.moveTo((width - w) / 2, Math.min(height - h, progressPosition - h / 2 + radius));
                            } else {
                                diff = (progressValue * width) / w;
                                cr.moveTo(Math.max(0, progressPosition - w / 2 - radius), (height - h) / 2);
                            }
                            diff = Math.max(0, Math.min(1, diff));

                            const fg = styleContext.get_color(Gtk.StateFlags.NORMAL);
                            cr.setSourceRGBA(
                                mix(fg.red, bg.red, diff),
                                mix(fg.green, bg.green, diff),
                                mix(fg.blue, bg.blue, diff),
                                mix(fg.alpha, bg.alpha, diff)
                            );

                            cr.setAntialias(cairo.Antialias.BEST);
                            PangoCairo.show_layout(cr, layout);
                        }
                    });
                }}
            />
        </box>
    </PopupWindow>
);

const Volume = ({ monitor, audio }: { monitor: Monitor; audio: AstalWp.Audio }) => (
    <SliderOsd
        fillIcons
        monitor={monitor}
        type="volume"
        windowSetup={(self, hideAfterTimeout) => {
            self.hook(audio.defaultSpeaker, "notify::volume", () => {
                self.show();
                hideAfterTimeout();
            });
        }}
        className={audio.defaultSpeaker.mute ? "mute" : ""}
        initValue={audio.defaultSpeaker.volume}
        drawAreaSetup={(self, icon) => {
            const updateIcon = () => {
                if (/head(phone|set)/i.test(audio.defaultSpeaker.icon)) icon.set("headphones");
                else if (audio.defaultSpeaker.mute) icon.set("no_sound");
                else if (audio.defaultSpeaker.volume === 0) icon.set("volume_mute");
                else if (audio.defaultSpeaker.volume <= 0.5) icon.set("volume_down");
                else icon.set("volume_up");
            };
            updateIcon();
            self.hook(audio.defaultSpeaker, "notify::icon", updateIcon);
            self.hook(audio.defaultSpeaker, "notify::mute", () => {
                updateIcon();
                self.toggleClassName("mute", audio.defaultSpeaker.mute);
            });
            self.hook(audio.defaultSpeaker, "notify::volume", () => {
                updateIcon();
                self.css = `font-size: ${audio.defaultSpeaker.volume}px`;
            });
        }}
    />
);

const Brightness = ({ monitor }: { monitor: Monitor }) => (
    <SliderOsd
        monitor={monitor}
        type="brightness"
        windowSetup={(self, hideAfterTimeout) => {
            self.hook(monitor, "notify::brightness", () => {
                self.show();
                hideAfterTimeout();
            });
        }}
        initValue={monitor.brightness}
        drawAreaSetup={(self, icon) => {
            const update = () => {
                if (monitor.brightness > 0.66) icon.set("brightness_high");
                else if (monitor.brightness > 0.33) icon.set("brightness_medium");
                else if (monitor.brightness > 0) icon.set("brightness_low");
                else icon.set("brightness_empty");
                self.css = `font-size: ${monitor.brightness}px`;
            };
            self.hook(monitor, "notify::brightness", update);
            update();
        }}
    />
);

export default ({ monitor }: { monitor: Monitor }) => {
    if (AstalWp.get_default()) <Volume monitor={monitor} audio={AstalWp.get_default()!.audio} />;
    <Brightness monitor={monitor} />;

    return null;
};
