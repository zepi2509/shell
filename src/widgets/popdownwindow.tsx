import type { Binding } from "astal";
import { Gtk } from "astal/gtk3";
import PopupWindow from "./popupwindow";

export default ({
    name,
    count,
    headerButtons,
    emptyIcon,
    emptyLabel,
    list,
}: {
    name: string;
    count: Binding<number>;
    headerButtons: { label: string; onClicked: () => void; className?: Binding<string> }[];
    emptyIcon: string;
    emptyLabel: string;
    list: JSX.Element;
}) => (
    <PopupWindow name={name}>
        <box vertical className={name}>
            <box className="header">
                <label label={count.as(c => `${c} ${name.slice(0, -1)}${c === 1 ? "" : "s"}`)} />
                <box hexpand />
                {headerButtons.map(({ label, onClicked, className }) => (
                    <button cursor="pointer" onClicked={onClicked} label={label} className={className} />
                ))}
            </box>
            <stack
                transitionType={Gtk.StackTransitionType.CROSSFADE}
                transitionDuration={150}
                shown={count.as(c => (c > 0 ? "list" : "empty"))}
            >
                <box vertical valign={Gtk.Align.CENTER} name="empty">
                    <label className="icon" label={emptyIcon} />
                    <label label={emptyLabel} />
                </box>
                <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                    {list}
                </scrollable>
            </stack>
        </box>
    </PopupWindow>
);
