import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Controls

Item {
    id: root

    required property PersistentProperties visibilities

    anchors.horizontalCenter: parent.horizontalCenter
    anchors.bottom: parent.bottom

    implicitWidth: 800
    implicitHeight: 300

    Tabs {
        id: tabs

        anchors.fill: parent
        anchors.topMargin: Appearance.padding.normal
        anchors.margins: Appearance.padding.large

        currentIndex: view.currentIndex
    }

    SwipeView {
        id: view

        currentIndex: tabs.currentIndex
    }
}
