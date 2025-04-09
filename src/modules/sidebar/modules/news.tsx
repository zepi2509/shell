import Palette from "@/services/palette";
import Updates from "@/services/updates";
import { setupCustomTooltip } from "@/utils/widgets";
import { bind, Variable } from "astal";
import { Gtk } from "astal/gtk3";

const countNews = (news: string) => news.match(/^([0-9]{4}-[0-9]{2}-[0-9]{2} .+)$/gm)?.length ?? 0;

const News = ({ header, body }: { header: string; body: string }) => {
    const expanded = Variable(false);

    body = body
        .slice(0, -5) // Remove last unopened \x1b[0m
        .replaceAll("\x1b[0m", "</span>"); // Replace reset code with end span

    return (
        <box vertical className="article">
            <button
                className="wrapper"
                cursor="pointer"
                onClicked={() => expanded.set(!expanded.get())}
                setup={self => setupCustomTooltip(self, header)}
            >
                <box hexpand className="header">
                    <label className="icon" label="newspaper" />
                    <box vertical>
                        <label xalign={0} label={header.split(" ")[0]} />
                        <label
                            truncate
                            xalign={0}
                            className="sublabel"
                            label={header.replace(/[0-9]{4}-[0-9]{2}-[0-9]{2} /, "")}
                        />
                    </box>
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
                    className="body"
                    label={bind(Palette.get_default(), "teal").as(
                        c => body.replaceAll("\x1b[36m", `<span foreground="${c}">`) // Replace colour codes with html spans
                    )}
                />
            </revealer>
        </box>
    );
};

const List = () => (
    <box vertical valign={Gtk.Align.START} className="list">
        {bind(Updates.get_default(), "news").as(n => {
            const children = [];
            const news = n.split(/^([0-9]{4}-[0-9]{2}-[0-9]{2} .+)$/gm);
            for (let i = 1; i < news.length - 1; i += 2)
                children.push(<News header={news[i].trim()} body={news[i + 1].trim()} />);
            return children;
        })}
    </box>
);

const NoNews = () => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="breaking_news" />
            <label label="No Arch news!" />
        </box>
    </box>
);

export default () => (
    <box vertical className="news">
        <box className="header-bar">
            <label
                label={bind(Updates.get_default(), "news")
                    .as(countNews)
                    .as(n => `${n} news article${n === 1 ? "" : "s"}`)}
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
            shown={bind(Updates.get_default(), "news").as(n => (n ? "list" : "empty"))}
        >
            <NoNews />
            <scrollable
                className={bind(Updates.get_default(), "news").as(n => (n ? "expanded" : ""))}
                hscroll={Gtk.PolicyType.NEVER}
                name="list"
            >
                <List />
            </scrollable>
        </stack>
    </box>
);
