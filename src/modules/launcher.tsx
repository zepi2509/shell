import { Apps as AppsService } from "@/services/apps";
import { getAppCategoryIcon } from "@/utils/icons";
import { launch } from "@/utils/system";
import { FlowBox, setupCustomTooltip } from "@/utils/widgets";
import PopupWindow from "@/widgets/popupwindow";
import { bind, execAsync, Gio, register, Variable } from "astal";
import { App, Astal, Gtk, Widget } from "astal/gtk3";
import { launcher as config } from "config";
import type AstalApps from "gi://AstalApps";

type Mode = "apps" | "files" | "math" | "windows";

interface ModeContent {
    updateContent(search: string): void;
    handleActivate(search: string): void;
}

const close = () => App.get_window("launcher")?.hide();

const getModeIcon = (mode: Mode) => {
    if (mode === "apps") return "apps";
    if (mode === "files") return "folder";
    if (mode === "math") return "calculate";
    if (mode === "windows") return "select_window";
    return "search";
};

const getPrettyMode = (mode: Mode) => {
    if (mode === "apps") return "Apps";
    if (mode === "files") return "Files";
    if (mode === "math") return "Math";
    if (mode === "windows") return "Windows";
    return mode;
};

const limitLength = <T,>(arr: T[], cfg: { maxResults: Variable<number> }) =>
    cfg.maxResults.get() > 0 && arr.length > cfg.maxResults.get() ? arr.slice(0, cfg.maxResults.get()) : arr;

const ContentBox = () => <FlowBox homogeneous valign={Gtk.Align.START} minChildrenPerLine={2} maxChildrenPerLine={2} />;

const AppResult = ({ app }: { app: AstalApps.Application }) => (
    <Gtk.FlowBoxChild visible canFocus={false}>
        <button
            className="result"
            cursor="pointer"
            onClicked={() => {
                launch(app);
                close();
            }}
            setup={self => setupCustomTooltip(self, app.description ? `${app.name}: ${app.description}` : app.name)}
        >
            <box>
                {app.iconName && Astal.Icon.lookup_icon(app.iconName) ? (
                    <icon className="icon" icon={app.iconName} />
                ) : (
                    <label className="icon" label={getAppCategoryIcon(app)} />
                )}
                <label truncate label={app.name} />
            </box>
        </button>
    </Gtk.FlowBoxChild>
);

const FileResult = ({ path }: { path: string }) => (
    <Gtk.FlowBoxChild visible canFocus={false}>
        <button
            className="result"
            cursor="pointer"
            onClicked={() => {
                execAsync([
                    "bash",
                    "-c",
                    `dbus-send --session --dest=org.freedesktop.FileManager1 --type=method_call /org/freedesktop/FileManager1 org.freedesktop.FileManager1.ShowItems array:string:"file://${path}" string:"" || xdg-open "${path}"`,
                ]).catch(console.error);
                close();
            }}
        >
            <box setup={self => setupCustomTooltip(self, path.replace(HOME, "~"))}>
                <icon
                    className="icon"
                    gicon={
                        Gio.File.new_for_path(path)
                            .query_info(Gio.FILE_ATTRIBUTE_STANDARD_ICON, Gio.FileQueryInfoFlags.NONE, null)
                            .get_icon()!
                    }
                />
                <label
                    truncate
                    label={
                        path.replace(HOME, "~").length > config.files.shortenThreshold.get()
                            ? path
                                  .replace(HOME, "~")
                                  .split("/")
                                  .map((n, i, arr) => (i === 0 || i === arr.length - 1 ? n : n.slice(0, 1)))
                                  .join("/")
                            : path.replace(HOME, "~")
                    }
                />
            </box>
        </button>
    </Gtk.FlowBoxChild>
);

@register()
class Apps extends Widget.Box implements ModeContent {
    #content: FlowBox;

    constructor() {
        super({ name: "apps", className: "apps" });

        this.#content = (<ContentBox />) as FlowBox;

        this.add(
            <scrollable expand hscroll={Gtk.PolicyType.NEVER}>
                {this.#content}
            </scrollable>
        );
    }

    updateContent(search: string): void {
        this.#content.foreach(c => c.destroy());
        for (const app of limitLength(AppsService.fuzzy_query(search), config.apps))
            this.#content.add(<AppResult app={app} />);
    }

    handleActivate(): void {
        this.#content.get_child_at_index(0)?.get_child()?.grab_focus();
        this.#content.get_child_at_index(0)?.get_child()?.activate();
    }
}

@register()
class Files extends Widget.Box implements ModeContent {
    #content: FlowBox;

    constructor() {
        super({ name: "files", className: "files" });

        this.#content = (<ContentBox />) as FlowBox;

        this.add(
            <scrollable expand hscroll={Gtk.PolicyType.NEVER}>
                {this.#content}
            </scrollable>
        );
    }

    updateContent(search: string): void {
        execAsync(["fd", ...config.files.fdOpts.get(), search, HOME])
            .then(out => {
                this.#content.foreach(c => c.destroy());
                const paths = out.split("\n").filter(path => path);
                for (const path of limitLength(paths, config.files)) this.#content.add(<FileResult path={path} />);
            })
            .catch(() => {}); // Ignore errors
    }

    handleActivate(): void {
        this.#content.get_child_at_index(0)?.get_child()?.grab_focus();
        this.#content.get_child_at_index(0)?.get_child()?.activate();
    }
}

@register()
class Math extends Widget.Box implements ModeContent {
    constructor() {
        super({ name: "math", className: "math" });
    }

    updateContent(search: string): void {
        throw new Error("Method not implemented.");
    }

    handleActivate(search: string): void {
        throw new Error("Method not implemented.");
    }
}

@register()
class Windows extends Widget.Box implements ModeContent {
    constructor() {
        super({ name: "windows", className: "windows" });
    }

    updateContent(search: string): void {
        throw new Error("Method not implemented.");
    }

    handleActivate(search: string): void {
        throw new Error("Method not implemented.");
    }
}

const SearchBar = ({ mode, entry }: { mode: Variable<Mode>; entry: Widget.Entry }) => (
    <box className="search-bar">
        <label className="mode" label={bind(mode)} />
        {entry}
    </box>
);

const ModeSwitcher = ({ mode, modes }: { mode: Variable<Mode>; modes: Mode[] }) => (
    <box homogeneous hexpand className="mode-switcher">
        {modes.map(m => (
            <button
                className={bind(mode).as(c => `mode ${c === m ? "selected" : ""}`)}
                cursor="pointer"
                onClicked={() => mode.set(m)}
            >
                <box halign={Gtk.Align.CENTER}>
                    <label className="icon" label={getModeIcon(m)} />
                    <label label={getPrettyMode(m)} />
                </box>
            </button>
        ))}
    </box>
);

@register()
export default class Launcher extends PopupWindow {
    readonly mode: Variable<Mode>;

    constructor() {
        const entry = (<entry hexpand className="entry" />) as Widget.Entry;
        const mode = Variable<Mode>("apps");
        const content = {
            apps: new Apps(),
            files: new Files(),
            math: new Math(),
            windows: new Windows(),
        };

        super({
            name: "launcher",
            anchor:
                Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT,
            keymode: Astal.Keymode.EXCLUSIVE,
            borderWidth: 0,
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
            child: (
                <box
                    vertical
                    halign={Gtk.Align.CENTER}
                    valign={Gtk.Align.CENTER}
                    className={bind(mode).as(m => `launcher ${m}`)}
                >
                    <SearchBar mode={mode} entry={entry} />
                    <stack
                        expand
                        transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                        transitionDuration={200}
                        shown={bind(mode)}
                    >
                        {Object.values(content)}
                    </stack>
                    <ModeSwitcher mode={mode} modes={Object.keys(content) as Mode[]} />
                </box>
            ),
        });

        this.mode = mode;

        content[mode.get()].updateContent(entry.get_text());
        this.hook(mode, (_, v: Mode) => {
            entry.set_text("");
            content[v].updateContent(entry.get_text());
        });
        this.hook(entry, "changed", () => content[mode.get()].updateContent(entry.get_text()));
        this.hook(entry, "activate", () => content[mode.get()].handleActivate(entry.get_text()));

        // Clear search on hide if not in math mode or creating a todo
        this.connect("hide", () => mode.get() !== "math" && !entry.text.startsWith(">todo") && entry.set_text(""));
    }

    open(mode: Mode) {
        this.mode.set(mode);
        this.show();
    }
}
