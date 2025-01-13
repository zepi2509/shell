import { bind, Gio, timeout, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import type AstalApps from "gi://AstalApps";
import AstalHyprland from "gi://AstalHyprland";
import { Apps } from "../services/apps";
import { getAppCategoryIcon } from "../utils/icons";
import { launch } from "../utils/system";
import { PopupWindow, setupCustomTooltip, TransitionType } from "../utils/widgets";

const maxSearchResults = 15;

const browser = [
    "firefox",
    "waterfox",
    "google-chrome",
    "chromium",
    "brave-browser",
    "vivaldi-stable",
    "vivaldi-snapshot",
];
const terminal = ["foot", "alacritty", "kitty", "wezterm"];
const files = ["thunar", "nemo", "nautilus"];
const ide = ["codium", "code", "clion", "intellij-idea-ultimate-edition"];
const music = ["spotify-adblock", "spotify", "audacious", "elisa"];

const launchAndClose = (self: JSX.Element, astalApp: AstalApps.Application) => {
    const toplevel = self.get_toplevel();
    if (toplevel instanceof Widget.Window) toplevel.hide();
    launch(astalApp);
};

const PinnedApp = ({ names }: { names: string[] }) => {
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
            className="app"
            cursor="pointer"
            onClicked={self => launchAndClose(self, astalApp!)}
            setup={self => setupCustomTooltip(self, app.get_display_name())}
        >
            <icon gicon={app.get_icon()!} />
        </button>
    ) : null;
};

const PinnedApps = () => (
    <box homogeneous className="pinned">
        <PinnedApp names={browser} />
        <PinnedApp names={terminal} />
        <PinnedApp names={files} />
        <PinnedApp names={ide} />
        <PinnedApp names={music} />
    </box>
);

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

const Result = ({ app }: { app: AstalApps.Application }) => (
    <button className="app" cursor="pointer" onClicked={self => launchAndClose(self, app)}>
        <box>
            {Astal.Icon.lookup_icon(app.iconName) ? (
                <icon className="icon" icon={app.iconName} />
            ) : (
                <label className="icon" label={getAppCategoryIcon(app)} />
            )}
            <label xalign={0} label={app.name} />
        </box>
    </button>
);

const Results = ({ entry }: { entry: Widget.Entry }) => {
    const empty = Variable(true);
    return (
        <stack
            className="results"
            transitionType={Gtk.StackTransitionType.CROSSFADE}
            transitionDuration={150}
            shown={bind(empty).as(t => (t ? "empty" : "list"))}
        >
            <box name="empty" className="empty" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
                <label className="icon" label="apps_outage" />
                <label label="No results" />
            </box>
            <box
                vertical
                name="list"
                setup={self => {
                    let apps: AstalApps.Application[] = [];
                    self.hook(entry, "activate", () => {
                        if (entry.text && apps[0]) launchAndClose(self, apps[0]);
                    });
                    self.hook(entry, "changed", () => {
                        if (!entry.text) return;
                        self.foreach(ch => ch.destroy());
                        apps = Apps.fuzzy_query(entry.text);
                        empty.set(apps.length === 0);
                        if (apps.length > maxSearchResults) apps.length = maxSearchResults;
                        for (const app of apps) self.add(<Result app={app} />);
                    });
                }}
            />
        </stack>
    );
};

const Launcher = ({ entry }: { entry: Widget.Entry }) => (
    <box
        vertical
        className="launcher"
        css={bind(AstalHyprland.get_default(), "focusedMonitor").as(m => `margin-top: ${m.height / 4}px;`)}
    >
        <box className="search-bar">
            <label className="icon" label="search" />
            <SearchEntry entry={entry} />
            <label className="icon" label="apps" />
        </box>
        <revealer
            revealChild={bind(entry, "textLength").as(t => t === 0)}
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            transitionDuration={150}
        >
            <PinnedApps />
        </revealer>
        <revealer
            revealChild={bind(entry, "textLength").as(t => t > 0)}
            transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
            transitionDuration={150}
        >
            <Results entry={entry} />
        </revealer>
    </box>
);

export default () => {
    const entry = (<entry name="entry" />) as Widget.Entry;

    return (
        <PopupWindow
            name="launcher"
            keymode={Astal.Keymode.EXCLUSIVE}
            exclusivity={Astal.Exclusivity.IGNORE}
            onKeyPressEvent={(_, event) => {
                const keyval = event.get_keyval()[1];
                // Focus entry on typing
                if (!entry.isFocus && keyval >= 32 && keyval <= 126) {
                    entry.text += String.fromCharCode(keyval);
                    entry.grab_focus();
                    entry.set_position(-1);

                    // Consume event, if not consumed it will duplicate character in entry
                    return true;
                }
            }}
            // Clear entry text on hide
            setup={self => self.connect("hide", () => entry.set_text(""))}
            transitionType={TransitionType.SLIDE_DOWN}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.START}
        >
            <Launcher entry={entry} />
        </PopupWindow>
    );
};
