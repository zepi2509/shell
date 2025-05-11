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
        property int winHeight
        property bool osdVisible
        property bool hovered

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
            onTriggered: {
                if (!root.hovered)
                    root.osdVisible = false;
            }
        }

        Connections {
            target: Drawers

            function onPosChanged(screen: ShellScreen, x: int, y: int): void {
                if (screen === root.modelData && x > screen.width - BorderConfig.thickness && y > (screen.height - root.winHeight) / 2 && y < (screen.height + root.winHeight) / 2)
                    root.show();
            }
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

                Component.onCompleted: root.winHeight = height

                Item {
                    anchors.verticalCenter: parent.verticalCenter
                    anchors.right: parent.right
                    anchors.rightMargin: Drawers.rightExclusion

                    clip: true
                    visible: width > 0
                    implicitWidth: wrapper.width
                    implicitHeight: wrapper.height

                    Background {
                        id: bg

                        visible: false

                        anchors.verticalCenter: parent.verticalCenter
                        anchors.right: parent.right

                        wrapperWidth: Math.min(wrapper.width, content.width)
                        wrapperHeight: wrapper.height
                    }

                    LayerShadow {
                        source: bg
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

                    HoverHandler {
                        id: hoverHandler

                        onHoveredChanged: {
                            root.hovered = hovered;
                            if (hovered)
                                timer.stop();
                            else
                                root.osdVisible = false;
                        }
                    }
                }
            }
        }
    }
}
