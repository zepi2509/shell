import Cpu from "@/services/cpu";
import Gpu from "@/services/gpu";
import Memory from "@/services/memory";
import Storage from "@/services/storage";
import Slider from "@/widgets/slider";
import { bind, type Binding } from "astal";
import { Gtk, type Widget } from "astal/gtk3";

const fmt = (bytes: number, pow: number) => +(bytes / 1024 ** pow).toFixed(2);
const format = ({ total, used }: { total: number; used: number }) => {
    if (total >= 1024 ** 4) return `${fmt(used, 4)}/${fmt(total, 4)} TiB`;
    if (total >= 1024 ** 3) return `${fmt(used, 3)}/${fmt(total, 3)} GiB`;
    if (total >= 1024 ** 2) return `${fmt(used, 2)}/${fmt(total, 2)} MiB`;
    if (total >= 1024) return `${fmt(used, 1)}/${fmt(total, 1)} KiB`;
    return `${used}/${total} B`;
};

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

export default () => (
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
