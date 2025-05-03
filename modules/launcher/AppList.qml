pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Controls

ListView {
    id: root

    required property int padding
    required property TextField search
    required property Scope launcher

    property bool isAction: search.text.startsWith(LauncherConfig.actionPrefix)

    function getModelValues() {
        let text = search.text;
        if (isAction)
            return Actions.fuzzyQuery(text);
        if (text.startsWith(LauncherConfig.actionPrefix))
            text = search.text.slice(LauncherConfig.actionPrefix.length);
        return Apps.fuzzyQuery(text);
    }

    model: ScriptModel {
        values: root.getModelValues()
        onValuesChanged: root.currentIndex = 0
    }

    clip: true
    spacing: Appearance.spacing.small
    orientation: Qt.Vertical
    implicitHeight: (LauncherConfig.sizes.itemHeight + spacing) * Math.min(LauncherConfig.maxShown, count) - spacing

    anchors.left: parent.left
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.margins: root.padding

    highlightMoveDuration: Appearance.anim.durations.normal

    highlight: StyledRect {
        radius: Appearance.rounding.normal
        color: Appearance.alpha(Appearance.colours.m3surfaceContainerHighest, true)
    }

    delegate: isAction ? actionItem : appItem

    ScrollBar.vertical: StyledScrollBar {
        // Move half out
        parent: root.parent
        anchors.top: root.top
        anchors.bottom: root.bottom
        anchors.right: root.right
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

    Component {
        id: appItem

        AppItem {
            launcher: root.launcher
        }
    }

    Component {
        id: actionItem

        ActionItem {
            list: root
        }
    }

    Behavior on implicitHeight {
        Anim {
            duration: Appearance.anim.durations.large
            easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
        }
    }

    Behavior on isAction {
        SequentialAnimation {
            ParallelAnimation {
                Anim {
                    target: root
                    property: "opacity"
                    from: 1
                    to: 0
                    duration: Appearance.anim.durations.small
                    easing.bezierCurve: Appearance.anim.curves.standardAccel
                }
                Anim {
                    target: root
                    property: "scale"
                    from: 1
                    to: 0.9
                    duration: Appearance.anim.durations.small
                    easing.bezierCurve: Appearance.anim.curves.standardAccel
                }
            }
            PropertyAction {}
            ParallelAnimation {
                Anim {
                    target: root
                    property: "opacity"
                    from: 0
                    to: 1
                    duration: Appearance.anim.durations.small
                    easing.bezierCurve: Appearance.anim.curves.standardDecel
                }
                Anim {
                    target: root
                    property: "scale"
                    from: 0.9
                    to: 1
                    duration: Appearance.anim.durations.small
                    easing.bezierCurve: Appearance.anim.curves.standardDecel
                }
            }
        }
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
