import { bind, execAsync, Variable, type Binding } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalWp from "gi://AstalWp";

const Device = ({
    input,
    defaultDevice,
    showDropdown,
    device,
}: {
    input?: boolean;
    defaultDevice: Binding<AstalWp.Endpoint>;
    showDropdown: Variable<boolean>;
    device: AstalWp.Endpoint;
}) => (
    <button
        visible={defaultDevice.get().id !== device.id}
        cursor="pointer"
        onClicked={() => {
            execAsync(`wpctl set-default ${device.id}`).catch(console.error);
            showDropdown.set(false);
        }}
        setup={self => {
            let last: { d: AstalWp.Endpoint; id: number } | null = {
                d: defaultDevice.get(),
                id: defaultDevice
                    .get()
                    .connect("notify::id", () => self.set_visible(defaultDevice.get().id !== device.id)),
            };
            self.hook(defaultDevice, (_, d) => {
                last?.d.disconnect(last.id);
                self.set_visible(d.id !== device.id);
                last = {
                    d,
                    id: d.connect("notify::id", () => self.set_visible(d.id !== device.id)),
                };
            });
            self.connect("destroy", () => last?.d.disconnect(last.id));
        }}
    >
        <box className="device">
            {bind(device, "icon").as(i =>
                Astal.Icon.lookup_icon(i) ? (
                    <icon className="icon" icon={device.icon} />
                ) : (
                    <label className="icon" label={input ? "mic" : "media_output"} />
                )
            )}
            <label truncate label={bind(device, "description")} />
        </box>
    </button>
);

const DefaultDevice = ({ input, device }: { input?: boolean; device: AstalWp.Endpoint }) => (
    <box className="selected">
        <label className="icon" label={input ? "mic" : "media_output"} />
        <box vertical>
            <label
                truncate
                xalign={0}
                label={bind(device, "description").as(d => (input ? "[In] " : "[Out] ") + (d ?? "Unknown"))}
            />
            <label
                xalign={0}
                className="sublabel"
                label={bind(device, "volume").as(v => `Volume ${Math.round(v * 100)}%`)}
            />
        </box>
    </box>
);

const Selector = ({ input, audio }: { input?: boolean; audio: AstalWp.Audio }) => {
    const showDropdown = Variable(false);
    const defaultDevice = bind(audio, input ? "defaultMicrophone" : "defaultSpeaker");

    return (
        <box vertical className="selector">
            <revealer
                transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
                transitionDuration={150}
                revealChild={bind(showDropdown)}
            >
                <box vertical className="list">
                    {bind(audio, input ? "microphones" : "speakers").as(ds =>
                        ds.map(d => (
                            <Device
                                input={input}
                                defaultDevice={defaultDevice}
                                showDropdown={showDropdown}
                                device={d}
                            />
                        ))
                    )}
                    <box className="separator" />
                </box>
            </revealer>
            <button cursor="pointer" onClick={() => showDropdown.set(!showDropdown.get())}>
                {defaultDevice.as(d => (
                    <DefaultDevice input={input} device={d} />
                ))}
            </button>
        </box>
    );
};

const NoWp = () => (
    <box homogeneous>
        <box vertical valign={Gtk.Align.CENTER}>
            <label label="Device selector unavailable" />
            <label className="no-wp-prompt" label="WirePlumber is required for this module" />
        </box>
    </box>
);

export default () => {
    const audio = AstalWp.get_default()?.get_audio();

    if (!audio) return <NoWp />;

    return (
        <box vertical className="device-selector">
            <Selector input audio={audio} />
            <Selector audio={audio} />
        </box>
    );
};
