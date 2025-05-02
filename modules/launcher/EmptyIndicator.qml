import "root:/widgets"
import "root:/config"
import QtQuick

Loader {
    id: root

    required property bool empty

    active: false
    opacity: 0
    scale: 0
    asynchronous: true
    anchors.horizontalCenter: parent.horizontalCenter
    anchors.verticalCenter: parent.verticalCenter

    sourceComponent: Item {
        implicitWidth: childrenRect.width
        implicitHeight: icon.height

        MaterialIcon {
            id: icon

            text: "manage_search"
            color: Appearance.colours.m3outline
            font.pointSize: Appearance.font.size.extraLarge

            anchors.verticalCenter: parent.verticalCenter
        }

        StyledText {
            anchors.left: icon.right
            anchors.leftMargin: Appearance.spacing.small
            anchors.verticalCenter: icon.verticalCenter

            text: qsTr("No matching apps found")
            color: Appearance.colours.m3outline
            font.pointSize: Appearance.font.size.larger
            font.weight: 500
        }
    }

    states: State {
        name: "visible"
        when: root.empty

        PropertyChanges {
            root.active: true
            root.opacity: 1
            root.scale: 1
        }
    }

    transitions: Transition {
        NumberAnimation {
            properties: "opacity,scale"
            duration: Appearance.anim.durations.large
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }
}
