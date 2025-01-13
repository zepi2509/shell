import { GLib, register, timeout } from "astal";
import { Astal, Gtk, Widget } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import { desktopEntrySubs } from "../utils/icons";

const urgencyToString = (urgency: AstalNotifd.Urgency) => {
    switch (urgency) {
        case AstalNotifd.Urgency.LOW:
            return "low";
        case AstalNotifd.Urgency.NORMAL:
            return "normal";
        case AstalNotifd.Urgency.CRITICAL:
            return "critical";
    }
};

const getTime = (time: number) => {
    const messageTime = GLib.DateTime.new_from_unix_local(time);
    const todayDay = GLib.DateTime.new_now_local().get_day_of_year();
    if (messageTime.get_day_of_year() === todayDay) {
        const aMinuteAgo = GLib.DateTime.new_now_local().add_seconds(-60);
        return aMinuteAgo !== null && messageTime.compare(aMinuteAgo) > 0 ? "Now" : messageTime.format("%H:%M");
    } else if (messageTime.get_day_of_year() === todayDay - 1) return "Yesterday";
    return messageTime.format("%d/%m");
};

const AppIcon = ({ appIcon, desktopEntry }: { appIcon: string; desktopEntry: string }) => {
    // Try app icon
    let icon = Astal.Icon.lookup_icon(appIcon) && appIcon;
    // Try desktop entry
    if (!icon) {
        if (desktopEntrySubs.hasOwnProperty(desktopEntry)) icon = desktopEntrySubs[desktopEntry];
        else if (Astal.Icon.lookup_icon(desktopEntry)) icon = desktopEntry;
    }
    return icon ? <icon className="app-icon" icon={icon} /> : null;
};

const Image = ({ icon }: { icon: string }) => {
    if (GLib.file_test(icon, GLib.FileTest.EXISTS))
        return (
            <box
                valign={Gtk.Align.START}
                className="image"
                css={`
                    background-image: url("${icon}");
                `}
            />
        );
    if (Astal.Icon.lookup_icon(icon)) return <icon valign={Gtk.Align.START} className="image" icon={icon} />;
    return null;
};

@register()
class NotifPopup extends Widget.Box {
    readonly #revealer;
    #destroyed = false;

    constructor({ notification }: { notification: AstalNotifd.Notification }) {
        super();

        this.#revealer = (
            <revealer revealChild transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN} transitionDuration={150}>
                <box className="wrapper">
                    <box vertical className={`popup ${urgencyToString(notification.urgency)}`}>
                        <box className="header">
                            <AppIcon appIcon={notification.appIcon} desktopEntry={notification.appName} />
                            <label className="app-name" label={notification.appName ?? "Unknown"} />
                            <box hexpand />
                            <label
                                className="time"
                                label={getTime(notification.time)!}
                                setup={self =>
                                    timeout(60000, () => !this.#destroyed && (self.label = getTime(notification.time)!))
                                }
                            />
                        </box>
                        <box hexpand className="separator" />
                        <box className="content">
                            {notification.image && <Image icon={notification.image} />}
                            <box vertical>
                                <label className="summary" xalign={0} label={notification.summary} truncate />
                                <label className="body" xalign={0} label={notification.body} wrap useMarkup />
                            </box>
                        </box>
                        <box className="actions">
                            <button hexpand cursor="pointer" onClicked={() => notification.dismiss()} label="Close" />
                            {notification.actions.map(a => (
                                <button hexpand cursor="pointer" onClicked={() => notification.invoke(a.id)}>
                                    {notification.actionIcons ? <icon icon={a.label} /> : a.label}
                                </button>
                            ))}
                        </box>
                    </box>
                </box>
            </revealer>
        ) as Widget.Revealer;
        this.add(this.#revealer);

        // Init animation
        const width = this.get_preferred_width()[1];
        this.css = `margin-left: ${width}px; margin-right: -${width}px;`;
        timeout(1, () => {
            this.css = `transition: 150ms cubic-bezier(0.05, 0.9, 0.1, 1.1); margin-left: 0; margin-right: 0;`;
        });

        // Close popup after timeout if transient
        if (notification.transient)
            timeout(
                notification.expireTimeout > 0
                    ? notification.expireTimeout
                    : notification.urgency === AstalNotifd.Urgency.CRITICAL
                    ? 10000
                    : 5000,
                () => this.destroyWithAnims()
            );
    }

    destroyWithAnims() {
        if (this.#destroyed) return;
        this.#destroyed = true;

        const animTime = 120;
        const animMargin = this.get_allocated_width();
        this.css = `transition: ${animTime}ms cubic-bezier(0.85, 0, 0.15, 1);
                    margin-left: ${animMargin}px; margin-right: -${animMargin}px;`;
        timeout(animTime, () => {
            this.#revealer.revealChild = false;
            timeout(this.#revealer.transitionDuration, () => this.destroy());
        });
    }
}

export default () => (
    <window
        namespace="caelestia-notifpopups"
        anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM}
    >
        <box
            vertical
            valign={Gtk.Align.START}
            className="notifpopups"
            setup={self => {
                const notifd = AstalNotifd.get_default();
                const map = new Map<number, NotifPopup>();
                self.hook(notifd, "notified", (self, id) => {
                    const notification = notifd.get_notification(id);
                    const popup = (<NotifPopup notification={notification} />) as NotifPopup;
                    map.set(notification.id, popup);
                    self.add(
                        <eventbox
                            // Dismiss on middle click
                            onClick={(_, event) => event.button === Astal.MouseButton.MIDDLE && notification.dismiss()}
                            // Close on hover lost
                            onHoverLost={() => popup.destroyWithAnims()}
                        >
                            {popup}
                        </eventbox>
                    );
                });
                self.hook(notifd, "resolved", (_, id) => {
                    const popup = map.get(id);
                    if (popup) {
                        popup.destroyWithAnims();
                        map.delete(id);
                    }
                });

                // Change input region to child region so can click through empty space
                self.connect("size-allocate", () => self.get_window()?.set_child_input_shapes());
            }}
        />
    </window>
);
