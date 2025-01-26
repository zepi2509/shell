import { bind, execAsync, Gio, GLib, readFile, register, timeout, Variable } from "astal";
import { App, Astal, Gtk, Widget } from "astal/gtk3";
import fuzzysort from "fuzzysort";
import type AstalApps from "gi://AstalApps";
import AstalHyprland from "gi://AstalHyprland";
import { launcher as config } from "../../config";
import { Apps } from "../services/apps";
import MathService, { type HistoryItem } from "../services/math";
import { getAppCategoryIcon } from "../utils/icons";
import { launch, notify } from "../utils/system";
import type { Client } from "../utils/types";
import { MenuItem, setupCustomTooltip } from "../utils/widgets";
import PopupWindow from "../widgets/popupwindow";

type Mode = "apps" | "files" | "math" | "windows";

interface Subcommand {
    icon: string;
    name: string;
    description: string;
    command: (...args: string[]) => boolean | void;
}

const getIconFromMode = (mode: Mode) => {
    switch (mode) {
        case "apps":
            return "apps";
        case "files":
            return "folder";
        case "math":
            return "calculate";
        case "windows":
            return "select_window";
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
        case "windows":
            return "No windows found";
    }
};

const limitLength = <T,>(arr: T[], cfg: { maxResults: number }) =>
    cfg.maxResults > 0 && arr.length > cfg.maxResults ? arr.slice(0, cfg.maxResults) : arr;

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

    if (!app) {
        console.error(`Launcher - Unable to find app for "${names.join(", ")}"`);
        return null;
    }

    const menu = new Gtk.Menu();
    menu.append(new MenuItem({ label: "Launch", onActivate: () => launchAndClose(widget, astalApp!) }));

    if (app.list_actions().length > 0) menu.append(new Gtk.SeparatorMenuItem({ visible: true }));
    app.list_actions().forEach(action => {
        menu.append(
            new MenuItem({
                label: app.get_action_name(action),
                onActivate: () => {
                    close(widget); // Pass result cause menu is its own toplevel
                    app.launch_action(action, null);
                },
            })
        );
    });

    const widget = (
        <button
            className="pinned-app result"
            cursor="pointer"
            onClicked={self => launchAndClose(self, astalApp!)}
            onClick={(_, event) => event.button === Astal.MouseButton.SECONDARY && menu.popup_at_pointer(null)}
            setup={self => setupCustomTooltip(self, app.get_display_name())}
            onDestroy={() => menu.destroy()}
        >
            <icon gicon={app.get_icon()!} />
        </button>
    );
    return widget;
};

const PinnedApps = () => <box homogeneous>{config.apps.pins.map(PinnedApp)}</box>;

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
    tooltip,
    onClicked,
    onSecondaryClick,
    onMiddleClick,
    onDestroy,
}: {
    icon?: string | Gio.Icon | null;
    materialIcon?: string;
    label: string;
    sublabel?: string;
    tooltip?: string;
    onClicked: (self: Widget.Button) => void;
    onSecondaryClick?: (self: Widget.Button) => void;
    onMiddleClick?: (self: Widget.Button) => void;
    onDestroy?: () => void;
}) => (
    <button
        className="result"
        cursor="pointer"
        tooltipText={tooltip}
        onClicked={onClicked}
        onClick={(self, event) => {
            if (event.button === Astal.MouseButton.SECONDARY) onSecondaryClick?.(self);
            else if (event.button === Astal.MouseButton.MIDDLE) onMiddleClick?.(self);
        }}
        onDestroy={onDestroy}
    >
        <box>
            {icon &&
                (typeof icon === "string" ? (
                    Astal.Icon.lookup_icon(icon) && <icon valign={Gtk.Align.START} className="icon" icon={icon} />
                ) : (
                    <icon valign={Gtk.Align.START} className="icon" gicon={icon} />
                ))}
            {materialIcon && (!icon || (typeof icon === "string" && !Astal.Icon.lookup_icon(icon))) && (
                <label valign={Gtk.Align.START} className="icon" label={materialIcon} />
            )}
            {sublabel ? (
                <box vertical valign={Gtk.Align.CENTER} className="has-sublabel">
                    <label hexpand truncate maxWidthChars={1} xalign={0} label={label} />
                    <label hexpand truncate maxWidthChars={1} className="sublabel" xalign={0} label={sublabel} />
                </box>
            ) : (
                <label hexpand truncate maxWidthChars={1} xalign={0} label={label} />
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
            if (!subcommand.command(...args)) entry.set_text("");
        }}
    />
);

const AppResult = ({ app }: { app: AstalApps.Application }) => {
    const menu = new Gtk.Menu();
    menu.append(new MenuItem({ label: "Launch", onActivate: () => launchAndClose(result, app) }));

    const appInfo = app.app as Gio.DesktopAppInfo;
    if (appInfo.list_actions().length > 0) menu.append(new Gtk.SeparatorMenuItem({ visible: true }));
    appInfo.list_actions().forEach(action => {
        menu.append(
            new MenuItem({
                label: appInfo.get_action_name(action),
                onActivate: () => {
                    close(result); // Pass result cause menu is its own toplevel
                    appInfo.launch_action(action, null);
                },
            })
        );
    });

    const result = (
        <Result
            icon={app.iconName}
            materialIcon={getAppCategoryIcon(app)}
            label={app.name}
            sublabel={app.description}
            onClicked={self => launchAndClose(self, app)}
            onSecondaryClick={() => menu.popup_at_pointer(null)}
            onDestroy={() => menu.destroy()}
        />
    );
    return result;
};

const MathResult = ({ math, isHistory, entry }: { math: HistoryItem; isHistory?: boolean; entry: Widget.Entry }) => (
    <Result
        materialIcon={math.icon}
        label={math.equation}
        sublabel={math.result}
        onClicked={() => {
            if (isHistory) {
                MathService.get_default().select(math);
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
        icon={Gio.File.new_for_path(path)
            .query_info(Gio.FILE_ATTRIBUTE_STANDARD_ICON, Gio.FileQueryInfoFlags.NONE, null)
            .get_icon()}
        label={path.split("/").pop()!}
        sublabel={path.startsWith(HOME) ? "~" + path.slice(HOME.length) : path}
        onClicked={self => openFileAndClose(self, path)}
    />
);

const WindowResult = ({ client, reload }: { client: Client; reload: () => void }) => {
    const hyprland = AstalHyprland.get_default();
    const app = Apps.fuzzy_query(client.class)[0];
    const astalClient = hyprland.get_client(client.address);

    const menu = new Gtk.Menu();
    menu.append(
        new MenuItem({
            label: "Focus",
            onActivate: () => {
                close(result);
                astalClient?.focus();
            },
        })
    );
    menu.append(new Gtk.SeparatorMenuItem({ visible: true }));

    const addSubmenus = (silent: boolean) => {
        menu.append(
            new MenuItem({
                label: `Move to workspace${silent ? " (silent)" : ""}`,
                setup: self => {
                    const submenu = new Gtk.Menu();
                    const start = Math.floor((hyprland.focusedWorkspace.id - 1) / 10) * 10;
                    for (let i = 1; i <= 10; i++)
                        submenu.append(
                            new MenuItem({
                                label: `Workspace ${start + i}`,
                                onActivate: () => {
                                    if (!silent) close(result);
                                    hyprland.dispatch(
                                        `movetoworkspace${silent ? "silent" : ""}`,
                                        `${start + i},address:${client.address}`
                                    );
                                },
                            })
                        );
                    self.set_submenu(submenu);
                },
            })
        );
        menu.append(
            new MenuItem({
                label: `Move to special workspace${silent ? " (silent)" : ""}`,
                setup: self => {
                    const submenu = new Gtk.Menu();
                    submenu.append(
                        new MenuItem({
                            label: "special",
                            onActivate: () => {
                                if (!silent) close(result);
                                hyprland.dispatch(
                                    `movetoworkspace${silent ? "silent" : ""}`,
                                    `special,address:${client.address}`
                                );
                            },
                        })
                    );
                    hyprland.message_async("j/workspaces", (_, res) => {
                        const workspaces = JSON.parse(hyprland.message_finish(res));
                        for (const workspace of workspaces)
                            if (workspace.name.startsWith("special:"))
                                submenu.append(
                                    new MenuItem({
                                        label: workspace.name.slice(8),
                                        onActivate: () => {
                                            if (!silent) close(result);
                                            hyprland.dispatch(
                                                `movetoworkspace${silent ? "silent" : ""}`,
                                                `${workspace.name},address:${client.address}`
                                            );
                                        },
                                    })
                                );
                    });
                    self.set_submenu(submenu);
                },
            })
        );
    };
    addSubmenus(false);
    addSubmenus(true);

    menu.append(
        new MenuItem({
            label: "Copy property",
            setup: self => {
                const addSubmenu = (self: MenuItem, obj: object) => {
                    const submenu = new Gtk.Menu();

                    for (const [key, value] of Object.entries(obj))
                        if (typeof value === "object") submenu.append(addSubmenu(new MenuItem({ label: key }), value));
                        else
                            submenu.append(
                                new MenuItem({
                                    label: key,
                                    onActivate: () => {
                                        close(result);
                                        execAsync(`wl-copy -- ${value}`).catch(console.error);
                                    },
                                    tooltipText: String(value),
                                })
                            );

                    self.set_submenu(submenu);
                    return self;
                };
                addSubmenu(self, client);
            },
        })
    );

    menu.append(new Gtk.SeparatorMenuItem({ visible: true }));
    menu.append(
        new MenuItem({
            label: "Kill",
            onActivate: () => {
                astalClient?.kill();
                const id = hyprland.connect("client-removed", () => {
                    hyprland.disconnect(id);
                    reload();
                });
            },
        })
    );

    const classOrTitle = (prop: "Class" | "Title", header = true) => {
        const lower = prop.toLowerCase() as "class" | "title";
        return (
            (header ? `${prop}: ` : "") +
            (client[lower] || (client[`initial${prop}`] ? `${client[`initial${prop}`]} (initial)` : `No ${lower}`))
        );
    };
    const workspace = (header = false) =>
        (header ? "Workspace: " : "") + `${client.workspace.name} (${client.workspace.id})`;
    const prop = (prop: keyof typeof client, header?: string) =>
        `${header ?? prop.slice(0, 1).toUpperCase() + prop.slice(1)}: ${client[prop]}`;

    const result = (
        <Result
            icon={app.iconName}
            materialIcon={getAppCategoryIcon(app)}
            label={
                classOrTitle("Title", false).length < 5
                    ? `${classOrTitle("Class", false)}: ${classOrTitle("Title", false)}`
                    : classOrTitle("Title", false)
            }
            sublabel={`Workspace ${workspace()} on ${hyprland.get_monitor(client.monitor).name}`}
            tooltip={`${classOrTitle("Title")}\n${classOrTitle("Class")}\n${prop("address")}\n${workspace(
                true
            )}\n${prop("pid", "Process ID")}\n${prop("floating")}\n${prop("inhibitingIdle", "Inhibiting idle")}`}
            onClicked={self => {
                close(self);
                astalClient?.focus();
            }}
            onSecondaryClick={() => menu.popup_at_pointer(null)}
            onMiddleClick={() => {
                astalClient?.kill();
                const id = hyprland.connect("client-removed", () => {
                    hyprland.disconnect(id);
                    reload();
                });
            }}
            onDestroy={() => menu.destroy()}
        />
    );
    return result;
};

const Results = ({ entry, mode }: { entry: Widget.Entry; mode: Variable<Mode> }) => {
    const empty = Variable(true);

    const scrollable = (
        <scrollable name="list" hscroll={Gtk.PolicyType.NEVER}>
            <box
                vertical
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
                        windows: {
                            icon: "select_window",
                            name: "Windows",
                            description: "Manage open windows",
                            command: () => mode.set("windows"),
                        },
                        scheme: {
                            icon: "palette",
                            name: "Scheme",
                            description: "Change the current colour scheme",
                            command: (...args) => {
                                // If no args, autocomplete cmd
                                if (args.length === 0) {
                                    entry.set_text(">scheme ");
                                    entry.set_position(-1);
                                    return true;
                                }

                                execAsync(`caelestia scheme ${args[0]}`).catch(console.error);
                                close(self);
                            },
                        },
                        todo: {
                            icon: "checklist",
                            name: "Todo",
                            description: "Create a todo in Todoist",
                            command: (...args) => {
                                // If no args, autocomplete cmd
                                if (args.length === 0) {
                                    entry.set_text(">todo ");
                                    entry.set_position(-1);
                                    return true;
                                }

                                if (!GLib.find_program_in_path("tod")) {
                                    notify({
                                        summary: "Tod not installed",
                                        body: "The launcher todo subcommand requires `tod`. Install it with `yay -S tod-bin`",
                                        icon: "dialog-warning-symbolic",
                                        urgency: "critical",
                                    });
                                    return;
                                }

                                // If tod not configured, notify and exit
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
                                    return;
                                }

                                // Create todo, notify and close
                                execAsync(`tod t q -c ${args.join(" ")}`).catch(console.error);
                                if (config.todo.notify)
                                    notify({
                                        summary: "Todo created",
                                        body: `Created todo with content: ${args.join(" ")}`,
                                        icon: "view-list-bullet-symbolic",
                                        urgency: "low",
                                        transient: true,
                                        actions: {
                                            "Copy content": () =>
                                                execAsync(`wl-copy -- ${args.join(" ")}`).catch(console.error),
                                            View: () => {
                                                const client = AstalHyprland.get_default().clients.find(
                                                    c => c.class === "Todoist"
                                                );
                                                if (client) client.focus();
                                                else execAsync("uwsm app -- todoist").catch(console.error);
                                            },
                                        },
                                    });
                                close(self);
                            },
                        },
                        reload: {
                            icon: "refresh",
                            name: "Reload",
                            description: "Reload app list",
                            command: () => Apps.reload(),
                        },
                    };
                    const subcommandList = Object.keys(subcommands);

                    const afterUpdate = () => {
                        empty.set(self.get_children().length === 0);

                        const children = limitLength(self.get_children(), config);
                        const height = children.reduce((a, b) => a + b.get_preferred_height()[1], 0);
                        scrollable.css = `min-height: ${height}px;`;
                    };

                    const appSearch = () => {
                        const apps = limitLength(Apps.fuzzy_query(entry.text), config.apps);
                        for (const app of apps) self.add(<AppResult app={app} />);
                    };

                    const calculate = () => {
                        if (entry.text) {
                            self.add(
                                <MathResult math={MathService.get_default().evaluate(entry.text)} entry={entry} />
                            );
                            self.add(<box className="separator" />);
                        }
                        for (const item of limitLength(MathService.get_default().history, config.math))
                            self.add(<MathResult isHistory math={item} entry={entry} />);
                    };

                    const fileSearch = () =>
                        execAsync(["fd", ...config.files.fdOpts, entry.text, HOME])
                            .then(out => {
                                const paths = out.split("\n").filter(path => path);
                                self.foreach(ch => ch.destroy());
                                for (const path of limitLength(paths, config.files))
                                    self.add(<FileResult path={path} />);
                            })
                            .catch(e => {
                                // Ignore execAsync error
                                if (!(e instanceof Gio.IOErrorEnum || e instanceof GLib.SpawnError)) console.error(e);
                            })
                            .finally(afterUpdate);

                    const listWindows = () => {
                        const hyprland = AstalHyprland.get_default();
                        // Use message cause AstalHyprland is buggy (inconsistent prop updating)
                        hyprland.message_async("j/clients", (_, res) => {
                            try {
                                const unsortedClients: Client[] = JSON.parse(hyprland.message_finish(res));
                                if (entry.text) {
                                    const clients = fuzzysort.go(entry.text, unsortedClients, {
                                        all: true,
                                        limit: config.windows.maxResults < 0 ? undefined : config.windows.maxResults,
                                        keys: ["title", "class", "initialTitle", "initialClass"],
                                        scoreFn: r =>
                                            r[0].score * config.windows.weights.title +
                                            r[1].score * config.windows.weights.class +
                                            r[2].score * config.windows.weights.initialTitle +
                                            r[3].score * config.windows.weights.initialClass,
                                    });
                                    self.foreach(ch => ch.destroy());
                                    for (const { obj } of clients)
                                        self.add(<WindowResult reload={listWindows} client={obj} />);
                                } else {
                                    const clients = unsortedClients.sort((a, b) => a.focusHistoryID - b.focusHistoryID);
                                    self.foreach(ch => ch.destroy());
                                    for (const client of limitLength(clients, config.windows))
                                        self.add(<WindowResult reload={listWindows} client={client} />);
                                }
                            } catch (e) {
                                console.error(e);
                            } finally {
                                afterUpdate();
                            }
                        });
                    };

                    // Update windows on open
                    self.hook(App, "window-toggled", (_, window) => {
                        if (window.name === "launcher" && window.visible && mode.get() === "windows") listWindows();
                    });

                    self.hook(entry, "activate", () => {
                        if (mode.get() === "math") {
                            if (entry.text.startsWith("clear")) MathService.get_default().clear();
                            else MathService.get_default().commit();
                        }
                        self.get_children()[0]?.activate();
                    });
                    self.hook(entry, "changed", () => {
                        if (!entry.text && mode.get() === "apps") return;

                        // Files and windows have delay cause async so they do some stuff by themselves
                        const ignoreFileAsync =
                            entry.text.startsWith(">") || (mode.get() !== "files" && mode.get() !== "windows");
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
                        else if (mode.get() === "windows") listWindows();

                        if (ignoreFileAsync) afterUpdate();
                    });
                }}
            />
        </scrollable>
    ) as Widget.Scrollable;

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
            {scrollable}
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
    <box vertical className={bind(mode).as(m => `launcher ${m}`)}>
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
            anchor: Astal.WindowAnchor.TOP,
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
            child: <LauncherContent mode={mode} showResults={showResults} entry={entry} />,
        });

        this.mode = mode;

        this.connect("show", () => (this.marginTop = AstalHyprland.get_default().focusedMonitor.height / 4));

        // Clear search on hide if not in math mode or creating a todo
        this.connect("hide", () => mode.get() !== "math" && !entry.text.startsWith(">todo") && entry.set_text(""));

        this.connect("destroy", () => showResults.drop());
    }

    open(mode: Mode) {
        this.mode.set(mode);
        this.show();
    }
}
