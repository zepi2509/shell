import PopupWindow from "@/widgets/popupwindow";
import { bind, register, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import { launcher as config } from "config";
import Actions from "./actions";
import Modes from "./modes";
import type { Mode } from "./util";

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

const isAction = (text: string) => text.startsWith(config.actionPrefix.get());

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
        const entry = (
            <entry
                hexpand
                className="entry"
                placeholderText={bind(config.actionPrefix).as(p => `Type "${p}" for subcommands`)}
            />
        ) as Widget.Entry;
        const mode = Variable<Mode>("apps");
        const content = Modes();
        const actions = new Actions(mode, entry);

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
                        transitionType={Gtk.StackTransitionType.CROSSFADE}
                        transitionDuration={100}
                        shown={bind(entry, "text").as(t => (isAction(t) ? "actions" : "content"))}
                    >
                        <stack
                            name="content"
                            transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
                            transitionDuration={200}
                            shown={bind(mode)}
                        >
                            {Object.values(content)}
                        </stack>
                        {actions}
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
        this.hook(entry, "changed", () =>
            (isAction(entry.get_text()) ? actions : content[mode.get()]).updateContent(entry.get_text())
        );
        this.hook(entry, "activate", () => {
            (isAction(entry.get_text()) ? actions : content[mode.get()]).handleActivate(entry.get_text());
            entry.set_text(""); // Clear search on activate
        });

        // Clear search on hide if not in math mode or creating a todo
        this.connect("hide", () => mode.get() !== "math" && !entry.text.startsWith(">todo") && entry.set_text(""));
    }

    open(mode: Mode) {
        this.mode.set(mode);
        this.show();
    }
}
