import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

Item {
    id: root

    required property PersistentProperties visibilities

    visible: width > 0
    implicitWidth: 0
    implicitHeight: content.implicitHeight + BorderConfig.rounding * 2

    states: State {
        name: "visible"
        when: root.visibilities.session

        PropertyChanges {
            root.implicitWidth: content.implicitWidth
        }
    }

    transitions: [
        Transition {
            from: ""
            to: "visible"

            NumberAnimation {
                target: root
                property: "implicitWidth"
                duration: Appearance.anim.durations.large
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
            }
        },
        Transition {
            from: "visible"
            to: ""

            NumberAnimation {
                target: root
                property: "implicitWidth"
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.emphasizedAccel
            }
        }
    ]

    Content {
        id: content

        visibilities: root.visibilities
    }
}
