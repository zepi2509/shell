import Palette from "@/services/palette";
import Updates, { Repo as IRepo, Update as IUpdate } from "@/services/updates";
import { MenuItem, setupCustomTooltip } from "@/utils/widgets";
import { bind, execAsync, GLib, Variable } from "astal";
import { Astal, Gtk } from "astal/gtk3";

const constructItem = (label: string, exec: string, quiet = true) =>
    new MenuItem({ label, onActivate: () => execAsync(exec).catch(e => !quiet && console.error(e)) });

const Update = (update: IUpdate) => {
    const menu = new Gtk.Menu();
    menu.append(constructItem("Open info in browser", `xdg-open '${update.url}'`, false));
    menu.append(constructItem("Open info in terminal", `uwsm app -- foot -H -- pacman -Qi ${update.name}`));
    menu.append(new Gtk.SeparatorMenuItem({ visible: true }));
    menu.append(constructItem("Reinstall", `uwsm app -- foot -H -- yay -S ${update.name}`));
    menu.append(constructItem("Remove with dependencies", `uwsm app -- foot -H -- yay -Rns ${update.name}`));

    return (
        <button
            onClick={(_, event) => event.button === Astal.MouseButton.SECONDARY && menu.popup_at_pointer(null)}
            onDestroy={() => menu.destroy()}
        >
            <label
                truncate
                useMarkup
                xalign={0}
                label={bind(Palette.get_default(), "colours").as(
                    c =>
                        `${update.name} <span foreground="${c.teal}">(${update.version.old} -> ${
                            update.version.new
                        })</span>\n    <span foreground="${c.subtext0}">${GLib.markup_escape_text(
                            update.description,
                            update.description.length
                        )}</span>`
                )}
                setup={self => setupCustomTooltip(self, `${update.name} • ${update.description}`)}
            />
        </button>
    );
};

const Repo = ({ repo }: { repo: IRepo }) => {
    const expanded = Variable(false);

    return (
        <box vertical className="repo">
            <button className="wrapper" cursor="pointer" onClicked={() => expanded.set(!expanded.get())}>
                <box className="header">
                    <label className="icon" label={repo.icon} />
                    <label label={`${repo.name} (${repo.updates.length})`} />
                    <box hexpand />
                    <label className="icon" label={bind(expanded).as(e => (e ? "expand_less" : "expand_more"))} />
                </box>
            </button>
            <revealer
                revealChild={bind(expanded)}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                transitionDuration={200}
            >
                <box vertical className="body">
                    {repo.updates.map(Update)}
                </box>
            </revealer>
        </box>
    );
};

const List = () => (
    <box vertical valign={Gtk.Align.START} className="list">
        {bind(Updates.get_default(), "updateData").as(d => d.repos.map(r => <Repo repo={r} />))}
    </box>
);

const NoUpdates = () => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="deployed_code_history" />
            <label label="All packages up to date!" />
        </box>
    </box>
);

export default () => (
    <box vertical className="updates">
        <box className="header-bar">
            <label
                label={bind(Updates.get_default(), "numUpdates").as(n => `${n} update${n === 1 ? "" : "s"} available`)}
            />
            <box hexpand />
            <button
                className={bind(Updates.get_default(), "loading").as(l => (l ? "enabled" : ""))}
                sensitive={bind(Updates.get_default(), "loading").as(l => !l)}
                cursor="pointer"
                onClicked={() => Updates.get_default().getUpdates()}
                label={bind(Updates.get_default(), "loading").as(l => (l ? "󰑓 Loading" : "󰑓 Reload"))}
            />
        </box>
        <stack
            transitionType={Gtk.StackTransitionType.CROSSFADE}
            transitionDuration={200}
            shown={bind(Updates.get_default(), "numUpdates").as(n => (n > 0 ? "list" : "empty"))}
        >
            <NoUpdates />
            <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                <List />
            </scrollable>
        </stack>
    </box>
);
