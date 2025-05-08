import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Wayland
import QtQuick

Variants {
    model: Quickshell.screens

    Scope {
        id: root

        required property ShellScreen modelData
        property bool osdVisible

        Timer {
            // running: true
            repeat: true
            interval: 2000
            onTriggered: root.osdVisible = !root.osdVisible
        }

        LazyLoader {
            loading: true

            StyledWindow {
                id: win

                screen: root.modelData
                name: "notifications"
                visible: wrapper.shouldBeVisible
                exclusionMode: ExclusionMode.Normal

                mask: Region {
                    item: wrapper
                }

                anchors.top: true
                anchors.bottom: true
                anchors.right: true
                width: wrapper.width
                height: wrapper.height

                Background {
                    id: bg

                    visible: false

                    anchors.top: parent.top
                    anchors.right: parent.right

                    wrapperWidth: wrapper.width
                    wrapperHeight: Math.min(wrapper.height, content.height)
                }

                LayerShadow {
                    source: bg
                }

                Wrapper {
                    id: wrapper

                    anchors.top: parent.top
                    anchors.right: parent.right

                    implicitWidth: content.width + bg.rounding

                    osdVisible: root.osdVisible
                    contentHeight: content.height

                    Content {
                        id: content
                    }
                }
            }
        }
    }
}
