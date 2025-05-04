pragma ComponentBehavior: Bound

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

    implicitWidth: listWrapper.width + padding * 2
    implicitHeight: search.height + listWrapper.height + padding * 2 + spacing

    anchors.bottom: parent.bottom
    anchors.horizontalCenter: parent.horizontalCenter

    StyledRect {
        id: listWrapper

        color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
        radius: root.rounding

        implicitWidth: list.width + root.padding * 2
        implicitHeight: list.height + root.padding * 2

        anchors.horizontalCenter: parent.horizontalCenter
        anchors.bottom: search.top
        anchors.bottomMargin: root.spacing
        anchors.margins: root.padding

        ContentList {
            id: list

            launcher: root.launcher
            search: search
            padding: root.padding
            spacing: root.spacing
            rounding: root.rounding
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

        placeholderText: qsTr(`Type "${LauncherConfig.actionPrefix}" for commands`)

        background: StyledRect {
            color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
            radius: root.rounding
        }

        onAccepted: {
            const currentItem = list.currentList?.currentItem;
            if (currentItem) {
                if (list.showWallpapers) {
                    Wallpapers.setWallpaper(currentItem.modelData.path);
                    root.launcher.launcherVisible = false;
                } else if (text.startsWith(LauncherConfig.actionPrefix)) {
                    currentItem.modelData.onClicked(list.currentList);
                } else {
                    Apps.launch(currentItem.modelData);
                    root.launcher.launcherVisible = false;
                }
            }
        }

        Keys.onUpPressed: list.currentList?.decrementCurrentIndex()
        Keys.onDownPressed: list.currentList?.incrementCurrentIndex()

        Keys.onEscapePressed: root.launcher.launcherVisible = false

        Connections {
            target: root.launcher

            function onLauncherVisibleChanged(): void {
                if (root.launcher.launcherVisible)
                    search.forceActiveFocus();
                else {
                    search.text = "";
                    const current = list.currentList;
                    if (current)
                        current.currentIndex = 0;
                }
            }
        }
    }
}
