import Cpu from "@/services/cpu";
import Gpu from "@/services/gpu";
import Memory from "@/services/memory";
import Storage from "@/services/storage";
import { osId } from "@/utils/system";
import PopupWindow from "@/widgets/popupwindow";
import { bind, execAsync, GLib, type Binding } from "astal";
import { App, Gtk, type Widget } from "astal/gtk3";
import type cairo from "cairo";
import { sideleft } from "config";

const fmt = (bytes: number, pow: number) => +(bytes / 1024 ** pow).toFixed(2);
const format = ({ total, used }: { total: number; used: number }) => {
    if (total >= 1024 ** 4) return `${fmt(used, 4)}/${fmt(total, 4)} TiB`;
    if (total >= 1024 ** 3) return `${fmt(used, 3)}/${fmt(total, 3)} GiB`;
    if (total >= 1024 ** 2) return `${fmt(used, 2)}/${fmt(total, 2)} MiB`;
    if (total >= 1024) return `${fmt(used, 1)}/${fmt(total, 1)} KiB`;
    return `${used}/${total} B`;
};

const User = () => (
    <box className="user">
        <box
            valign={Gtk.Align.CENTER}
            className="face"
            css={`
                background-image: url("${HOME}/.face");
            `}
        >
            {!GLib.file_test(HOME + "/.face", GLib.FileTest.EXISTS) && (
                <label
                    setup={self => {
                        const name = GLib.get_real_name();
                        if (name !== "Unknown")
                            self.label = name
                                .split(" ")
                                .map(s => s[0].toUpperCase())
                                .join("");
                        else self.label = "";
                    }}
                />
            )}
        </box>
        <box vertical hexpand valign={Gtk.Align.CENTER} className="details">
            <label xalign={0} className="name" label={GLib.get_user_name()} />
            <label xalign={0} label={(GLib.getenv("XDG_CURRENT_DESKTOP") ?? osId).toUpperCase()} />
        </box>
        <button
            valign={Gtk.Align.CENTER}
            className="power"
            cursor="pointer"
            onClicked={() => App.toggle_window("session")}
            label="power_settings_new"
        />
    </box>
);

const QuickLaunch = () => (
    <box className="quick-launch">
        <box vertical>
            <box>{/* <button  */}</box> // TODO
        </box>
    </box>
);

const Location = ({ label, num }: { label: Binding<string>; num: number }) => (
    <button
        className={"loc" + num}
        cursor="pointer"
        onClicked={self => {
            self.get_toplevel().hide();
            const dir = label.get().split(" ").at(-1);
            execAsync(`xdg-open ${HOME}/${dir?.toLowerCase() === "home" ? "" : `${dir}/`}`).catch(console.error);
        }}
    >
        <label xalign={0} label={label} />
    </button>
);

const Locations = () => (
    <box className="locations">
        <box vertical>
            <Location label={bind(sideleft.directories.left.top)} num={1} />
            <Location label={bind(sideleft.directories.left.middle)} num={2} />
            <Location label={bind(sideleft.directories.left.bottom)} num={3} />
        </box>
        <box vertical>
            <Location label={bind(sideleft.directories.right.top)} num={4} />
            <Location label={bind(sideleft.directories.right.middle)} num={5} />
            <Location label={bind(sideleft.directories.right.bottom)} num={6} />
        </box>
    </box>
);

const Slider = ({ value }: { value: Binding<number> }) => (
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
        }}
    />
);

const Resource = ({
    icon,
    name,
    value,
    labelSetup,
}: {
    icon: string;
    name: string;
    value: Binding<number>;
    labelSetup?: (self: Widget.Label) => void;
}) => (
    <box vertical className={`resource ${name}`}>
        <box className="inner">
            <label label={icon} />
            <Slider value={value.as(v => v / 100)} />
        </box>
        <label halign={Gtk.Align.END} label={labelSetup ? "" : value.as(v => `${+v.toFixed(2)}%`)} setup={labelSetup} />
    </box>
);

const HwResources = () => (
    <box vertical className="hw-resources">
        {Gpu.get_default().available && <Resource icon="󰢮" name="gpu" value={bind(Gpu.get_default(), "usage")} />}
        <Resource icon="" name="cpu" value={bind(Cpu.get_default(), "usage")} />
        <Resource
            icon=""
            name="memory"
            value={bind(Memory.get_default(), "usage")}
            labelSetup={self => {
                const mem = Memory.get_default();
                const update = () => (self.label = format(mem));
                self.hook(mem, "notify::used", update);
                self.hook(mem, "notify::total", update);
                update();
            }}
        />
        <Resource
            icon="󰋊"
            name="storage"
            value={bind(Storage.get_default(), "usage")}
            labelSetup={self => {
                const storage = Storage.get_default();
                const update = () => (self.label = format(storage));
                self.hook(storage, "notify::used", update);
                self.hook(storage, "notify::total", update);
                update();
            }}
        />
    </box>
);

export default () => (
    <PopupWindow name="sideleft">
        <box vertical className="sideleft">
            <User />
            {/* <QuickLaunch /> */}
            <Locations />
            <HwResources />
        </box>
    </PopupWindow>
);
