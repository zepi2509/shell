import { bind } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import Notification from "../widgets/notification";
import PopupWindow from "../widgets/popupwindow";

const List = () => (
    <box
        vertical
        valign={Gtk.Align.START}
        className="list"
        setup={self => {
            const notifd = AstalNotifd.get_default();
            const map = new Map<number, Notification>();

            const addNotification = (notification: AstalNotifd.Notification) => {
                const notif = (<Notification notification={notification} />) as Notification;
                notif.connect("destroy", () => map.get(notification.id) === notif && map.delete(notification.id));
                map.get(notification.id)?.destroyWithAnims();
                map.set(notification.id, notif);

                self.pack_end(
                    <eventbox
                        // Dismiss on middle click
                        onClick={(_, event) => event.button === Astal.MouseButton.MIDDLE && notification.dismiss()}
                    >
                        {notif}
                    </eventbox>,
                    false,
                    false,
                    0
                );
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

export default () => (
    <PopupWindow name="notifications">
        <box vertical className="notifications">
            <box className="header">
                <label
                    label={bind(AstalNotifd.get_default(), "notifications").as(
                        n => `${n.length} notification${n.length === 1 ? "" : "s"}`
                    )}
                />
                <box hexpand />
                <button
                    cursor="pointer"
                    onClicked={() => (AstalNotifd.get_default().dontDisturb = !AstalNotifd.get_default().dontDisturb)}
                    label="Silence"
                    className={bind(AstalNotifd.get_default(), "dontDisturb").as(d => (d ? "enabled" : ""))}
                />
                <button
                    cursor="pointer"
                    onClicked={() => AstalNotifd.get_default().notifications.forEach(n => n.dismiss())}
                    label="Clear"
                />
            </box>
            <scrollable expand hscroll={Gtk.PolicyType.NEVER}>
                <List />
            </scrollable>
        </box>
    </PopupWindow>
);
