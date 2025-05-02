import "root:/config"
import QtQuick
import QtQuick.Controls

ScrollBar {
    id: root

    contentItem: StyledRect {
        opacity: 0
        radius: Appearance.rounding.full
        color: Qt.alpha(Appearance.colours.m3secondary, 0.6)
    }

    background: StyledRect {
        implicitWidth: 10
        opacity: 0
        radius: Appearance.rounding.full
        color: Qt.alpha(Appearance.colours.m3surfaceContainerLow, 0.4)

        MouseArea {
            anchors.fill: parent
            onWheel: event => {
                if (event.angleDelta.y > 0)
                    root.decrease();
                else if (event.angleDelta.y < 0)
                    root.increase();
            }
        }
    }
}
