import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick
import QtQuick.Layouts
import Qt5Compat.GraphicalEffects

BoxLayout {
    id: root

    required property bool vertical
    required property list<Label> workspaces
    required property var occupied
    required property BoxLayout layout

    anchors.centerIn: parent
    spacing: 0
    z: -1

    Repeater {
        model: BarConfig.workspaces.shown

        Rectangle {
            required property int index
            readonly property int roundLeft: index === 0 || !root.occupied[index] ? Appearance.rounding.full : 0
            readonly property int roundRight: index === BarConfig.workspaces.shown - 1 || !root.occupied[index + 2] ? Appearance.rounding.full : 0

            color: Appearance.alpha(Appearance.colours.surface2, true)
            opacity: root.occupied[index + 1] ? 1 : 0
            topLeftRadius: roundLeft
            bottomLeftRadius: roundLeft
            topRightRadius: roundRight
            bottomRightRadius: roundRight

            // Ugh stupid size errors on reload
            Layout.preferredWidth: root.vertical ? layout.width : root.workspaces[index]?.width ?? 1
            Layout.preferredHeight: root.vertical ? root.workspaces[index]?.height ?? 1 : layout.height

            Behavior on opacity {
                NumberAnimation {
                    duration: Appearance.anim.durations.normal
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.standard
                }
            }
        }
    }
}
