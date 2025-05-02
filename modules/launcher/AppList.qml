import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Controls

ListView {
    id: root

    required property int padding
    required property string search

    model: ScriptModel {
        values: Apps.fuzzyQuery(root.search)
        onValuesChanged: root.currentIndex = 0
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
    // TODO highlight

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

    Behavior on implicitHeight {
        Anim {}
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
