import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import Quickshell.Services.SystemTray
import QtQuick
import Qt5Compat.GraphicalEffects

StyledRect {
    animate: true
    clip: true
    visible: width > 0 && height > 0 // To avoid warnings about being visible with no size

    BoxLayout {
        Repeater {
            model: SystemTray.items

            MouseArea {
                id: item

                required property SystemTrayItem modelData

                acceptedButtons: Qt.LeftButton | Qt.RightButton
                width: Appearance.font.size.smaller * 2
                height: Appearance.font.size.smaller * 2

                onClicked: event => {
                    if (event.button === Qt.LeftButton)
                        modelData.activate();
                    else if (modelData.hasMenu)
                        menu.open();
                }

                // TODO custom menu
                QsMenuAnchor {
                    id: menu

                    menu: item.modelData.menu
                    anchor.window: QsWindow.window
                }

                IconImage {
                    id: icon

                    visible: false
                    source: item.modelData.icon
                    anchors.fill: parent
                }

                ColorOverlay {
                    anchors.fill: icon
                    source: icon
                    color: Appearance.colours.lavender
                }
            }
        }
    }
}
