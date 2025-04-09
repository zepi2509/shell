import News, { type IArticle } from "@/services/news";
import Palette, { type IPalette } from "@/services/palette";
import { capitalize } from "@/utils/strings";
import { setupCustomTooltip } from "@/utils/widgets";
import { bind, execAsync, Variable } from "astal";
import { Gtk } from "astal/gtk3";

const fixGoogleNews = (colours: IPalette, title: string, desc: string) => {
    // Add separator, bold and split at domain (domain is at the end of each headline)
    const domain = title.split(" - ").at(-1);
    if (domain) desc = desc.replaceAll(domain, `— <span foreground="${colours.subtext0}">${domain}</span>\n\n`);
    // Split headlines
    desc = desc.replace(/(( |\.)[^A-Z][a-z]+)([A-Z])/g, "$1\n\n$3");
    desc = desc.replace(/( [A-Z]+)([A-Z](?![s])[a-z])/g, "$1\n\n$2");
    // Add separator and bold domains
    desc = desc.replace(/ ([a-zA-Z.]+)\n\n/g, ` — <span foreground="${colours.subtext0}">$1</span>\n\n`);
    desc = desc.replace(/ ([a-zA-Z.]+)$/, ` — <span foreground="${colours.subtext0}">$1</span>`); // Last domain
    return desc.trim();
};

const fixNews = (colours: IPalette, title: string, desc: string, source: string) => {
    // Add spaces between sentences
    desc = desc.replace(/\.([A-Z])/g, ". $1");
    // Google News needs some other fixes
    if (source === "Google News") desc = fixGoogleNews(colours, title, desc);
    return desc.replaceAll("&", "&amp;");
};

const getCategoryIcon = (category: string) => {
    if (category === "business") return "monitoring";
    if (category === "crime") return "speed_camera";
    if (category === "domestic") return "home";
    if (category === "education") return "school";
    if (category === "entertainment") return "tv";
    if (category === "environment") return "eco";
    if (category === "food") return "restaurant";
    if (category === "health") return "health_and_safety";
    if (category === "lifestyle") return "digital_wellbeing";
    if (category === "politics") return "account_balance";
    if (category === "science") return "science";
    if (category === "sports") return "sports_basketball";
    if (category === "technology") return "account_tree";
    if (category === "top") return "breaking_news";
    if (category === "tourism") return "travel";
    if (category === "world") return "public";
    return "newsmode";
};

const Article = ({ title, description, creator, pubDate, source_name, link }: IArticle) => {
    const expanded = Variable(false);

    return (
        <box vertical className="article">
            <button className="wrapper" cursor="pointer" onClicked={() => expanded.set(!expanded.get())}>
                <box hexpand className="header">
                    <box vertical>
                        <label truncate xalign={0} label={title} setup={self => setupCustomTooltip(self, title)} />
                        <label
                            truncate
                            xalign={0}
                            className="sublabel"
                            label={source_name + (creator ? ` (${creator.join(", ")})` : "")}
                        />
                    </box>
                </box>
            </button>
            <revealer
                revealChild={bind(expanded)}
                transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
                transitionDuration={200}
            >
                <button onClicked={() => execAsync(`app2unit -O -- ${link}`)}>
                    <box vertical className="article-body">
                        <label wrap xalign={0} label={`Published on ${new Date(pubDate).toLocaleString()}`} />
                        <label
                            wrap
                            xalign={0}
                            className="sublabel"
                            label={`By ${
                                creator?.join(", ") ??
                                (source_name === "Google News" ? title.split(" - ").at(-1) : source_name)
                            }`}
                        />
                        {description && (
                            <label
                                wrap
                                useMarkup
                                xalign={0}
                                label={bind(Palette.get_default(), "colours").as(c =>
                                    fixNews(c, title, description, source_name)
                                )}
                            />
                        )}
                    </box>
                </button>
            </revealer>
        </box>
    );
};

const Category = ({ title, articles }: { title: string; articles: IArticle[] }) => {
    const expanded = Variable(false);

    return (
        <box vertical className="category">
            <button className="wrapper" cursor="pointer" onClicked={() => expanded.set(!expanded.get())}>
                <box className="header">
                    <label className="icon" label={getCategoryIcon(title)} />
                    <label label={`${capitalize(title)} (${articles.length})`} />
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
                    {articles.map(a => (
                        <Article {...a} />
                    ))}
                </box>
            </revealer>
        </box>
    );
};

const List = () => (
    <box vertical valign={Gtk.Align.START} className="list">
        {bind(News.get_default(), "categories").as(c =>
            Object.entries(c).map(([k, v]) => <Category title={k} articles={v} />)
        )}
    </box>
);

const NoNews = () => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="full_coverage" />
            <label label="No news headlines!" />
        </box>
    </box>
);

export default () => (
    <box vertical className="headlines">
        <box className="header-bar">
            <label label="Top news headlines" />
            <box hexpand />
            <button
                className={bind(News.get_default(), "loading").as(l => (l ? "enabled" : ""))}
                sensitive={bind(News.get_default(), "loading").as(l => !l)}
                cursor="pointer"
                onClicked={() => News.get_default().getNews()}
                label={bind(News.get_default(), "loading").as(l => (l ? "󰑓 Loading" : "󰑓 Reload"))}
            />
        </box>
        <stack
            transitionType={Gtk.StackTransitionType.CROSSFADE}
            transitionDuration={200}
            shown={bind(News.get_default(), "articles").as(a => (a.length > 0 ? "list" : "empty"))}
        >
            <NoNews />
            <scrollable
                className={bind(News.get_default(), "articles").as(a => (a.length > 0 ? "expanded" : ""))}
                hscroll={Gtk.PolicyType.NEVER}
                name="list"
            >
                <List />
            </scrollable>
        </stack>
    </box>
);
