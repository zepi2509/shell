import { Gtk } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import { PopupWindow, setupChildClickthrough } from "../utils/widgets";

const List = () => (
    <box
        vertical
        valign={Gtk.Align.START}
        className="list"
        setup={self => {
            const notifd = AstalNotifd.get_default();
            const map = new Map<number, NotifPopup>();
            self.hook(notifd, "notified", (self, id) => {
                const notification = notifd.get_notification(id);

                const popup = (<NotifPopup notification={notification} />) as NotifPopup;
                popup.connect("destroy", () => map.get(notification.id) === popup && map.delete(notification.id));
                map.get(notification.id)?.destroyWithAnims();
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

                // Limit number of popups
                if (config.maxPopups > 0 && self.children.length > config.maxPopups)
                    map.values().next().value?.destroyWithAnims();
            });
            self.hook(notifd, "resolved", (_, id) => map.get(id)?.destroyWithAnims());

            // Change input region to child region so can click through empty space
            setupChildClickthrough(self);
        }}
    />
);

export default class Notifications extends PopupWindow {
    constructor() {
        super({
            name: "notifications",
            child: (
                <box>
                    <List />
                </box>
            ),
        });

        setupChildClickthrough(self);
    }
}
