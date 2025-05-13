import "root:/services"
import "root:/config"
import "root:/modules/osd" as Osd
import "root:/modules/notifications" as Notifications
import Quickshell
import QtQuick
import QtQuick.Shapes

Shape {
    id: root

    required property Panels panels

    anchors.fill: parent
    anchors.margins: BorderConfig.thickness
    preferredRendererType: Shape.CurveRenderer
    opacity: Colours.transparency.enabled ? Colours.transparency.base : 1

    Osd.Background {
        wrapper: panels.osd

        startX: root.width
        startY: (root.height - panels.osd.height) / 2
    }

    Notifications.Background {
        wrapper: panels.notifications

        startX: root.width
        startY: 0
    }
}
