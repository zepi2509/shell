import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

Item {
    id: root

    required property Scope launcher

    implicitWidth: LauncherConfig.sizes.width
    implicitHeight: search.height + list.height + Appearance.padding.large * 5 // Don't question it

    anchors.bottom: parent.bottom
    anchors.horizontalCenter: parent.horizontalCenter

    StyledRect {
        color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
        radius: Appearance.rounding.large
        implicitHeight: list.height + Appearance.padding.large * 2

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: search.top
        anchors.bottomMargin: Appearance.spacing.normal
        anchors.margins: Appearance.padding.large

        ListView {
            id: list

            model: ScriptModel {
                values: Apps.fuzzyQuery(search.text)
                onValuesChanged: list.currentIndex = 0
            }

            clip: true
            spacing: Appearance.spacing.small
            orientation: Qt.Vertical
            implicitHeight: ((currentItem?.height ?? 1) + spacing) * Math.min(LauncherConfig.maxShown, count) - spacing

            anchors.left: parent.left
            anchors.right: parent.right
            anchors.bottom: parent.bottom
            anchors.margins: Appearance.padding.large

            delegate: AppItem {}

            add: Transition {
                Anim {
                    properties: "opacity,scale"
                    from: 0
                    to: 1
                }
            }

            remove: Transition {
                Anim {
                    properties: "opacity,scale"
                    from: 1
                    to: 0
                }
            }

            move: Transition {
                Anim {
                    property: "y"
                }
            }

            addDisplaced: Transition {
                Anim {
                    property: "y"
                    duration: Appearance.anim.durations.small
                }
            }

            displaced: Transition {
                Anim {
                    property: "y"
                }
            }

            Behavior on implicitHeight {
                Anim {}
            }
        }
    }

    StyledTextField {
        id: search

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.margins: Appearance.padding.large

        placeholderText: qsTr("Type \">\" for commands")

        background: StyledRect {
            color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
            radius: Appearance.rounding.large
        }

        onAccepted: {
            if (list.currentItem) {
                Apps.launch(list.currentItem?.modelData);
                root.launcher.launcherVisible = false;
            }
        }

        // TODO: key press grab focus + close on esc anywhere
        Keys.onEscapePressed: root.launcher.launcherVisible = false
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
