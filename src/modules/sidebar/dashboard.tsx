import Players from "@/services/players";
import { osIcon, osId } from "@/utils/system";
import Slider from "@/widgets/slider";
import { bind, GLib, monitorFile, Variable } from "astal";
import { Gtk } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import Notifications from "./modules/notifications";
import Upcoming from "./modules/upcoming";

const lengthStr = (length: number) =>
    `${Math.floor(length / 60)}:${Math.floor(length % 60)
        .toString()
        .padStart(2, "0")}`;

const noNull = (s: string | null) => s ?? "-";

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

const Media = ({ player }: { player: AstalMpris.Player | null }) => {
    const position = player
        ? Variable.derive([bind(player, "position"), bind(player, "length")], (p, l) => p / l)
        : Variable(0);

    return (
        <box className="media" onDestroy={() => position.drop()}>
            <box
                homogeneous
                className="cover-art"
                css={player ? bind(player, "coverArt").as(a => `background-image: url("${a}");`) : ""}
            >
                {player ? (
                    bind(player, "coverArt").as(a => (a ? <box visible={false} /> : <label xalign={0.31} label="" />))
                ) : (
                    <label xalign={0.31} label="" />
                )}
            </box>
            <box vertical className="details">
                <label truncate className="title" label={player ? bind(player, "title").as(noNull) : ""} />
                <label truncate className="artist" label={player ? bind(player, "artist").as(noNull) : "No media"} />
                <box hexpand className="controls">
                    <button
                        hexpand
                        sensitive={player ? bind(player, "canGoPrevious") : false}
                        cursor="pointer"
                        onClicked={() => player?.next()}
                        label="󰒮"
                    />
                    <button
                        hexpand
                        sensitive={player ? bind(player, "canControl") : false}
                        cursor="pointer"
                        onClicked={() => player?.play_pause()}
                        label={
                            player
                                ? bind(player, "playbackStatus").as(s =>
                                      s === AstalMpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊"
                                  )
                                : "󰐊"
                        }
                    />
                    <button
                        hexpand
                        sensitive={player ? bind(player, "canGoNext") : false}
                        cursor="pointer"
                        onClicked={() => player?.next()}
                        label="󰒭"
                    />
                </box>
                <Slider value={bind(position)} />
                <box className="time">
                    <label label={player ? bind(player, "position").as(lengthStr) : "-1:-1"} />
                    <box hexpand />
                    <label label={player ? bind(player, "length").as(lengthStr) : "-1:-1"} />
                </box>
            </box>
        </box>
    );
};

export default () => (
    <box vertical className="pane dashboard" name="dashboard">
        <User />
        <box className="separator" />
        {bind(Players.get_default(), "lastPlayer").as(p => (
            <Media player={p} />
        ))}
        <box className="separator" />
        <Notifications compact />
        <box className="separator" />
        <Upcoming />
    </box>
);
