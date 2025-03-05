import { Apps } from "@/services/apps";
import Palette from "@/services/palette";
import Schemes, { type Colours } from "@/services/schemes";
import Wallpapers from "@/services/wallpapers";
import { basename } from "@/utils/strings";
import { notify } from "@/utils/system";
import { setupCustomTooltip, type FlowBox } from "@/utils/widgets";
import { execAsync, GLib, readFile, register, type Variable } from "astal";
import { Gtk, Widget } from "astal/gtk3";
import { launcher as config } from "config";
import fuzzysort from "fuzzysort";
import AstalHyprland from "gi://AstalHyprland";
import { close, ContentBox, type LauncherContent, type Mode } from "./util";

interface IAction {
    icon: string;
    name: string;
    description: string;
    action: (...args: string[]) => void;
    available?: () => boolean;
}

interface ActionMap {
    [k: string]: IAction;
}

const autocomplete = (entry: Widget.Entry, action: string) => {
    entry.set_text(`${config.actionPrefix.get()}${action} `);
    entry.set_position(-1);
};

const actions = (mode: Variable<Mode>, entry: Widget.Entry): ActionMap => ({
    apps: {
        icon: "apps",
        name: "Apps",
        description: "Search for apps",
        action: () => {
            mode.set("apps");
            entry.set_text("");
        },
    },
    files: {
        icon: "folder",
        name: "Files",
        description: "Search for files",
        action: () => {
            mode.set("files");
            entry.set_text("");
        },
    },
    math: {
        icon: "calculate",
        name: "Math",
        description: "Do math calculations",
        action: () => {
            mode.set("math");
            entry.set_text("");
        },
    },
    windows: {
        icon: "select_window",
        name: "Windows",
        description: "Manage open windows",
        action: () => {
            mode.set("windows");
            entry.set_text("");
        },
    },
    light: {
        icon: "light_mode",
        name: "Light",
        description: "Change scheme to light mode",
        action: () => {
            Palette.get_default().switchMode("light");
            close();
        },
        available: () => Palette.get_default().hasMode("light"),
    },
    dark: {
        icon: "dark_mode",
        name: "Dark",
        description: "Change scheme to dark mode",
        action: () => {
            Palette.get_default().switchMode("dark");
            close();
        },
        available: () => Palette.get_default().hasMode("dark"),
    },
    scheme: {
        icon: "palette",
        name: "Scheme",
        description: "Change the current colour scheme",
        action: () => autocomplete(entry, "scheme"),
    },
    wallpaper: {
        icon: "image",
        name: "Wallpaper",
        description: "Change the current wallpaper",
        action: () => autocomplete(entry, "wallpaper"),
    },
    todo: {
        icon: "checklist",
        name: "Todo",
        description: "Create a todo in Todoist",
        action: (...args) => {
            // If no args, autocomplete cmd
            if (args.length === 0) return autocomplete(entry, "todo");

            // If tod not installed, notify
            if (!GLib.find_program_in_path("tod")) {
                notify({
                    summary: "Tod not installed",
                    body: "The launcher todo subcommand requires `tod`. Install it with `yay -S tod-bin`",
                    icon: "dialog-warning-symbolic",
                    urgency: "critical",
                    actions: {
                        Install: () => execAsync("uwsm app -T -- yay -S tod-bin").catch(console.error),
                    },
                });
                close();
                return;
            }

            // If tod not configured, notify
            let token = null;
            try {
                token = JSON.parse(readFile(GLib.get_user_config_dir() + "/tod.cfg")).token;
            } catch {} // Ignore
            if (!token) {
                notify({
                    summary: "Tod not configured",
                    body: "You need to configure tod first. Run any tod command to do this.",
                    icon: "dialog-warning-symbolic",
                    urgency: "critical",
                });
            } else {
                // Create todo and notify if configured
                execAsync(`tod t q -c ${args.join(" ")}`).catch(console.error);
                if (config.todo.notify.get())
                    notify({
                        summary: "Todo created",
                        body: `Created todo with content: ${args.join(" ")}`,
                        icon: "view-list-bullet-symbolic",
                        urgency: "low",
                        transient: true,
                        actions: {
                            "Copy content": () => execAsync(`wl-copy -- ${args.join(" ")}`).catch(console.error),
                            View: () => {
                                const client = AstalHyprland.get_default().clients.find(c => c.class === "Todoist");
                                if (client) client.focus();
                                else execAsync("uwsm app -- todoist").catch(console.error);
                            },
                        },
                    });
            }

            close();
        },
    },
    reload: {
        icon: "refresh",
        name: "Reload",
        description: "Reload app list",
        action: () => {
            Apps.reload();
            entry.set_text("");
        },
    },
    lock: {
        icon: "lock",
        name: "Lock",
        description: "Lock the current session",
        action: () => {
            execAsync("loginctl lock-session").catch(console.error);
            close();
        },
    },
    logout: {
        icon: "logout",
        name: "Logout",
        description: "End the current session",
        action: () => {
            execAsync("uwsm stop").catch(console.error);
            close();
        },
    },
    sleep: {
        icon: "bedtime",
        name: "Sleep",
        description: "Suspend then hibernate",
        action: () => {
            execAsync("systemctl suspend-then-hibernate").catch(console.error);
            close();
        },
    },
    reboot: {
        icon: "cached",
        name: "Reboot",
        description: "Restart the machine",
        action: () => {
            execAsync("systemctl reboot").catch(console.error);
            close();
        },
    },
    hibernate: {
        icon: "downloading",
        name: "Hibernate",
        description: "Suspend to RAM",
        action: () => {
            execAsync("systemctl hibernate").catch(console.error);
            close();
        },
    },
    shutdown: {
        icon: "power_settings_new",
        name: "Shutdown",
        description: "Suspend to disk",
        action: () => {
            execAsync("systemctl poweroff").catch(console.error);
            close();
        },
    },
});

const Action = ({ args, icon, name, description, action }: IAction & { args: string[] }) => (
    <Gtk.FlowBoxChild visible canFocus={false}>
        <button
            className="result"
            cursor="pointer"
            onClicked={() => action(...args)}
            setup={self => setupCustomTooltip(self, description)}
        >
            <box>
                <label className="icon" label={icon} />
                <box vertical className="has-sublabel">
                    <label truncate xalign={0} label={name} />
                    <label truncate xalign={0} label={description} className="sublabel" />
                </box>
            </box>
        </button>
    </Gtk.FlowBoxChild>
);

const Swatch = ({ colour }: { colour: string }) => <box className="swatch" css={"background-color: " + colour + ";"} />;

const Scheme = ({ scheme, name, colours }: { scheme?: string; name: string; colours?: Colours }) => {
    const palette = colours![Palette.get_default().mode] ?? colours!.light ?? colours!.dark!;
    return (
        <Gtk.FlowBoxChild visible canFocus={false}>
            <button
                className="result"
                cursor="pointer"
                onClicked={() => {
                    execAsync(`caelestia scheme ${scheme ?? ""} ${name}`).catch(console.error);
                    close();
                }}
            >
                <box>
                    <box valign={Gtk.Align.CENTER}>
                        <box className="swatch big left" css={"background-color: " + palette.base + ";"} />
                        <box className="swatch big right" css={"background-color: " + palette.accent + ";"} />
                    </box>
                    <box vertical className="has-sublabel">
                        <label truncate xalign={0} label={scheme ? `${scheme} (${name})` : name} />
                        <box className="swatches">
                            <Swatch colour={palette.rosewater} />
                            <Swatch colour={palette.flamingo} />
                            <Swatch colour={palette.pink} />
                            <Swatch colour={palette.mauve} />
                            <Swatch colour={palette.red} />
                            <Swatch colour={palette.maroon} />
                            <Swatch colour={palette.peach} />
                            <Swatch colour={palette.yellow} />
                            <Swatch colour={palette.green} />
                            <Swatch colour={palette.teal} />
                            <Swatch colour={palette.sky} />
                            <Swatch colour={palette.sapphire} />
                            <Swatch colour={palette.blue} />
                            <Swatch colour={palette.lavender} />
                        </box>
                    </box>
                </box>
            </button>
        </Gtk.FlowBoxChild>
    );
};

const Wallpaper = ({ path, thumbnail }: { path: string; thumbnail?: string }) => (
    <Gtk.FlowBoxChild visible canFocus={false}>
        <button
            className="result"
            cursor="pointer"
            onClicked={() => {
                execAsync(`caelestia wallpaper -f ${path}`).catch(console.error);
                close();
            }}
            setup={self => setupCustomTooltip(self, path.replace(HOME, "~"))}
        >
            <box
                vertical={config.wallpaper.style.get() !== "compact"}
                className={`wallpaper ${config.wallpaper.style.get()}`}
            >
                <box className="thumbnail" css={"background-image: url('" + (thumbnail ?? path) + "');"} />
                <label truncate label={basename(path)} />
            </box>
        </button>
    </Gtk.FlowBoxChild>
);

@register()
export default class Actions extends Widget.Box implements LauncherContent {
    #map: ActionMap;
    #list: string[];

    #content: FlowBox;

    constructor(mode: Variable<Mode>, entry: Widget.Entry) {
        super({ name: "actions", className: "actions" });

        this.#map = actions(mode, entry);
        this.#list = Object.keys(this.#map);

        this.#content = (<ContentBox />) as FlowBox;

        this.add(
            <scrollable expand hscroll={Gtk.PolicyType.NEVER}>
                {this.#content}
            </scrollable>
        );
    }

    updateContent(search: string): void {
        this.#content.foreach(c => c.destroy());
        const args = search.split(" ");
        const action = args[0].slice(1).toLowerCase();

        if (action === "scheme") {
            const scheme = args[1] ?? "";
            const schemes = Object.values(Schemes.get_default().map)
                .flatMap(s => (s.colours ? s.name : Object.values(s.flavours!).map(f => `${f.scheme}-${f.name}`)))
                .filter(s => s !== undefined);
            for (const { target } of fuzzysort.go(scheme, schemes, { all: true })) {
                if (Schemes.get_default().map.hasOwnProperty(target))
                    this.#content.add(<Scheme {...Schemes.get_default().map[target]} />);
                else {
                    const [scheme, flavour] = target.split("-");
                    this.#content.add(<Scheme {...Schemes.get_default().map[scheme].flavours![flavour]} />);
                }
            }
        } else if (action === "wallpaper") {
            const wallpaper = args[1] ?? "";
            for (const { obj } of fuzzysort.go(wallpaper, Wallpapers.get_default().list, { all: true, key: "path" }))
                this.#content.add(<Wallpaper {...obj} />);
        } else {
            const list = this.#list.filter(
                a => this.#map[a].available?.() ?? !config.disabledActions.get().includes(a)
            );
            for (const { target } of fuzzysort.go(action, list, { all: true }))
                this.#content.add(<Action {...this.#map[target]} args={args.slice(1)} />);
        }
    }

    handleActivate(search: string): void {
        const args = search.split(" ");
        const action = args[0].slice(1).toLowerCase();

        if ((action === "scheme" || action === "wallpaper") && args[1].toLowerCase() === "random") {
            execAsync(`caelestia ${action}`).catch(console.error);
            close();
        }

        this.#content.get_child_at_index(0)?.get_child()?.activate();
    }
}
