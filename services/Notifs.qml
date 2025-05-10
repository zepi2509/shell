pragma Singleton

import "root:/config"
import Quickshell
import Quickshell.Services.Notifications
import QtQuick

Singleton {
    id: root

    readonly property list<Notif> list: []
    readonly property list<Notif> popups: list.filter(n => n.popup)

    NotificationServer {
        id: server

        keepOnReload: false
        actionsSupported: true
        bodyHyperlinksSupported: true
        bodyImagesSupported: true
        bodyMarkupSupported: true
        imageSupported: true

        onNotification: notif => {
            notif.tracked = true;

            root.list.push(notifComp.createObject(root, {
                popup: true,
                notification: notif
            }));
        }
    }

    component Notif: QtObject {
        id: notif

        property bool popup
        readonly property date time: new Date()
        readonly property string timeStr: {
            const diff = Time.date.getTime() - time.getTime();
            const m = Math.floor(diff / 60000);
            const h = Math.floor(m / 60);

            if (h < 1 && m < 1)
                return "now";
            if (h < 1)
                return `${m}m`;
            return `${h}h`;
        }

        required property Notification notification
        readonly property string summary: notification.summary
        readonly property string body: notification.body
        readonly property string appIcon: notification.appIcon
        readonly property string image: notification.image

        readonly property Timer timer: Timer {
            running: true
            interval: notif.notification.expireTimeout > 0 ? notif.notification.expireTimeout : NotifsConfig.defaultExpireTimeout
            onTriggered: notif.popup = false
        }

        readonly property Connections conn: Connections {
            target: notif.notification

            function onClosed(): void {
                notif.destroy();
            }
        }
    }

    Component {
        id: notifComp

        Notif {}
    }
}
