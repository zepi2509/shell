import { execAsync } from "astal";
import { App, Astal, Gtk } from "astal/gtk3";
import PopupWindow from "../widgets/popupwindow";

const Item = ({ icon, label, cmd, isDefault }: { icon: string; label: string; cmd: string; isDefault?: boolean }) => (
    <box vertical className="item">
        <button
            cursor="pointer"
            onClicked={() => execAsync(cmd).catch(console.error)}
            setup={self =>
                isDefault &&
                self.hook(App, "window-toggled", (_, window) => {
                    if (window.name === "session" && window.visible) self.grab_focus();
                })
            }
        >
            <label className="icon" label={icon} />
        </button>
        <label className="label" label={label} />
    </box>
);

export default () => (
    <PopupWindow
        className="session"
        name="session"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.LEFT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
        exclusivity={Astal.Exclusivity.IGNORE}
        keymode={Astal.Keymode.EXCLUSIVE}
        layer={Astal.Layer.OVERLAY}
        borderWidth={0} // Don't need border width cause takes up entire screen
    >
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="inner">
            <box>
                <Item icon="logout" label="Logout" cmd="uwsm stop" isDefault />
                <Item icon="cached" label="Reboot" cmd="systemctl reboot" />
            </box>
            <box>
                <Item icon="downloading" label="Hibernate" cmd="systemctl hibernate" />
                <Item icon="power_settings_new" label="Shutdown" cmd="systemctl poweroff" />
            </box>
        </box>
    </PopupWindow>
);
