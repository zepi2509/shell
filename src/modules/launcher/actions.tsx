import { Apps } from "@/services/apps";
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
}

interface ActionMap {
    [k: string]: IAction;
}

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
    scheme: {
        icon: "palette",
        name: "Scheme",
        description: "Change the current colour scheme",
        action: (...args) => {
            // If no args, autocomplete cmd
            if (args.length === 0) {
                entry.set_text(">scheme ");
                entry.set_position(-1);
                return;
            }

            execAsync(`caelestia scheme ${args[0]}`).catch(console.error);
            close();
        },
    },
    todo: {
        icon: "checklist",
        name: "Todo",
        description: "Create a todo in Todoist",
        action: (...args) => {
            // If no args, autocomplete cmd
            if (args.length === 0) {
                entry.set_text(">todo ");
                entry.set_position(-1);
                return;
            }

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
        for (const { target } of fuzzysort.go(args[0].slice(1), this.#list, { all: true }))
            this.#content.add(<Action {...this.#map[target]} args={args.slice(1)} />);
    }

    handleActivate(): void {
        this.#content.get_child_at_index(0)?.get_child()?.grab_focus();
        this.#content.get_child_at_index(0)?.get_child()?.activate();
    }
}
