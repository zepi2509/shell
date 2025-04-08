import Notification from "@/widgets/notification";
import { bind } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";

const List = ({ compact }: { compact?: boolean }) => (
    <box
        vertical
        valign={Gtk.Align.START}
        className="list"
        setup={self => {
            const notifd = AstalNotifd.get_default();
            const map = new Map<number, Notification>();

            const addNotification = (notification: AstalNotifd.Notification) => {
                const notif = (<Notification notification={notification} compact={compact} />) as Notification;
                notif.connect("destroy", () => map.get(notification.id) === notif && map.delete(notification.id));
                map.get(notification.id)?.destroyWithAnims();
                map.set(notification.id, notif);

                const widget = (
                    <eventbox
                        // Dismiss on middle click
                        onClick={(_, event) => event.button === Astal.MouseButton.MIDDLE && notification.dismiss()}
                        setup={self => self.hook(notif, "destroy", () => self.destroy())}
                    >
                        {notif}
                    </eventbox>
                );

                self.pack_end(widget, false, false, 0);
            };

            notifd
                .get_notifications()
                .sort((a, b) => a.time - b.time)
                .forEach(addNotification);

            self.hook(notifd, "notified", (_, id) => addNotification(notifd.get_notification(id)));
            self.hook(notifd, "resolved", (_, id) => map.get(id)?.destroyWithAnims());
        }}
    />
);

const NoNotifs = () => (
    <box homogeneous name="empty">
        <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="empty">
            <label className="icon" label="mark_email_unread" />
            <label label="All caught up!" />
        </box>
    </box>
);

export default ({ compact }: { compact?: boolean }) => (
    <box vertical className="notifications">
        <box className="header-bar">
            <label
                label={bind(AstalNotifd.get_default(), "notifications").as(
                    n => `${n.length} notification${n.length === 1 ? "" : "s"}`
                )}
            />
            <box hexpand />
            <button
                className={bind(AstalNotifd.get_default(), "dontDisturb").as(d => (d ? "enabled" : ""))}
                cursor="pointer"
                onClicked={() => (AstalNotifd.get_default().dontDisturb = !AstalNotifd.get_default().dontDisturb)}
                label="󰂛 Silence"
            />
            <button
                cursor="pointer"
                onClicked={() =>
                    AstalNotifd.get_default()
                        .get_notifications()
                        .forEach(n => n.dismiss())
                }
                label="󰎟 Clear"
            />
        </box>
        <stack
            transitionType={Gtk.StackTransitionType.CROSSFADE}
            transitionDuration={200}
            shown={bind(AstalNotifd.get_default(), "notifications").as(n => (n.length > 0 ? "list" : "empty"))}
        >
            <NoNotifs />
            <scrollable expand hscroll={Gtk.PolicyType.NEVER} name="list">
                <List compact={compact} />
            </scrollable>
        </stack>
    </box>
);
