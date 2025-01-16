import { bind } from "astal";
import { Astal, Gtk } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import Notification from "../widgets/notification";
import PopdownWindow from "../widgets/popdownwindow";

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
    <PopdownWindow
        name="notifications"
        count={bind(AstalNotifd.get_default(), "notifications").as(n => n.length)}
        headerButtons={[
            {
                label: "Silence",
                onClicked: () => (AstalNotifd.get_default().dontDisturb = !AstalNotifd.get_default().dontDisturb),
                className: bind(AstalNotifd.get_default(), "dontDisturb").as(d => (d ? "enabled" : "")),
            },
            {
                label: "Clear",
                onClicked: () => AstalNotifd.get_default().notifications.forEach(n => n.dismiss()),
            },
        ]}
        emptyIcon="notifications_active"
        emptyLabel="All caught up!"
        list={<List />}
    />
);
