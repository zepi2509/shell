import "root:/widgets"
import "root:/services"
import "root:/config"
import "components"
import "components/workspaces"
import Quickshell
import QtQuick
import QtQuick.Layouts

BoxLayout {
    id: root

    required property ShellScreen screen

    function get(horiz, vert) {
        return BarConfig.vertical ? vert : horiz;
    }

    vertical: BarConfig.vertical
    spacing: Appearance.padding.large

    anchors.fill: parent
    anchors.margins: BarConfig.sizes.floatingGap
    anchors.rightMargin: get(BarConfig.sizes.floatingGap, 0)
    anchors.bottomMargin: get(0, BarConfig.sizes.floatingGap)

    Pill {
        OsIcon {
            id: osIcon

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }

        Workspaces {
            vertical: BarConfig.vertical

            anchors.left: root.get(osIcon.right, undefined)
            anchors.leftMargin: root.get(Appearance.padding.large, 0)
            anchors.top: root.get(undefined, osIcon.bottom)
            anchors.topMargin: root.get(0, Appearance.padding.large)

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }
    }

    MouseArea {
        Layout.fillWidth: true
        Layout.fillHeight: true

        onWheel: event => {
            if (event.angleDelta.y > 0)
                Audio.setVolume(Audio.volume + 0.1);
            else if (event.angleDelta.y < 0)
                Audio.setVolume(Audio.volume - 0.1);
        }
    }

    Pill {
        ActiveWindow {
            vertical: BarConfig.vertical

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }
    }

    MouseArea {
        Layout.fillWidth: true
        Layout.fillHeight: true

        onWheel: event => {
            const monitor = Brightness.getMonitorForScreen(root.screen);
            if (event.angleDelta.y > 0)
                monitor.setBrightness(monitor.brightness + 0.1);
            else if (event.angleDelta.y < 0)
                monitor.setBrightness(monitor.brightness - 0.1);
        }
    }

    Pill {
        Tray {
            vertical: BarConfig.vertical

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }
    }

    Pill {
        Clock {
            id: clock

            vertical: BarConfig.vertical

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }

        StatusIcons {
            anchors.left: root.get(clock.right, undefined)
            anchors.leftMargin: root.get(Appearance.padding.large, 0)
            anchors.top: root.get(undefined, clock.bottom)
            anchors.topMargin: root.get(0, Appearance.padding.large)

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }
    }

    Pill {
        // Make circle
        Layout.maximumWidth: BarConfig.sizes.height
        Layout.maximumHeight: BarConfig.sizes.height

        Power {
            // Center in pill
            x: (BarConfig.sizes.height - width) / 2
            y: (BarConfig.sizes.height - height) / 2

            anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
            anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
        }
    }

    component Pill: PaddedRect {
        color: Appearance.alpha(Appearance.colours.m3surface, false)
        radius: Appearance.rounding.full
        padding: BarConfig.vertical ? [Appearance.padding.large, 0] : [0, Appearance.padding.large]

        Layout.minimumWidth: BarConfig.sizes.height
        Layout.minimumHeight: BarConfig.sizes.height
    }
}
