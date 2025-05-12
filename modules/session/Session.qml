import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Wayland
import QtQuick

Scope {
    id: root

    property int winHeight
    property bool sessionVisible

    // Connections {
    //     target: Drawers

    //     function onPosChanged(screen: ShellScreen, x: int, y: int): void {
    //         if (x > screen.width - BorderConfig.thickness && y > (screen.height - root.winHeight) / 2 && y < (screen.height + root.winHeight) / 2)
    //             root.sessionVisible = true;
    //     }
    // }

    LazyLoader {
        loading: true

        StyledWindow {
            id: win

            name: "osd"
            keyboardFocus: root.sessionVisible ? WlrKeyboardFocus.Exclusive : WlrKeyboardFocus.None
            visible: wrapper.shouldBeVisible

            mask: Region {
                item: wrapper
            }

            anchors.left: true
            anchors.right: true
            height: wrapper.height

            Component.onCompleted: {
                root.winHeight = height;
                Drawers.rightExclusion = Qt.binding(() => bg.width);
            }

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

                sessionVisible: root.sessionVisible
                contentWidth: content.width

                Content {
                    id: content

                    session: root
                }
            }
        }
    }

    CustomShortcut {
        name: "session"
        description: "Toggle session menu"
        onPressed: root.sessionVisible = !root.sessionVisible
    }
}
