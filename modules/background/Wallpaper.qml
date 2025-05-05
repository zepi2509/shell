pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/services"
import "root:/config"
import QtQuick

Item {
    id: root

    property url source: Wallpapers.current ? `file://${Wallpapers.current}` : ""
    property Image current: one

    anchors.fill: parent

    onSourceChanged: {
        if (current === one)
            two.update();
        else
            one.update();
    }

    Img {
        id: one
    }

    Img {
        id: two
    }

    component Img: Image {
        id: img

        function update(): void {
            if (source === root.source)
                root.current = this;
            else
                source = root.source;
        }

        anchors.fill: parent
        asynchronous: true
        fillMode: Image.PreserveAspectCrop
        opacity: 0
        scale: Wallpapers.showPreview ? 1 : 0.8
        sourceSize.width: width
        sourceSize.height: height

        onStatusChanged: {
            if (status === Image.Ready)
                root.current = this;
        }

        states: State {
            name: "visible"
            when: root.current === img

            PropertyChanges {
                img.opacity: 1
                img.scale: 1
            }
        }

        transitions: Transition {
            from: "*"
            to: "*"

            NumberAnimation {
                target: img
                properties: "opacity,scale"
                duration: Appearance.anim.durations.normal
                easing.type: Easing.BezierSpline
                easing.bezierCurve: Appearance.anim.curves.standard
            }
        }
    }
}
