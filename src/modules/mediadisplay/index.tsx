import type { Monitor } from "@/services/monitors";
import Players from "@/services/players";
import { lengthStr } from "@/utils/strings";
import { bind, Variable } from "astal";
import { App, Astal, Gtk } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";
import Visualiser from "./visualiser";

type Selected = Variable<AstalMpris.Player | null>;

const bindIcon = (player: AstalMpris.Player) =>
    bind(player, "identity").as(i => {
        const icon = `caelestia-${i?.toLowerCase().replaceAll(" ", "-")}-symbolic`;
        return Astal.Icon.lookup_icon(icon) ? icon : "caelestia-media-generic-symbolic";
    });

const PlayerButton = ({
    player,
    selected,
    showDropdown,
}: {
    player: AstalMpris.Player;
    selected: Selected;
    showDropdown: Variable<boolean>;
}) => (
    <button
        cursor="pointer"
        onClicked={() => {
            showDropdown.set(false);
            selected.set(player);
        }}
    >
        <box className="identity" halign={Gtk.Align.CENTER}>
            <label label={bind(player, "identity").as(i => i ?? "-")} />
            <label label="•" />
            <label label={bind(player, "title").as(t => t ?? "-")} />
        </box>
    </button>
);

const Selector = ({ player, selected }: { player?: AstalMpris.Player; selected: Selected }) => {
    const showDropdown = Variable(false);

    return (
        <box vertical valign={Gtk.Align.START} className="selector">
            <button
                sensitive={bind(Players.get_default(), "list").as(ps => ps.length > 1)}
                cursor="pointer"
                onClicked={() => showDropdown.set(!showDropdown.get())}
            >
                <box className="identity" halign={Gtk.Align.CENTER}>
                    <icon icon={player ? bindIcon(player) : "caelestia-media-none-symbolic"} />
                    <label label={player ? bind(player, "identity").as(i => i ?? "") : "No media"} />
                </box>
            </button>
            <revealer
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                transitionDuration={150}
                revealChild={bind(showDropdown)}
            >
                <box vertical className="list">
                    {bind(Players.get_default(), "list").as(ps =>
                        ps
                            .filter(p => p !== player)
                            .map(p => <PlayerButton player={p} selected={selected} showDropdown={showDropdown} />)
                    )}
                </box>
            </revealer>
        </box>
    );
};

const NoMedia = ({ selected }: { selected: Selected }) => (
    <box>
        <box homogeneous halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="cover-art">
            <label xalign={0.36} label="" />
        </box>
        <box>
            <box vertical className="details">
                <label truncate xalign={0} className="title" label="No media" />
                <label truncate xalign={0} className="artist" label="Try play something!" />
                <box halign={Gtk.Align.START} className="controls">
                    <button sensitive={false} label="skip_previous" />
                    <button sensitive={false} label="play_arrow" />
                    <button sensitive={false} label="skip_next" />
                </box>
            </box>
            <box className="center-module">
                <overlay
                    expand
                    overlay={<label halign={Gtk.Align.CENTER} valign={Gtk.Align.END} className="time" label="-1:-1" />}
                >
                    <Visualiser />
                </overlay>
            </box>
            <Selector selected={selected} />
        </box>
    </box>
);

const Player = ({ player, selected }: { player: AstalMpris.Player; selected: Selected }) => {
    const time = Variable.derive(
        [bind(player, "position"), bind(player, "length")],
        (p, l) => lengthStr(p) + " / " + lengthStr(l)
    );

    return (
        <box>
            <box
                homogeneous
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.CENTER}
                className="cover-art"
                css={bind(player, "coverArt").as(a => `background-image: url("${a}");`)}
            >
                {bind(player, "coverArt").as(a => (a ? <box visible={false} /> : <label xalign={0.36} label="" />))}
            </box>
            <box>
                <box vertical className="details">
                    <label truncate xalign={0} className="title" label={bind(player, "title").as(t => t ?? "-")} />
                    <label truncate xalign={0} className="artist" label={bind(player, "artist").as(t => t ?? "-")} />
                    <box halign={Gtk.Align.START} className="controls">
                        <button
                            sensitive={bind(player, "canGoPrevious")}
                            cursor="pointer"
                            onClicked={() => player.next()}
                            label="skip_previous"
                        />
                        <button
                            sensitive={bind(player, "canControl")}
                            cursor="pointer"
                            onClicked={() => player.play_pause()}
                            label={bind(player, "playbackStatus").as(s =>
                                s === AstalMpris.PlaybackStatus.PLAYING ? "pause" : "play_arrow"
                            )}
                        />
                        <button
                            sensitive={bind(player, "canGoNext")}
                            cursor="pointer"
                            onClicked={() => player.next()}
                            label="skip_next"
                        />
                    </box>
                </box>
                <box className="center-module">
                    <overlay
                        expand
                        overlay={
                            <label
                                halign={Gtk.Align.CENTER}
                                valign={Gtk.Align.END}
                                className="time"
                                label={bind(time)}
                                onDestroy={() => time.drop()}
                            />
                        }
                    >
                        <Visualiser />
                    </overlay>
                </box>
                <Selector player={player} selected={selected} />
            </box>
        </box>
    );
};

export default ({ monitor }: { monitor: Monitor }) => {
    const selected = Variable(Players.get_default().lastPlayer);
    selected.observe(Players.get_default(), "notify::last-player", () => Players.get_default().lastPlayer);

    return (
        <window
            application={App}
            name={`mediadisplay${monitor.id}`}
            namespace="caelestia-mediadisplay"
            monitor={monitor.id}
            anchor={Astal.WindowAnchor.LEFT | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            visible={false}
        >
            <box className="mediadisplay" onDestroy={() => selected.drop()}>
                {bind(selected).as(p =>
                    p ? <Player player={p} selected={selected} /> : <NoMedia selected={selected} />
                )}
            </box>
        </window>
    );
};
