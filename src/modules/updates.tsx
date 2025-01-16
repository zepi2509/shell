import { bind, execAsync, Variable } from "astal";
import { App, Astal, Gtk } from "astal/gtk3";
import Updates, { Repo as IRepo, Update as IUpdate } from "../services/updates";
import { MenuItem } from "../utils/widgets";
import PopupWindow from "../widgets/popupwindow";

const constructItem = (label: string, exec: string, quiet = true) =>
    new MenuItem({
        label,
        onActivate() {
            App.get_window("updates")?.hide();
            execAsync(exec).catch(e => !quiet && console.error(e));
        },
    });

const Update = (update: IUpdate) => {
    const menu = new Gtk.Menu();
    menu.append(constructItem("Open info in browser", `xdg-open '${update.url}'`, false));
    menu.append(constructItem("Open info in terminal", `uwsm app -- foot -H pacman -Qi ${update.name}`));
    menu.append(constructItem("Reinstall", `uwsm app -T -- yay -S ${update.name}`));
    menu.append(constructItem("Remove with dependencies", `uwsm app -T -- yay -Rns ${update.name}`));

    return (
        <button
            onClick={(_, event) => event.button === Astal.MouseButton.SECONDARY && menu.popup_at_pointer(null)}
            onDestroy={() => menu.destroy()}
        >
            <label
                truncate
                xalign={0}
                label={`${update.name} (${update.version.old} -> ${update.version.new})\n    ${update.description}`}
            />
        </button>
    );
};

const Repo = (repo: IRepo) => {
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
                <box vertical className="list">
                    {repo.updates.map(Update)}
                </box>
            </revealer>
        </box>
    );
};

const List = () => (
    <box vertical valign={Gtk.Align.START} className="repos">
        {bind(Updates.get_default(), "updateData").as(d => d.repos.map(Repo))}
    </box>
);

export default () => (
    <PopupWindow name="updates">
        <box vertical className="updates">
            <box className="header">
                <label label={bind(Updates.get_default(), "numUpdates").as(n => `${n} update${n === 1 ? "" : "s"}`)} />
                <box hexpand />
                <button
                    cursor="pointer"
                    onClicked={() =>
                        execAsync("uwsm app -T -- yay")
                            .then(() => Updates.get_default().getUpdates())
                            // Ignore errors
                            .catch(() => {})
                    }
                    label="Update all"
                />
                <button cursor="pointer" onClicked={() => Updates.get_default().getUpdates()} label="Reload" />
            </box>
            <stack
                transitionType={Gtk.StackTransitionType.CROSSFADE}
                transitionDuration={150}
                shown={bind(Updates.get_default(), "numUpdates").as(n => (n > 0 ? "list" : "empty"))}
            >
                <box vertical valign={Gtk.Align.CENTER} name="empty">
                    <label className="icon" label="deployed_code_history" />
                    <label label="All packages up to date!" />
                </box>
                <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                    <List />
                </scrollable>
            </stack>
        </box>
    </PopupWindow>
);
