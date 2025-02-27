import PopupWindow from "@/widgets/popupwindow";
import { bind, register, Variable } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";

type Mode = "apps" | "files" | "math" | "windows";

interface ModeContent {
    updateContent(search: string): void;
    handleActivate(search: string): void;
}

@register()
class Apps extends Widget.Box implements ModeContent {
    constructor() {
        super({ name: "apps" });
    }

    updateContent(search: string): void {
        throw new Error("Method not implemented.");
    }

    handleActivate(search: string): void {
        throw new Error("Method not implemented.");
    }
}

@register()
class Files extends Widget.Box implements ModeContent {
    constructor() {
        super({ name: "files" });
    }

    updateContent(search: string): void {
        throw new Error("Method not implemented.");
    }

    handleActivate(search: string): void {
        throw new Error("Method not implemented.");
    }
}

@register()
class Math extends Widget.Box implements ModeContent {
    constructor() {
        super({ name: "math" });
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
        super({ name: "windows" });
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
                label={m}
            />
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
