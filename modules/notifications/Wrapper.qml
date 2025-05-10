import "root:/config"
import QtQuick

Item {
    id: root

    required property bool osdVisible
    required property real contentHeight
    property bool shouldBeVisible

    visible: height > 0
    height: 0

    states: State {
        name: "visible"
        when: root.osdVisible

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
                    easing.bezierCurve: Appearance.anim.curves.standard
                }
                PropertyAction {
                    target: root
                    property: "shouldBeVisible"
                }
            }
        }
    ]
}
