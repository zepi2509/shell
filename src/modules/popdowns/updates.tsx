import Palette from "@/services/palette";
import Updates, { Repo as IRepo, Update as IUpdate } from "@/services/updates";
import { MenuItem } from "@/utils/widgets";
import PopdownWindow from "@/widgets/popdownwindow";
import { bind, execAsync, Variable } from "astal";
import { App, Astal, Gtk } from "astal/gtk3";

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
    menu.append(new Gtk.SeparatorMenuItem({ visible: true }));
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

const Repo = ({ repo, first }: { repo: IRepo; first?: boolean }) => {
    const expanded = Variable(first);

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

const News = ({ news }: { news: string }) => {
    const expanded = Variable(true);

    return (
        <box vertical className="repo">
            <button className="wrapper" cursor="pointer" onClicked={() => expanded.set(!expanded.get())}>
                <box className="header">
                    <label className="icon" label="newspaper" />
                    <label label="News" />
                    <box hexpand />
                    <label className="icon" label={bind(expanded).as(e => (e ? "expand_less" : "expand_more"))} />
                </box>
            </button>
            <revealer
                revealChild={bind(expanded)}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                transitionDuration={200}
            >
                <label
                    wrap
                    useMarkup
                    xalign={0}
                    className="news"
                    label={bind(Palette.get_default(), "teal").as(c =>
                        news
                            .slice(0, news.lastIndexOf("\n")) // Remove last line cause it contains an unopened \x1b[0m
                            .replace(/^([0-9]{4}-[0-9]{2}-[0-9]{2} .+)$/gm, "<b>$1</b>") // Make titles bold
                            // Replace color codes with html spans
                            .replaceAll("\x1b[36m", `<span foreground="${c}">`)
                            .replaceAll("\x1b[0m", "</span>")
                    )}
                />
            </revealer>
        </box>
    );
};

const List = () => (
    <box vertical valign={Gtk.Align.START} className="repos">
        {bind(Updates.get_default(), "updateData").as(d =>
            d.news
                ? [<News news={d.news} />, ...d.repos.map(r => <Repo repo={r} />)]
                : d.repos.map((r, i) => <Repo repo={r} first={i === 0} />)
        )}
    </box>
);

export default () => (
    <PopdownWindow
        name="updates"
        count={bind(Updates.get_default(), "numUpdates")}
        headerButtons={[
            {
                label: "Update all",
                onClicked: () =>
                    execAsync("uwsm app -T -- yay")
                        .then(() => Updates.get_default().getUpdates())
                        // Ignore errors
                        .catch(() => {}),
            },
            {
                label: bind(Updates.get_default(), "loading").as(l => (l ? "Loading" : "Reload")),
                onClicked: () => Updates.get_default().getUpdates(),
                enabled: bind(Updates.get_default(), "loading"),
            },
        ]}
        emptyIcon="deployed_code_history"
        emptyLabel="All packages up to date!"
        list={<List />}
    />
);
