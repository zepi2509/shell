import { Apps as AppsService } from "@/services/apps";
import { getAppCategoryIcon } from "@/utils/icons";
import { launch } from "@/utils/system";
import { type FlowBox, setupCustomTooltip } from "@/utils/widgets";
import { execAsync, Gio, register } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import { launcher as config } from "config";
import type AstalApps from "gi://AstalApps";
import { close, ContentBox, type LauncherContent, limitLength } from "./util";

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
class Apps extends Widget.Box implements LauncherContent {
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
class Files extends Widget.Box implements LauncherContent {
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
class Math extends Widget.Box implements LauncherContent {
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
class Windows extends Widget.Box implements LauncherContent {
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

export default () => ({
    apps: new Apps(),
    files: new Files(),
    math: new Math(),
    windows: new Windows(),
});
