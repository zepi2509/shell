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
    readonly property int nonAnimHeight: summary.height + (root.expanded ? appName.height + body.height : bodyPreview.height) + inner.anchors.margins * 2
    property bool expanded

    clip: true
    color: Colours.palette.m3surfaceContainer
    radius: Appearance.rounding.normal
    implicitWidth: NotifsConfig.sizes.width
    implicitHeight: inner.height

    MouseArea {
        property int startY

        anchors.fill: parent
        hoverEnabled: true
        preventStealing: true

        onEntered: root.modelData.timer.stop()
        onExited: root.modelData.timer.start()

        drag.target: parent
        drag.axis: Drag.XAxis

        onPressed: event => startY = event.y
        onReleased: event => {
            if (Math.abs(root.x) < NotifsConfig.sizes.width * NotifsConfig.clearThreshold)
                root.x = 0;
            else
                root.modelData.popup = false;
        }
        onPositionChanged: event => {
            if (pressed) {
                const diffY = event.y - startY;
                if (Math.abs(diffY) > NotifsConfig.expandThreshold)
                    root.expanded = diffY > 0;
            }
        }
    }

    Behavior on x {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
        }
    }

    Item {
        id: inner

        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.margins: Appearance.padding.normal

        implicitHeight: root.nonAnimHeight

        Behavior on implicitHeight {
            Anim {}
        }

        Loader {
            id: image

            active: root.hasImage
            asynchronous: true

            anchors.left: parent.left
            anchors.top: parent.top
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
        }

        StyledText {
            id: appName

            anchors.top: parent.top
            anchors.left: image.right
            anchors.leftMargin: Appearance.spacing.smaller

            animate: true
            text: appNameMetrics.elidedText
            maximumLineCount: 1
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small

            opacity: root.expanded ? 1 : 0

            Behavior on opacity {
                Anim {}
            }
        }

        TextMetrics {
            id: appNameMetrics

            text: root.modelData.appName
            font.family: appName.font.family
            font.pointSize: appName.font.pointSize
            elide: Text.ElideRight
            elideWidth: expandBtn.x - time.width - timeSep.width - summary.x - Appearance.spacing.small * 3
        }

        StyledText {
            id: summary

            anchors.top: parent.top
            anchors.left: image.right
            anchors.leftMargin: Appearance.spacing.smaller

            animate: true
            text: summaryMetrics.elidedText
            maximumLineCount: 1

            states: State {
                name: "expanded"
                when: root.expanded

                AnchorChanges {
                    target: summary
                    anchors.top: appName.bottom
                }
            }

            transitions: Transition {
                AnchorAnimation {
                    duration: Appearance.anim.durations.normal
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.standard
                }
            }
        }

        TextMetrics {
            id: summaryMetrics

            text: root.modelData.summary
            font.family: summary.font.family
            font.pointSize: summary.font.pointSize
            elide: Text.ElideRight
            elideWidth: expandBtn.x - time.width - timeSep.width - summary.x - Appearance.spacing.small * 3
        }

        StyledText {
            id: timeSep

            anchors.top: parent.top
            anchors.left: summary.right
            anchors.leftMargin: Appearance.spacing.small

            text: "•"
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small

            states: State {
                name: "expanded"
                when: root.expanded

                AnchorChanges {
                    target: timeSep
                    anchors.left: appName.right
                }
            }

            transitions: Transition {
                AnchorAnimation {
                    duration: Appearance.anim.durations.normal
                    easing.type: Easing.BezierSpline
                    easing.bezierCurve: Appearance.anim.curves.standard
                }
            }
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

        Item {
            id: expandBtn

            anchors.right: parent.right
            anchors.top: parent.top

            implicitWidth: expandIcon.height
            implicitHeight: expandIcon.height

            StateLayer {
                radius: Appearance.rounding.full

                function onClicked() {
                    root.expanded = !root.expanded;
                }
            }

            MaterialIcon {
                id: expandIcon

                anchors.centerIn: parent

                animate: true
                text: root.expanded ? "expand_less" : "expand_more"
                font.pointSize: Appearance.font.size.normal
            }
        }

        StyledText {
            id: bodyPreview

            anchors.left: summary.left
            anchors.right: expandBtn.left
            anchors.top: summary.bottom
            anchors.rightMargin: Appearance.spacing.small

            animate: true
            text: bodyPreviewMetrics.elidedText
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small

            opacity: root.expanded ? 0 : 1

            Behavior on opacity {
                Anim {}
            }
        }

        TextMetrics {
            id: bodyPreviewMetrics

            text: root.modelData.body
            font.family: bodyPreview.font.family
            font.pointSize: bodyPreview.font.pointSize
            elide: Text.ElideRight
            elideWidth: bodyPreview.width
        }

        StyledText {
            id: body

            anchors.left: summary.left
            anchors.right: expandBtn.left
            anchors.top: summary.bottom
            anchors.rightMargin: Appearance.spacing.small

            animate: true
            text: root.modelData.body
            color: Colours.palette.m3onSurfaceVariant
            font.pointSize: Appearance.font.size.small
            wrapMode: Text.WrapAtWordBoundaryOrAnywhere

            opacity: root.expanded ? 1 : 0

            Behavior on opacity {
                Anim {}
            }
        }
    }

    component Anim: NumberAnimation {
        duration: Appearance.anim.durations.normal
        easing.type: Easing.BezierSpline
        easing.bezierCurve: Appearance.anim.curves.standard
    }
}
