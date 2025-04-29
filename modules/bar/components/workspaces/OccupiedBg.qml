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
            id: rect

            required property int index
            property int roundLeft: index === 0 || !root.occupied[ws - 1] ? Appearance.rounding.full : 0
            property int roundRight: index === BarConfig.workspaces.shown - 1 || !root.occupied[ws + 1] ? Appearance.rounding.full : 0

            property int ws: root.groupOffset + index + 1

            color: Appearance.alpha(Appearance.colours.surface2, true)
            opacity: 0
            topLeftRadius: roundLeft
            bottomLeftRadius: roundLeft
            topRightRadius: roundRight
            bottomRightRadius: roundRight

            // Ugh stupid size errors on reload
            Layout.preferredWidth: root.vertical ? BarConfig.sizes.innerHeight : root.workspaces[index]?.width ?? 1
            Layout.preferredHeight: root.vertical ? root.workspaces[index]?.height ?? 1 : BarConfig.sizes.innerHeight

            states: [
                State {
                    name: "occupied"
                    when: root.occupied[rect.ws] ?? false

                    PropertyChanges {
                        rect.opacity: 1
                    }
                }
            ]

            transitions: [
                Transition {
                    from: ""
                    to: "occupied"

                    SequentialAnimation {
                        PropertyAction {
                            target: rect
                            properties: "roundLeft,roundRight"
                            value: Appearance.rounding.full
                        }
                        Anim {
                            easing.bezierCurve: Appearance.anim.curves.standardDecel
                        }
                    }
                },
                Transition {
                    from: "occupied"
                    to: ""

                    Anim {
                        easing.bezierCurve: Appearance.anim.curves.standardAccel
                    }
                }
            ]

            Behavior on color {
                ColorAnimation {
                    duration: Appearance.anim.durations.normal
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.standard
                }
            }

            Behavior on roundLeft {
                SequentialAnimation {
                    PropertyAction {
                        exclude: rect.roundLeft ? [] : [rect]
                    }
                    Anim {}
                }
            }

            Behavior on roundRight {
                SequentialAnimation {
                    PropertyAction {
                        exclude: rect.roundRight ? [] : [rect]
                    }
                    Anim {}
                }
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
