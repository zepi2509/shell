import { bind, execAsync, Variable } from "astal";
import { Gtk } from "astal/gtk3";
import AstalWp from "gi://AstalWp";

interface IStream {
    stream: AstalWp.Endpoint;
    playing: boolean;
}

const header = (audio: AstalWp.Audio, key: "streams" | "speakers" | "recorders") =>
    `${audio[key].length} ${audio[key].length === 1 ? key.slice(0, -1) : key}`;

const sortStreams = (a: IStream, b: IStream) => {
    if (a.playing || b.playing) return a.playing ? -1 : 1;
    return 0;
};

const Stream = ({ stream, playing }: IStream) => (
    <box className={`stream ${playing ? "playing" : ""}`}>
        <icon className="icon" icon={bind(stream, "icon")} />
        <box vertical hexpand>
            <label truncate xalign={0} label={bind(stream, "name")} />
            <label truncate xalign={0} className="sublabel" label={bind(stream, "description")} />
        </box>
        <button valign={Gtk.Align.CENTER} cursor="pointer" onClicked={() => (stream.volume -= 0.05)} label="-" />
        <slider
            showFillLevel
            restrictToFillLevel={false}
            fillLevel={2 / 3}
            cursor="pointer"
            value={bind(stream, "volume").as(v => v * (2 / 3))}
            setup={self => self.connect("value-changed", () => stream.set_volume(self.value * 1.5))}
        />
        <button valign={Gtk.Align.CENTER} cursor="pointer" onClicked={() => (stream.volume += 0.05)} label="+" />
    </box>
);

const List = ({ audio }: { audio: AstalWp.Audio }) => {
    const streams = Variable<IStream[]>([]);

    const update = async () => {
        const paStreams = JSON.parse(await execAsync("pactl -f json list sink-inputs"));
        streams.set(
            audio.streams.map(s => ({
                stream: s,
                playing: paStreams.find((p: any) => p.properties["object.serial"] == s.serial)?.corked === false,
            }))
        );
    };

    streams.watch("pactl -f json subscribe", out => {
        if (JSON.parse(out).on === "sink-input") update().catch(console.error);
        return streams.get();
    });
    audio.connect("notify::streams", () => update().catch(console.error));

    return (
        <box vertical valign={Gtk.Align.START} className="list" onDestroy={() => streams.drop()}>
            {bind(streams).as(ps => ps.sort(sortStreams).map(s => <Stream stream={s.stream} playing={s.playing} />))}
        </box>
    );
};

const NoSources = ({ icon, label }: { icon: string; label: string }) => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label={icon} />
            <label label={label} />
        </box>
    </box>
);

const NoWp = () => (
    <box vexpand homogeneous>
        <box vertical valign={Gtk.Align.CENTER}>
            <NoSources icon="no_sound" label="Audio module unavailable" />
            <label className="no-wp-prompt" label="WirePlumber is required for this module" />
        </box>
    </box>
);

export default () => {
    const audio = AstalWp.get_default()?.get_audio();

    if (!audio) return <NoWp />;

    const label = Variable("");

    label.observe(
        ["streams", "speakers", "recorders"].map(k => [audio, `notify::${k}`]),
        () => `${header(audio, "streams")} • ${header(audio, "speakers")} • ${header(audio, "recorders")}`
    );

    return (
        <box vertical className="streams" onDestroy={() => label.drop()}>
            <box className="header-bar">
                <label label={bind(label)} />
            </box>
            <stack
                transitionType={Gtk.StackTransitionType.CROSSFADE}
                transitionDuration={200}
                shown={bind(audio, "streams").as(s => (s.length > 0 ? "list" : "empty"))}
            >
                <NoSources icon="stream" label="No audio sources" />
                <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                    <List audio={audio} />
                </scrollable>
            </stack>
        </box>
    );
};
