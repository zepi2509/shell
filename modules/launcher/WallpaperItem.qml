import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Effects

StyledRect {
    id: root

    required property Wallpapers.Wallpaper modelData

    scale: PathView.isCurrentItem ? 1 : PathView.onPath ? 0.8 : 0
    opacity: PathView.onPath ? 1 : 0
    z: PathView.isCurrentItem ? 1 : 0

    implicitWidth: image.width + Appearance.padding.larger * 2
    implicitHeight: image.height + label.height + Appearance.spacing.small / 2 + Appearance.padding.normal * 2

    StateLayer {
        radius: Appearance.rounding.normal

        function onClicked(): void {
            console.log("clicked");
        }
    }

    CachingImage {
        id: image

        anchors.horizontalCenter: parent.horizontalCenter
        y: Appearance.padding.normal

        visible: false
        path: root.modelData.path
        smooth: !root.PathView.view.moving

        width: LauncherConfig.sizes.wallpaperWidth
        height: width / 16 * 9
    }

    Rectangle {
        id: mask

        layer.enabled: true
        visible: false
        anchors.fill: image
        width: image.width
        height: image.height
        radius: Appearance.rounding.normal
    }

    MultiEffect {
        anchors.fill: image
        source: image
        maskEnabled: true
        maskSource: mask
    }

    StyledText {
        id: label

        anchors.top: image.bottom
        anchors.topMargin: Appearance.spacing.small / 2
        anchors.horizontalCenter: parent.horizontalCenter

        renderType: Text.QtRendering
        text: root.modelData.name
        font.pointSize: Appearance.font.size.normal
    }

    Behavior on scale {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }

    Behavior on opacity {
        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }
}
