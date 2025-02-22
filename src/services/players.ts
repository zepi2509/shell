import { GLib, GObject, property, readFile, register, writeFileAsync } from "astal";
import AstalMpris from "gi://AstalMpris";
import { isRealPlayer } from "../utils/mpris";

@register({ GTypeName: "Players" })
export default class Players extends GObject.Object {
    static instance: Players;
    static get_default() {
        if (!this.instance) this.instance = new Players();

        return this.instance;
    }

    readonly #path = `${STATE}/players.txt`;
    readonly #players: AstalMpris.Player[] = [];
    readonly #subs = new Map<
        JSX.Element,
        { signals: string[]; callback: () => void; ids: number[]; player: AstalMpris.Player | null }
    >();

    @property(AstalMpris.Player)
    get lastPlayer(): AstalMpris.Player | null {
        return this.#players.length > 0 && this.#players[0].identity !== null ? this.#players[0] : null;
    }

    /**
     * List of real players.
     */
    @property(Object)
    get list() {
        return this.#players;
    }

    hookLastPlayer(widget: JSX.Element, signal: string, callback: () => void): this;
    hookLastPlayer(widget: JSX.Element, signals: string[], callback: () => void): this;
    hookLastPlayer(widget: JSX.Element, signals: string | string[], callback: () => void) {
        if (!Array.isArray(signals)) signals = [signals];
        // Add subscription
        if (this.lastPlayer)
            this.#subs.set(widget, {
                signals,
                callback,
                ids: signals.map(s => this.lastPlayer!.connect(s, callback)),
                player: this.lastPlayer,
            });
        else this.#subs.set(widget, { signals, callback, ids: [], player: null });

        // Remove subscription on widget destroyed
        widget.connect("destroy", () => {
            const sub = this.#subs.get(widget);
            if (sub?.player) sub.ids.forEach(id => sub.player!.disconnect(id));
            this.#subs.delete(widget);
        });

        // Initial run of callback
        callback();

        // For chaining
        return this;
    }

    makeCurrent(player: AstalMpris.Player) {
        const index = this.#players.indexOf(player);
        // Ignore if already current
        if (index === 0) return;
        // Remove if present
        else if (index > 0) this.#players.splice(index, 1);
        // Connect signals if not already in list (i.e. new player)
        else this.#connectPlayerSignals(player);

        // Add to front
        this.#players.unshift(player);
        this.#updatePlayer();

        // Save to file
        this.#save();
    }

    #updatePlayer() {
        this.notify("last-player");

        for (const sub of this.#subs.values()) {
            sub.callback();
            if (sub.player) sub.ids.forEach(id => sub.player!.disconnect(id));
            sub.ids = this.lastPlayer ? sub.signals.map(s => this.lastPlayer!.connect(s, sub.callback)) : [];
            sub.player = this.lastPlayer;
        }
    }

    #save() {
        writeFileAsync(this.#path, this.#players.map(p => p.busName).join("\n")).catch(console.error);
    }

    #connectPlayerSignals(player: AstalMpris.Player) {
        // Change order on attribute change
        for (const signal of [
            "notify::playback-status",
            "notify::shuffle-status",
            "notify::loop-status",
            "notify::volume",
            "notify::rate",
        ])
            player.connect(signal, () => this.makeCurrent(player));
    }

    constructor() {
        super();

        const mpris = AstalMpris.get_default();

        // Load players
        if (GLib.file_test(this.#path, GLib.FileTest.EXISTS)) {
            this.#players = readFile(this.#path)
                .split("\n")
                .map(p => mpris.players.find(p2 => p2.busName === p))
                .filter(isRealPlayer) as AstalMpris.Player[];
            // Add new players from in between sessions
            for (const player of mpris.players)
                if (!this.#players.includes(player) && isRealPlayer(player)) this.#players.push(player);
        } else {
            const sortOrder = [
                AstalMpris.PlaybackStatus.PLAYING,
                AstalMpris.PlaybackStatus.PAUSED,
                AstalMpris.PlaybackStatus.STOPPED,
            ];
            this.#players = mpris.players
                .filter(isRealPlayer)
                .sort((a, b) => sortOrder.indexOf(a.playbackStatus) - sortOrder.indexOf(b.playbackStatus));
        }
        this.#updatePlayer();
        this.#save();
        // Connect signals to loaded players
        for (const player of this.#players) this.#connectPlayerSignals(player);

        // Add and connect signals when added
        mpris.connect("player-added", (_, player) => {
            if (isRealPlayer(player)) {
                this.makeCurrent(player);
                this.notify("list");
            }
        });

        // Remove when closed
        mpris.connect("player-closed", (_, player) => {
            const index = this.#players.indexOf(player);
            if (index >= 0) {
                this.#players.splice(index, 1);
                this.notify("list");
                if (index === 0) this.#updatePlayer();
                this.#save();
            }
        });
    }
}
