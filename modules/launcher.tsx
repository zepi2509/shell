import { bind, execAsync, Gio, GLib, register, timeout, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import fuzzysort from "fuzzysort";
import type AstalApps from "gi://AstalApps";
import AstalHyprland from "gi://AstalHyprland";
import { launcher as config } from "../config";
import { Apps } from "../services/apps";
import Math, { type HistoryItem } from "../services/math";
import { HOME } from "../utils/constants";
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

const getEmptyTextFromMode = (mode: Mode) => {
    switch (mode) {
        case "apps":
            return "No apps found";
        case "files":
            return GLib.find_program_in_path("fd") === null ? "File search requires `fd`" : "No files found";
        case "math":
            return "Type an expression";
    }
};

const close = (self: JSX.Element) => {
    const toplevel = self.get_toplevel();
    if (toplevel instanceof Widget.Window) toplevel.hide();
};

const launchAndClose = (self: JSX.Element, astalApp: AstalApps.Application) => {
    close(self);
    launch(astalApp);
};

const openFileAndClose = (self: JSX.Element, path: string) => {
    close(self);
    execAsync([
        "bash",
        "-c",
        `dbus-send --session --dest=org.freedesktop.FileManager1 --type=method_call /org/freedesktop/FileManager1 org.freedesktop.FileManager1.ShowItems array:string:"file://${path}" string:"" || xdg-open "${path}"`,
    ]).catch(console.error);
};

const PinnedApp = (names: string[]) => {
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

const PinnedApps = () => <box homogeneous>{config.pins.map(PinnedApp)}</box>;

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
                    <label hexpand truncate maxWidthChars={1} xalign={0} label={label} />
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

const MathResult = ({ math, isHistory, entry }: { math: HistoryItem; isHistory?: boolean; entry: Widget.Entry }) => (
    <Result
        materialIcon={math.icon}
        label={math.equation}
        sublabel={math.result}
        onClicked={() => {
            if (isHistory) {
                Math.get_default().select(math);
                entry.set_text(math.equation);
                entry.grab_focus();
                entry.set_position(-1);
            } else {
                execAsync(`wl-copy -- ${math.result}`).catch(console.error);
                entry.set_text("");
            }
        }}
    />
);

const FileResult = ({ path }: { path: string }) => (
    <Result
        label={path.split("/").pop()!}
        sublabel={path.startsWith(HOME) ? "~" + path.slice(HOME.length) : path}
        onClicked={self => openFileAndClose(self, path)}
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
                <label className="icon" label="bug_report" />
                <label
                    label={bind(entry, "text").as(t =>
                        t.startsWith(">") ? "No matching subcommands" : getEmptyTextFromMode(mode.get())
                    )}
                />
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
                        math: {
                            icon: "calculate",
                            name: "Math",
                            description: "Do math calculations",
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

                    const updateEmpty = () => empty.set(self.get_children().length === 0);

                    const appSearch = () => {
                        const apps = Apps.fuzzy_query(entry.text);
                        if (apps.length > config.maxResults) apps.length = config.maxResults;
                        for (const app of apps) self.add(<AppResult app={app} />);
                    };

                    const calculate = () => {
                        if (entry.text) {
                            self.add(<MathResult math={Math.get_default().evaluate(entry.text)} entry={entry} />);
                            self.add(<box className="separator" />);
                        }
                        for (const item of Math.get_default().history)
                            self.add(<MathResult isHistory math={item} entry={entry} />);
                    };

                    const fileSearch = () =>
                        execAsync(["fd", ...config.fdOpts, entry.text, HOME])
                            .then(out => {
                                const paths = out.split("\n").filter(path => path);
                                if (paths.length > config.maxResults) paths.length = config.maxResults;
                                self.foreach(ch => ch.destroy());
                                for (const path of paths) self.add(<FileResult path={path} />);
                            })
                            .catch(e => {
                                // Ignore execAsync error
                                if (!(e instanceof Gio.IOErrorEnum || e instanceof GLib.SpawnError)) console.error(e);
                            })
                            .finally(updateEmpty);

                    self.hook(entry, "activate", () => {
                        if (!entry.text) return;
                        if (mode.get() === "math") {
                            if (entry.text.startsWith("clear")) Math.get_default().clear();
                            else Math.get_default().commit();
                        }
                        self.get_children()[0]?.activate();
                    });
                    self.hook(entry, "changed", () => {
                        if (!entry.text && mode.get() === "apps") return;

                        // Files has delay cause async so it does some stuff by itself
                        const ignoreFileAsync = !entry.text || entry.text.startsWith(">") || mode.get() !== "files";
                        if (ignoreFileAsync) self.foreach(ch => ch.destroy());

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
                        else if (mode.get() === "files") fileSearch();

                        if (ignoreFileAsync) updateEmpty();
                    });
                }}
            />
        </stack>
    );
};

const LauncherContent = ({
    mode,
    showResults,
    entry,
}: {
    mode: Variable<Mode>;
    showResults: Variable<boolean>;
    entry: Widget.Entry;
}) => (
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
            revealChild={bind(showResults).as(s => !s)}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            transitionDuration={150}
        >
            <PinnedApps />
        </revealer>
        <revealer
            revealChild={bind(showResults)}
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
        const showResults = Variable.derive([bind(entry, "textLength"), mode], (t, m) => t > 0 || m !== "apps");

        super({
            name: "launcher",
            keymode: Astal.Keymode.EXCLUSIVE,
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
            child: <LauncherContent mode={mode} showResults={showResults} entry={entry} />,
        });

        this.mode = mode;

        // Clear search on hide if not in math mode
        this.connect("hide", () => mode.get() !== "math" && entry.set_text(""));
    }

    open(mode: Mode) {
        this.mode.set(mode);
        this.show();
    }
}
