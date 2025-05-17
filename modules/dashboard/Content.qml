import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import QtQuick
import QtQuick.Controls

Item {
    id: root

    required property PersistentProperties visibilities

    anchors.horizontalCenter: parent.horizontalCenter
    anchors.bottom: parent.bottom

    implicitWidth: view.implicitWidth + viewWrapper.anchors.margins * 2
    implicitHeight: tabs.implicitHeight + tabs.anchors.topMargin + view.implicitHeight + viewWrapper.anchors.margins * 2

    Tabs {
        id: tabs

        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.topMargin: Appearance.padding.normal
        anchors.margins: Appearance.padding.large

        currentIndex: view.currentIndex
    }

    ClippingRectangle {
        id: viewWrapper

        anchors.top: tabs.bottom
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        anchors.margins: Appearance.padding.large

        radius: Appearance.rounding.normal
        color: "transparent"

        SwipeView {
            id: view

            anchors.fill: parent

            currentIndex: tabs.currentIndex

            Dash {}
        }
    }
}
