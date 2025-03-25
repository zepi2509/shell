import Players from "@/services/players";
import { osIcon, osId } from "@/utils/system";
import Slider from "@/widgets/slider";
import { bind, GLib, monitorFile, Variable } from "astal";
import { Gtk } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import Notifications from "./modules/notifications";

const lengthStr = (length: number) =>
    `${Math.floor(length / 60)}:${Math.floor(length % 60)
        .toString()
        .padStart(2, "0")}`;

const FaceFallback = () => (
    <label
        setup={self => {
            const name = GLib.get_real_name();
            if (name !== "Unknown")
                self.label = name
                    .split(" ")
                    .map(s => s[0].toUpperCase())
                    .join("");
            else {
                self.label = "";
                self.xalign = 0.44;
            }
        }}
    />
);

const User = () => {
    const uptime = Variable("").poll(5000, "uptime -p");
    const hasFace = Variable(GLib.file_test(HOME + "/.face", GLib.FileTest.EXISTS));
    monitorFile(HOME + "/.face", () => hasFace.set(GLib.file_test(HOME + "/.face", GLib.FileTest.EXISTS)));

    return (
        <box className="user">
            <box
                homogeneous
                className="face"
                setup={self => {
                    self.css = `background-image: url("${HOME}/.face");`;
                    monitorFile(HOME + "/.face", () => (self.css = `background-image: url("${HOME}/.face");`));
                }}
                onDestroy={() => hasFace.drop()}
            >
                {bind(hasFace).as(h => (h ? <box visible={false} /> : <FaceFallback />))}
            </box>
            <box vertical hexpand valign={Gtk.Align.CENTER} className="details">
                <label xalign={0} className="name" label={`${osIcon} ${GLib.get_user_name()}`} />
                <label xalign={0} label={(GLib.getenv("XDG_CURRENT_DESKTOP") ?? osId).toUpperCase()} />
                <label truncate xalign={0} className="uptime" label={bind(uptime)} onDestroy={() => uptime.drop()} />
            </box>
        </box>
    );
};

const QuickToggles = () => <box></box>;

const Media = ({ player }: { player: AstalMpris.Player }) => {
    const position = Variable.derive([bind(player, "position"), bind(player, "length")], (p, l) => p / l);

    return (
        <box className="media" onDestroy={() => position.drop()}>
            <box
                homogeneous
                className="cover-art"
                css={bind(player, "coverArt").as(a => `background-image: url("${a}");`)}
            >
                {bind(player, "coverArt").as(a => (a ? <box visible={false} /> : <label xalign={0.31} label="" />))}
            </box>
            <box vertical className="details">
                <label truncate className="title" label={bind(player, "title")} />
                <label truncate className="artist" label={bind(player, "artist")} />
                <box hexpand className="controls">
                    <button
                        hexpand
                        sensitive={bind(player, "canGoPrevious")}
                        cursor="pointer"
                        onClicked={() => player.next()}
                        label="󰒮"
                    />
                    <button
                        hexpand
                        sensitive={bind(player, "canControl")}
                        cursor="pointer"
                        onClicked={() => player.play_pause()}
                        label={bind(player, "playbackStatus").as(s =>
                            s === AstalMpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊"
                        )}
                    />
                    <button
                        hexpand
                        sensitive={bind(player, "canGoNext")}
                        cursor="pointer"
                        onClicked={() => player.next()}
                        label="󰒭"
                    />
                </box>
                <Slider value={bind(position)} />
                <box className="time">
                    <label label={bind(player, "position").as(lengthStr)} />
                    <box hexpand />
                    <label label={bind(player, "length").as(lengthStr)} />
                </box>
            </box>
        </box>
    );
};

const Today = () => <box></box>;

export default () => (
    <box vertical className="pane dashboard" name="dashboard">
        <User />
        <box className="separator" />
        {bind(Players.get_default(), "lastPlayer").as(p => (
            <Media player={p} />
        ))}
        <box className="separator" />
        <Notifications />
    </box>
);
