import "root:/widgets"
import "root:/config"
import "components"
import "components/workspaces"
import Quickshell
import QtQuick
import QtQuick.Layouts

StyledRect {
    id: root

    required property ShellScreen screen

    function get(horiz, vert) {
        return BarConfig.vertical ? vert : horiz;
    }

    vertical: BarConfig.vertical
    color: Appearance.alpha(Appearance.colours.m3surfaceContainer, false)
    anchors.fill: parent

    BoxLayout {
        spacing: 0 //Appearance.padding.large

        anchors.fill: parent

        BoxLayout {
            spacing: 0

            Module {
                color: Appearance.colours.mauve

                OsIcon {
                    color: Appearance.on(Appearance.colours.mauve)

                    anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                    anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
                }
            }

            Module {
                color: Appearance.colours.pink

                ActiveWindow {
                    colour: Appearance.on(Appearance.colours.pink)

                    anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                    anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
                }
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

        Module {
            color: Appearance.colours.green

            Clock {
                colour: Appearance.on(Appearance.colours.green)

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }

        Module {
            color: Appearance.colours.yellow

            Tray {
                colour: Appearance.on(Appearance.colours.yellow)

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }

        Module {
            color: Appearance.colours.peach

            StatusIcons {
                colour: Appearance.on(Appearance.colours.peach)

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }

        Module {
            color: Appearance.colours.m3error

            Layout.maximumWidth: BarConfig.sizes.height
            Layout.maximumHeight: BarConfig.sizes.height

            Power {
                x: (BarConfig.sizes.height - width) / 2
                y: (BarConfig.sizes.height - height) / 2

                color: Appearance.colours.m3onError

                anchors.horizontalCenter: root.get(undefined, parent.horizontalCenter)
                anchors.verticalCenter: root.get(parent.verticalCenter, undefined)
            }
        }
    }

    Workspaces {
        vertical: BarConfig.vertical

        anchors.horizontalCenter: parent.horizontalCenter
        anchors.verticalCenter: parent.verticalCenter
    }

    component Module: PaddedRect {
        padding: BarConfig.vertical ? [Appearance.padding.large, 0] : [0, Appearance.padding.large]

        Layout.minimumWidth: BarConfig.sizes.height
        Layout.minimumHeight: BarConfig.sizes.height
    }
}
