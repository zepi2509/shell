import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick

Variants {
    model: Quickshell.screens

    StyledWindow {
        id: win

        required property ShellScreen modelData

        screen: modelData
        name: "bar"

        width: BarConfig.vertical ? BarConfig.sizes.totalHeight : -1
        height: BarConfig.vertical ? -1 : BarConfig.sizes.totalHeight

        anchors.top: true
        anchors.left: true
        anchors.right: true

        // Connections {
        //     target: BarConfig

        //     function onVerticalChanged(): void {
        //         win.visible = false;
        //         if (BarConfig.vertical) {
        //             win.anchors.right = false;
        //             win.anchors.bottom = true;
        //         } else {
        //             win.anchors.bottom = false;
        //             win.anchors.right = true;
        //         }
        //         win.visible = true;
        //     }
        // }

        Preset {
            presetName: "pills"

            Pills {}
        }

        Preset {
            presetName: "panel"

            Panel {}
        }
    }

    component Preset: Loader {
        id: loader

        required property string presetName

        anchors.fill: parent
        asynchronous: true
        active: false
        opacity: 0

        states: [
            State {
                name: "visible"
                when: BarConfig.preset.name === loader.presetName

                PropertyChanges {
                    loader.opacity: 1
                    loader.active: true
                }
            }
        ]

        transitions: [
            Transition {
                from: ""
                to: "visible"

                SequentialAnimation {
                    PropertyAction {}
                    NumberAnimation {
                        property: "opacity"
                        duration: Appearance.anim.durations.large
                        easing.type: Easing.BezierSpline
                        easing.bezierCurve: Appearance.anim.curves.standard
                    }
                }
            },
            Transition {
                from: "visible"
                to: ""

                SequentialAnimation {
                    NumberAnimation {
                        property: "opacity"
                        duration: Appearance.anim.durations.large
                        easing.type: Easing.BezierSpline
                        easing.bezierCurve: Appearance.anim.curves.standard
                    }
                    PropertyAction {}
                }
            }
        ]
    }
}
