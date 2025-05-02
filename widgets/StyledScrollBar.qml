import "root:/config"
import QtQuick
import QtQuick.Controls

ScrollBar {
    id: root

    contentItem: StyledRect {
        radius: Appearance.rounding.full
        color: Qt.alpha(Appearance.colours.m3secondary, 0.5)
    }

    background: StyledRect {
        implicitWidth: 10
    }
}
