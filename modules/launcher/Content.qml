import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Controls

Item {
    id: root

    required property Scope launcher
    readonly property int padding: Appearance.padding.large
    readonly property int spacing: Appearance.spacing.normal
    readonly property int rounding: Appearance.rounding.large

    implicitWidth: LauncherConfig.sizes.width
    implicitHeight: search.height + list.height + padding * 4 + spacing

    anchors.bottom: parent.bottom
    anchors.horizontalCenter: parent.horizontalCenter

    StyledRect {
        color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
        radius: root.rounding
        implicitHeight: list.height + root.padding * 2

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: search.top
        anchors.bottomMargin: root.spacing
        anchors.margins: root.padding

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
            anchors.margins: root.padding

            delegate: AppItem {
                launcher: root.launcher
            }

            ScrollBar.vertical: StyledScrollBar {
                // Move half out
                parent: list.parent
                anchors.top: list.top
                anchors.bottom: list.bottom
                anchors.right: list.right
                anchors.topMargin: root.padding / 2
                anchors.bottomMargin: root.padding / 2
                anchors.rightMargin: -root.padding / 2
            }

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
        anchors.margins: root.padding

        topPadding: Appearance.padding.normal
        bottomPadding: Appearance.padding.normal
        leftPadding: root.padding
        rightPadding: root.padding

        placeholderText: qsTr("Type \">\" for commands")

        background: StyledRect {
            color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
            radius: root.rounding
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
