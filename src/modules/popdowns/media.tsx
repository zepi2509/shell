import Players from "@/services/players";
import { isRealPlayer } from "@/utils/mpris";
import PopupWindow from "@/widgets/popupwindow";
import { bind, Variable } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalMpris from "gi://AstalMpris";

const shuffleToIcon = (s: AstalMpris.Shuffle) =>
    `caelestia-${s === AstalMpris.Shuffle.ON ? "shuffle" : "consecutive"}-symbolic`;

const playbackToIcon = (s: AstalMpris.PlaybackStatus) =>
    `caelestia-${s === AstalMpris.PlaybackStatus.PLAYING ? "pause" : "play"}-symbolic`;

const loopToIcon = (s: AstalMpris.Loop) => {
    if (s === AstalMpris.Loop.PLAYLIST) return "caelestia-repeat-symbolic";
    if (s === AstalMpris.Loop.TRACK) return "caelestia-repeat-one-symbolic";
    return "caelestia-no-repeat-symbolic";
};

const lengthStr = (length: number) =>
    `${Math.floor(length / 60)}:${Math.floor(length % 60)
        .toString()
        .padStart(2, "0")}`;

const Player = ({ player }: { player: AstalMpris.Player }) => {
    const background = (
        <box className="background" css={bind(player, "artUrl").as(u => u && `background-image: url("${u}");`)} />
    );
    return (
        <overlay
            overlays={[
                <box className="overlay" />,
                <box
                    vertical
                    className="player"
                    setup={self =>
                        self.connect("size-allocate", () =>
                            background.set_size_request(self.get_preferred_width()[1], self.get_preferred_height()[1])
                        )
                    }
                >
                    <label className="title" label={bind(player, "title").as(t => t ?? "")} />
                    <label className="artist" label={bind(player, "artist").as(a => a ?? "")} />
                    <label className="album" label={bind(player, "album").as(a => a ?? "")} />
                    <box className="controls" halign={Gtk.Align.CENTER}>
                        <button
                            cursor="pointer"
                            onClicked={() => player.shuffle()}
                            sensitive={bind(player, "canControl")}
                        >
                            <icon icon={bind(player, "shuffleStatus").as(shuffleToIcon)} />
                        </button>
                        <button
                            cursor="pointer"
                            onClicked={() => player.previous()}
                            sensitive={bind(player, "canGoPrevious")}
                        >
                            <icon icon="caelestia-skip-previous-symbolic" />
                        </button>
                        <button
                            cursor="pointer"
                            onClicked={() => player.play_pause()}
                            sensitive={bind(player, "canControl")}
                        >
                            <icon icon={bind(player, "playbackStatus").as(playbackToIcon)} />
                        </button>
                        <button cursor="pointer" onClicked={() => player.next()} sensitive={bind(player, "canGoNext")}>
                            <icon icon="caelestia-skip-next-symbolic" />
                        </button>
                        <button cursor="pointer" onClicked={() => player.loop()} sensitive={bind(player, "canControl")}>
                            <icon icon={bind(player, "loopStatus").as(loopToIcon)} />
                        </button>
                    </box>
                    <slider
                        hexpand
                        onDragged={self => player.set_position(self.value * player.length)}
                        setup={self => {
                            const update = () => {
                                self.set_tooltip_text(`${lengthStr(player.position)}/${lengthStr(player.length)}`);
                                self.set_value(player.position / player.length);
                            };
                            self.hook(player, "notify::position", update);
                            self.hook(player, "notify::length", update);
                            update();
                        }}
                    />
                </box>,
            ]}
        >
            {background}
        </overlay>
    );
};

export default () => {
    const shown = Variable("none");
    return (
        <PopupWindow name="media">
            <box className="media">
                <eventbox
                    onClick={(_, event) => {
                        if (event.button === Astal.MouseButton.SECONDARY) {
                            const current = Players.get_default().list.find(p => p.busName === shown.get());
                            if (current) Players.get_default().makeCurrent(current);
                        }
                    }}
                    onScroll={(_, event) => {
                        const players = AstalMpris.get_default().players.filter(isRealPlayer);
                        const idx = players.findIndex(p => p.busName === shown.get());
                        if (idx === -1) return;
                        if (event.delta_y < 0) {
                            if (idx > 0) shown.set(players[idx - 1].busName);
                        } else if (idx < players.length - 1) shown.set(players[idx + 1].busName);
                    }}
                >
                    <stack
                        expand
                        transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                        transitionDuration={150}
                        shown={bind(shown)}
                        setup={self => {
                            const players = new Map<string, JSX.Element>();

                            const addPlayer = (player: AstalMpris.Player) => {
                                if (!isRealPlayer(player) || players.has(player.busName)) return;
                                const widget = <Player player={player} />;
                                self.add_named(widget, player.busName);
                                if (players.size === 0) shown.set(player.busName);
                                players.set(player.busName, widget);
                            };

                            for (const player of Players.get_default().list) addPlayer(player);

                            self.hook(AstalMpris.get_default(), "player-added", (_, player) => addPlayer(player));
                            self.hook(AstalMpris.get_default(), "player-closed", (_, player) => {
                                players.get(player.busName)?.destroy();
                                players.delete(player.busName);
                                if (shown.get() === player.busName)
                                    shown.set(AstalMpris.get_default().players.find(isRealPlayer)?.busName ?? "none");
                            });
                        }}
                    >
                        <box vertical valign={Gtk.Align.CENTER} name="none">
                            <label className="icon" label="music_note" />
                            <label label="No media playing" />
                        </box>
                    </stack>
                </eventbox>
            </box>
        </PopupWindow>
    );
};
