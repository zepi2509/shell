import "root:/widgets"
import "root:/config"
import Quickshell
import Quickshell.Wayland

Scope {
    id: root

    property bool bindInterrupted
    property bool launcherVisible

    LazyLoader {
        id: loader

        loading: true

        StyledWindow {
            id: win

            name: "launcher"
            keyboardFocus: root.launcherVisible ? WlrKeyboardFocus.Exclusive : WlrKeyboardFocus.None
            visible: wrapper.shouldBeVisible

            mask: Region {
                item: wrapper
            }

            anchors.top: true
            anchors.left: true
            anchors.bottom: true
            anchors.right: true

            Background {
                id: bg

                anchors.horizontalCenter: parent.horizontalCenter

                wrapperWidth: wrapper.width
                realWrapperHeight: Math.min(wrapper.height, content.height)
            }

            Wrapper {
                id: wrapper

                anchors.horizontalCenter: parent.horizontalCenter

                implicitWidth: content.width + bg.rounding * 2

                launcherVisible: root.launcherVisible
                contentHeight: content.height

                Content {
                    id: content

                    launcher: root
                }
            }
        }
    }

    CustomShortcut {
        name: "launcher"
        description: "Toggle launcher"
        onPressed: root.bindInterrupted = false
        onReleased: {
            if (!root.bindInterrupted)
                root.launcherVisible = !root.launcherVisible;
            root.bindInterrupted = false;
        }
    }

    CustomShortcut {
        name: "launcherInterrupt"
        description: "Interrupt launcher keybind"
        onPressed: root.bindInterrupted = true
    }
}
