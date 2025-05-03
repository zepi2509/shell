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
    implicitHeight: search.height + listWrapper.height + padding * 2 + spacing

    anchors.bottom: parent.bottom
    anchors.horizontalCenter: parent.horizontalCenter

    StyledRect {
        id: listWrapper

        color: Appearance.alpha(Appearance.colours.m3surfaceContainerHigh, true)
        radius: root.rounding
        implicitHeight: Math.max(empty.height, list.height) + root.padding * 2

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: search.top
        anchors.bottomMargin: root.spacing
        anchors.margins: root.padding

        AppList {
            id: list

            padding: root.padding
            search: search
            launcher: root.launcher
        }

        EmptyIndicator {
            id: empty

            empty: list.count === 0
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
            if (list.currentItem) {
                if (list.isAction)
                    list.currentItem.modelData.onClicked(list);
                else {
                    Apps.launch(list.currentItem?.modelData);
                    root.launcher.launcherVisible = false;
                }
            }
        }

        Keys.onUpPressed: list.decrementCurrentIndex()
        Keys.onDownPressed: list.incrementCurrentIndex()

        Keys.onEscapePressed: root.launcher.launcherVisible = false

        Connections {
            target: root.launcher

            function onLauncherVisibleChanged(): void {
                if (root.launcher.launcherVisible)
                    search.forceActiveFocus();
                else {
                    search.text = "";
                    list.currentIndex = 0;
                }
            }
        }
    }
}
