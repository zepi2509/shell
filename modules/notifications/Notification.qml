pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import Quickshell.Widgets
import QtQuick
import QtQuick.Effects

StyledRect {
    id: root

    required property Notifs.Notif modelData
    readonly property bool hasImage: modelData.image.length > 0
    readonly property bool hasAppIcon: modelData.appIcon.length > 0
    readonly property int imageSize: summary.height + bodyPreview.height
    property bool expanded

    color: Colours.palette.m3surfaceContainer
    radius: Appearance.rounding.normal
    implicitWidth: NotifsConfig.sizes.width

    Item {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: Appearance.padding.normal

        implicitHeight: summary.height + bodyPreview.height + anchors.margins * 2

        Loader {
            id: image

            active: root.hasImage
            asynchronous: true

            anchors.left: parent.left
            anchors.verticalCenter: parent.verticalCenter
            anchors.verticalCenterOffset: -parent.anchors.margins
            width: root.hasImage || root.hasAppIcon ? root.imageSize : 0
            height: root.hasImage || root.hasAppIcon ? root.imageSize : 0
            visible: root.hasImage || root.hasAppIcon

            sourceComponent: ClippingRectangle {
                radius: Appearance.rounding.full
                width: root.imageSize
                height: root.imageSize

                Image {
                    anchors.fill: parent
                    source: Qt.resolvedUrl(root.modelData.image)
                    fillMode: Image.PreserveAspectCrop
                    cache: false
                    asynchronous: true
                }
            }

            states: State {
                name: "expanded"
                when: root.expanded

                AnchorChanges {
                    anchors.verticalCenter: undefined
                    anchors.top: image.parent.top
                }
            }
        }

        Loader {
            id: appIcon

            active: root.hasAppIcon
            asynchronous: true

            anchors.horizontalCenter: root.hasImage ? undefined : image.horizontalCenter
            anchors.verticalCenter: root.hasImage ? undefined : image.verticalCenter
            anchors.right: root.hasImage ? image.right : undefined
            anchors.bottom: root.hasImage ? image.bottom : undefined

            sourceComponent: StyledRect {
                radius: Appearance.rounding.full
                color: Colours.palette.m3tertiaryContainer
                implicitWidth: root.hasImage ? NotifsConfig.sizes.badge : root.imageSize
                implicitHeight: root.hasImage ? NotifsConfig.sizes.badge : root.imageSize

                IconImage {
                    id: icon

                    anchors.centerIn: parent
                    visible: false
                    implicitSize: Math.round(parent.width * 0.6)
                    source: Quickshell.iconPath(root.modelData.appIcon)
                    asynchronous: true
                }

                Colouriser {
                    anchors.fill: icon
                    source: icon
                    colorizationColor: Colours.palette.m3onTertiaryContainer
                }
            }

            states: State {
                name: "expanded"
                when: !root.hasImage && root.expanded

                AnchorChanges {
                    anchors.verticalCenter: undefined
                    anchors.top: image.parent.top
                }
            }
        }

        StyledText {
            id: summary

            anchors.top: parent.top
            anchors.left: image.right
            anchors.leftMargin: Appearance.spacing.small

            text: root.modelData.summary
            maximumLineCount: 1
        }

        StyledText {
            id: timeSep

            anchors.top: parent.top
            anchors.left: summary.right
            anchors.leftMargin: Appearance.spacing.small

            text: "•"
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small
        }

        StyledText {
            id: time

            anchors.top: parent.top
            anchors.left: timeSep.right
            anchors.leftMargin: Appearance.spacing.small

            animate: true
            horizontalAlignment: Text.AlignLeft
            text: root.modelData.timeStr
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small
        }

        StyledRect {
            id: expandBtn

            anchors.right: parent.right
            anchors.top: parent.top

            MaterialIcon {
                animate: true
                text: root.expanded ? "expand_less" : "expand_more"
                font.pointSize: Appearance.font.size.smaller
            }
        }

        StyledText {
            id: bodyPreview

            anchors.left: summary.left
            anchors.right: expandBtn.left
            anchors.top: summary.bottom
            anchors.rightMargin: Appearance.spacing.small

            text: bodyPreviewMetrics.elidedText
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small
        }

        TextMetrics {
            id: bodyPreviewMetrics

            text: root.modelData.body
            font.family: bodyPreview.font.family
            font.pointSize: bodyPreview.font.pointSize
            elide: Text.ElideRight
            elideWidth: bodyPreview.width
        }
    }
}
