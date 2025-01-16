import { Astal, Gtk } from "astal/gtk3";
import AstalNotifd from "gi://AstalNotifd";
import { notifpopups as config } from "../../config";
import { setupChildClickthrough } from "../utils/widgets";
import Notification from "../widgets/notification";

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
                const map = new Map<number, Notification>();
                self.hook(notifd, "notified", (self, id) => {
                    const notification = notifd.get_notification(id);

                    const popup = (<Notification popup notification={notification} />) as Notification;
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
    </window>
);
