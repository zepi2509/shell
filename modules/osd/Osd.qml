import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

Variants {
    model: Quickshell.screens

    Scope {
        id: root

        required property ShellScreen modelData
        readonly property Brightness.Monitor monitor: Brightness.getMonitorForScreen(modelData)
        property bool osdVisible

        function show(): void {
            root.osdVisible = true;
            timer.restart();
        }

        Connections {
            target: Audio

            function onMutedChanged(): void {
                root.show();
            }

            function onVolumeChanged(): void {
                root.show();
            }
        }

        Connections {
            target: root.monitor

            function onBrightnessChanged(): void {
                root.show();
            }
        }

        Timer {
            id: timer

            interval: OsdConfig.hideDelay
            onTriggered: root.osdVisible = false
        }

        LazyLoader {
            loading: true

            StyledWindow {
                id: win

                screen: root.modelData
                name: "osd"
                visible: wrapper.shouldBeVisible

                mask: Region {
                    item: wrapper
                }

                anchors.left: true
                anchors.right: true
                height: wrapper.height

                Background {
                    id: bg

                    anchors.verticalCenter: parent.verticalCenter
                    anchors.right: parent.right

                    wrapperHeight: wrapper.height
                    realWrapperWidth: Math.min(wrapper.width, content.width)
                }

                Wrapper {
                    id: wrapper

                    anchors.verticalCenter: parent.verticalCenter
                    anchors.right: parent.right

                    implicitHeight: content.height + bg.rounding * 2

                    osdVisible: root.osdVisible
                    contentWidth: content.width

                    Content {
                        id: content

                        monitor: root.monitor
                    }
                }
            }
        }
    }
}
