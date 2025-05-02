import "root:/config"
import QtQuick

Item {
    id: root

    required property bool launcherVisible
    required property real contentHeight
    property bool shouldBeVisible

    anchors.left: parent.left
    anchors.right: parent.right
    anchors.bottom: parent.bottom

    height: 0
    clip: true

    states: State {
        name: "visible"
        when: root.launcherVisible

        PropertyChanges {
            root.height: contentHeight
            root.shouldBeVisible: true
        }
    }

    transitions: [
        Transition {
            from: ""
            to: "visible"

            SequentialAnimation {
                PropertyAction {
                    target: root
                    property: "shouldBeVisible"
                }
                NumberAnimation {
                    target: root
                    property: "height"
                    duration: Appearance.anim.durations.large
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
                }
            }
        },
        Transition {
            from: "visible"
            to: ""

            SequentialAnimation {
                NumberAnimation {
                    target: root
                    property: "height"
                    duration: Appearance.anim.durations.normal
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
                }
                PropertyAction {
                    target: root
                    property: "shouldBeVisible"
                }
            }
        }
    ]
}
