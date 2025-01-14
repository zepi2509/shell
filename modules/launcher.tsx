import { bind, execAsync, Gio, register, timeout, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import fuzzysort from "fuzzysort";
import type AstalApps from "gi://AstalApps";
import AstalHyprland from "gi://AstalHyprland";
import Mexp from "math-expression-evaluator";
import { Apps } from "../services/apps";
import { getAppCategoryIcon } from "../utils/icons";
import { launch } from "../utils/system";
import { PopupWindow, setupCustomTooltip, TransitionType } from "../utils/widgets";

type Mode = "apps" | "files" | "math";

interface Subcommand {
    icon: string;
    name: string;
    description: string;
    command: (...args: string[]) => void;
}

const maxSearchResults = 15;

const browser = [
    "firefox",
    "waterfox",
    "google-chrome",
    "chromium",
    "brave-browser",
    "vivaldi-stable",
    "vivaldi-snapshot",
];
const terminal = ["foot", "alacritty", "kitty", "wezterm"];
const files = ["thunar", "nemo", "nautilus"];
const ide = ["codium", "code", "clion", "intellij-idea-ultimate-edition"];
const music = ["spotify-adblock", "spotify", "audacious", "elisa"];

const getIconFromMode = (mode: Mode) => {
    switch (mode) {
        case "apps":
            return "apps";
        case "files":
            return "folder";
        case "math":
            return "calculate";
    }
};

const launchAndClose = (self: JSX.Element, astalApp: AstalApps.Application) => {
    const toplevel = self.get_toplevel();
    if (toplevel instanceof Widget.Window) toplevel.hide();
    launch(astalApp);
};

const PinnedApp = ({ names }: { names: string[] }) => {
    let app: Gio.DesktopAppInfo | null = null;
    let astalApp: AstalApps.Application | undefined;
    for (const name of names) {
        app = Gio.DesktopAppInfo.new(`${name}.desktop`);
        if (app) {
            astalApp = Apps.get_list().find(a => a.entry === `${name}.desktop`);
            if (app.get_icon() && astalApp) break;
            else app = null; // Set app to null if no icon or matching AstalApps#Application
        }
    }

    if (!app) console.error(`Launcher - Unable to find app for "${names.join(", ")}"`);

    return app ? (
        <button
            className="pinned-app result"
            cursor="pointer"
            onClicked={self => launchAndClose(self, astalApp!)}
            setup={self => setupCustomTooltip(self, app.get_display_name())}
        >
            <icon gicon={app.get_icon()!} />
        </button>
    ) : null;
};

const PinnedApps = () => (
    <box homogeneous>
        <PinnedApp names={browser} />
        <PinnedApp names={terminal} />
        <PinnedApp names={files} />
        <PinnedApp names={ide} />
        <PinnedApp names={music} />
    </box>
);

const SearchEntry = ({ entry }: { entry: Widget.Entry }) => (
    <stack
        hexpand
        transitionType={Gtk.StackTransitionType.CROSSFADE}
        transitionDuration={150}
        setup={self =>
            self.hook(entry, "notify::text-length", () =>
                // Timeout to avoid flickering when replacing entire text (cause it'll set len to 0 then back to > 0)
                timeout(1, () => (self.shown = entry.textLength > 0 ? "entry" : "placeholder"))
            )
        }
    >
        <label name="placeholder" className="placeholder" xalign={0} label='Type ">" for subcommands' />
        {entry}
    </stack>
);

// TODO: description field
const Result = ({
    icon,
    materialIcon,
    label,
    sublabel,
    onClicked,
}: {
    icon?: string;
    materialIcon?: string;
    label: string;
    sublabel?: string;
    onClicked: (self: Widget.Button) => void;
}) => (
    <button className="result" cursor="pointer" onClicked={onClicked}>
        <box>
            {icon && Astal.Icon.lookup_icon(icon) ? (
                <icon className="icon" icon={icon} />
            ) : (
                <label className="icon" label={materialIcon} />
            )}
            {sublabel ? (
                <box vertical valign={Gtk.Align.CENTER} className="has-sublabel">
                    <label xalign={0} label={label} />
                    <label hexpand truncate maxWidthChars={1} className="sublabel" xalign={0} label={sublabel} />
                </box>
            ) : (
                <label xalign={0} label={label} />
            )}
        </box>
    </button>
);

const SubcommandResult = ({
    entry,
    subcommand,
    args,
}: {
    entry: Widget.Entry;
    subcommand: Subcommand;
    args: string[];
}) => (
    <Result
        materialIcon={subcommand.icon}
        label={subcommand.name}
        sublabel={subcommand.description}
        onClicked={() => {
            subcommand.command(...args);
            entry.set_text("");
        }}
    />
);

const AppResult = ({ app }: { app: AstalApps.Application }) => (
    <Result
        icon={app.iconName}
        materialIcon={getAppCategoryIcon(app)}
        label={app.name}
        sublabel={app.description}
        onClicked={self => launchAndClose(self, app)}
    />
);

const Results = ({ entry, mode }: { entry: Widget.Entry; mode: Variable<Mode> }) => {
    const empty = Variable(true);

    return (
        <stack
            className="results"
            transitionType={Gtk.StackTransitionType.CROSSFADE}
            transitionDuration={150}
            shown={bind(empty).as(t => (t ? "empty" : "list"))}
        >
            <box name="empty" className="empty" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                <label className="icon" label="apps_outage" />
                <label label="No results" />
            </box>
            <box
                vertical
                name="list"
                setup={self => {
                    const subcommands: Record<string, Subcommand> = {
                        apps: {
                            icon: "apps",
                            name: "Apps",
                            description: "Search for apps",
                            command: () => mode.set("apps"),
                        },
                        files: {
                            icon: "folder",
                            name: "Files",
                            description: "Search for files",
                            command: () => mode.set("files"),
                        },
                        calc: {
                            icon: "calculate",
                            name: "Calculator",
                            description: "A calculator...",
                            command: () => mode.set("math"),
                        },
                        todo: {
                            icon: "checklist",
                            name: "Todo",
                            description: "Create a todo in <INSERT_TODO_APP>",
                            command: (...args) => {
                                // TODO: todo service or maybe use external app
                            },
                        },
                    };
                    const subcommandList = Object.keys(subcommands);
                    const mexp = new Mexp();

                    const appSearch = () => {
                        const apps = Apps.fuzzy_query(entry.text);
                        empty.set(apps.length === 0);
                        if (apps.length > maxSearchResults) apps.length = maxSearchResults;
                        for (const app of apps) self.add(<AppResult app={app} />);
                    };

                    const calculate = () => {
                        // TODO: allow defs, history
                        let math = null;
                        try {
                            math = mexp.eval(entry.text);
                        } catch (e) {
                            // Ignore
                        }
                        if (math !== null)
                            self.add(
                                <Result
                                    materialIcon="calculate"
                                    label={entry.text}
                                    sublabel={String(math)}
                                    onClicked={() => execAsync(`wl-copy -- ${math}`).catch(console.error)}
                                />
                            );
                    };

                    self.hook(entry, "activate", () => entry.text && self.get_children()[0].activate());
                    self.hook(entry, "changed", () => {
                        if (!entry.text) return;
                        self.foreach(ch => ch.destroy());

                        if (entry.text.startsWith(">")) {
                            const args = entry.text.split(" ");
                            for (const { target } of fuzzysort.go(args[0].slice(1), subcommandList, { all: true }))
                                self.add(
                                    <SubcommandResult
                                        entry={entry}
                                        subcommand={subcommands[target]}
                                        args={args.slice(1)}
                                    />
                                );
                        } else if (mode.get() === "apps") appSearch();
                        else if (mode.get() === "math") calculate();

                        empty.set(self.get_children().length === 0);
                    });
                }}
            />
        </stack>
    );
};

const LauncherContent = ({ mode, entry }: { mode: Variable<Mode>; entry: Widget.Entry }) => (
    <box
        vertical
        className={bind(mode).as(m => `launcher ${m}`)}
        css={bind(AstalHyprland.get_default(), "focusedMonitor").as(m => `margin-top: ${m.height / 4}px;`)}
    >
        <box className="search-bar">
            <label className="icon" label="search" />
            <SearchEntry entry={entry} />
            <label className="icon" label={bind(mode).as(getIconFromMode)} />
        </box>
        <revealer
            revealChild={bind(entry, "textLength").as(t => t === 0)}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            transitionDuration={150}
        >
            <PinnedApps />
        </revealer>
        <revealer
            revealChild={bind(entry, "textLength").as(t => t > 0)}
            transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
            transitionDuration={150}
        >
            <Results entry={entry} mode={mode} />
        </revealer>
    </box>
);

@register()
export default class Launcher extends PopupWindow {
    readonly mode: Variable<Mode>;

    constructor() {
        const entry = (<entry name="entry" />) as Widget.Entry;
        const mode = Variable<Mode>("apps");

        super({
            name: "launcher",
            keymode: Astal.Keymode.EXCLUSIVE,
            exclusivity: Astal.Exclusivity.IGNORE,
            onKeyPressEvent(_, event) {
                const keyval = event.get_keyval()[1];
                // Focus entry on typing
                if (!entry.isFocus && keyval >= 32 && keyval <= 126) {
                    entry.text += String.fromCharCode(keyval);
                    entry.grab_focus();
                    entry.set_position(-1);

                    // Consume event, if not consumed it will duplicate character in entry
                    return true;
                }
            },
            transitionType: TransitionType.SLIDE_DOWN,
            halign: Gtk.Align.CENTER,
            valign: Gtk.Align.START,
            child: <LauncherContent mode={mode} entry={entry} />,
        });

        this.mode = mode;

        this.connect("hide", () => entry.set_text(""));
    }

    open(mode: Mode) {
        this.mode.set(mode);
        this.show();
    }
}
