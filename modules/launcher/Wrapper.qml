import "root:/config"
import QtQuick

Item {
    id: root

    required property bool launcherVisible

    anchors.left: parent.left
    anchors.right: parent.right
    anchors.bottom: parent.bottom

    height: 0
    visible: false

    clip: true

    states: State {
        name: "visible"
        when: root.launcherVisible

        PropertyChanges {
            root.height: content.height
            root.visible: true
        }
    }

    transitions: [
        Transition {
            from: ""
            to: "visible"

            SequentialAnimation {
                PropertyAction {
                    target: root
                    property: "visible"
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
                    duration: Appearance.anim.durations.extraLarge
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
                }
                PropertyAction {
                    target: root
                    property: "visible"
                }
            }
        }
    ]
}
