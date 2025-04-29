pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import QtQuick
import QtQuick.Layouts

BoxLayout {
    id: root

    required property bool vertical
    required property list<Workspace> workspaces
    required property var occupied
    required property int groupOffset

    anchors.centerIn: parent
    opacity: BarConfig.workspaces.occupiedBg ? 1 : 0
    spacing: 0
    z: -1

    Repeater {
        model: BarConfig.workspaces.shown

        Rectangle {
            required property int index
            readonly property int roundLeft: index === 0 || !root.occupied[ws - 1] ? Appearance.rounding.full : 0
            readonly property int roundRight: index === BarConfig.workspaces.shown - 1 || !root.occupied[ws + 1] ? Appearance.rounding.full : 0

            property int ws: root.groupOffset + index + 1

            color: Appearance.alpha(Appearance.colours.surface2, true)
            opacity: root.occupied[ws] ? 1 : 0
            topLeftRadius: roundLeft
            bottomLeftRadius: roundLeft
            topRightRadius: roundRight
            bottomRightRadius: roundRight

            // Ugh stupid size errors on reload
            Layout.preferredWidth: root.vertical ? BarConfig.sizes.innerHeight : root.workspaces[index]?.width ?? 1
            Layout.preferredHeight: root.vertical ? root.workspaces[index]?.height ?? 1 : BarConfig.sizes.innerHeight

            Behavior on opacity {
                Anim {}
            }
        }
    }

    Behavior on opacity {
        Anim {}
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
