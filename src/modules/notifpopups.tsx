import type { Monitor } from "@/services/monitors";
import { idle, timeout } from "astal";
import { App, Astal, Gtk } from "astal/gtk3";
import { notifpopups as config } from "config";
import AstalNotifd from "gi://AstalNotifd";
import { setupChildClickthrough } from "../utils/widgets";
import Notification from "../widgets/notification";
import type SideBar from "./sidebar";

export default ({ monitor }: { monitor: Monitor }) => (
    <window
        monitor={monitor.id}
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
                    if (notifd.dontDisturb) return;

                    const notification = notifd.get_notification(id);

                    const popup = (<Notification popup notification={notification} />) as Notification;
                    popup.connect("destroy", () => map.get(notification.id) === popup && map.delete(notification.id));
                    map.get(notification.id)?.destroyWithAnims();
                    map.set(notification.id, popup);

                    self.add(
                        <eventbox
                            onClick={(_, event) => {
                                // Activate notif or go to notif center on primary click
                                if (event.button === Astal.MouseButton.PRIMARY) {
                                    if (notification.actions.length === 1)
                                        notification.invoke(notification.actions[0].id);
                                    else {
                                        sidebar?.shown.set("notifpane");
                                        sidebar?.show();
                                        popup.destroyWithAnims();
                                    }
                                }
                                // Dismiss on middle click
                                else if (event.button === Astal.MouseButton.MIDDLE) notification.dismiss();
                            }}
                            // Close on hover lost
                            onHoverLost={() => popup.destroyWithAnims()}
                            setup={self => self.hook(popup, "destroy", () => self.destroy())}
                        >
                            {popup}
                        </eventbox>
                    );

                    // Limit number of popups
                    if (config.maxPopups.get() > 0 && self.children.length > config.maxPopups.get())
                        map.values().next().value?.destroyWithAnims();
                });
                self.hook(notifd, "resolved", (_, id) => map.get(id)?.destroyWithAnims());

                let sidebar: SideBar | null;

                const awaitSidebar = () => {
                    sidebar = App.get_window(`sidebar${monitor.id}`) as SideBar | null;
                    if (!sidebar) timeout(100, awaitSidebar);
                };
                idle(awaitSidebar);

                // Change input region to child region so can click through empty space
                setupChildClickthrough(self);
            }}
        />
    </window>
);
