import "root:/config"
import Qt5Compat.GraphicalEffects

DropShadow {
    anchors.fill: source
    color: Qt.alpha(Appearance.colours.m3shadow, 0.7)
    radius: 10
    samples: 1 + radius * 2
}
