import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Shapes
import Qt5Compat.GraphicalEffects

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

            width: content.width + bg.rounding * 2
            height: content.implicitHeight

            anchors.bottom: true

            Background {
                id: bg

                realWrapperHeight: wrapper.height
            }

            Wrapper {
                id: wrapper

                launcherVisible: root.launcherVisible

                PaddedRect {
                    id: content

                    width: LauncherConfig.sizes.width
                    padding: Appearance.padding.large
                    anchors.horizontalCenter: parent.horizontalCenter

                    StyledText {
                        text: "Launcher"
                        font.pointSize: 80
                    }
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
