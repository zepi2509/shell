import "root:/widgets"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Shapes
import Qt5Compat.GraphicalEffects

Scope {
    id: root

    property bool bindInterrupted
    property bool launcherVisible

    LazyLoader {
        id: loader

        loading: true

        StyledWindow {
            id: win

            name: "launcher"

            width: content.width + bg.rounding * 2
            height: content.implicitHeight

            anchors.bottom: true

            Shape {
                id: bg

                readonly property int rounding: Appearance.rounding.large
                readonly property int roundingY: Math.min(rounding, wrapper.height / 2)
                readonly property real wrapperHeight: wrapper.height - 1 // Pixel issues :sob:

                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom

                preferredRendererType: Shape.CurveRenderer
                opacity: Appearance.transparency.enabled ? Appearance.transparency.base : 1

                ShapePath {
                    strokeWidth: -1
                    fillColor: Appearance.colours.m3surface

                    startY: bg.wrapperHeight

                    PathArc {
                        relativeX: bg.rounding
                        relativeY: -bg.roundingY
                        radiusX: bg.rounding
                        radiusY: bg.roundingY
                        direction: PathArc.Counterclockwise
                    }
                    PathLine {
                        relativeX: 0
                        y: bg.roundingY
                    }
                    PathArc {
                        relativeX: bg.rounding
                        relativeY: -bg.roundingY
                        radiusX: bg.rounding
                        radiusY: bg.roundingY
                    }
                    PathLine {
                        x: wrapper.width - bg.rounding * 2
                    }
                    PathArc {
                        relativeX: bg.rounding
                        relativeY: bg.roundingY
                        radiusX: bg.rounding
                        radiusY: bg.roundingY
                    }
                    PathLine {
                        relativeX: 0
                        y: bg.wrapperHeight - bg.roundingY
                    }
                    PathArc {
                        relativeX: bg.rounding
                        relativeY: bg.roundingY
                        radiusX: bg.rounding
                        radiusY: bg.roundingY
                        direction: PathArc.Counterclockwise
                    }
                }
            }

            Item {
                id: wrapper

                anchors.left: parent.left
                anchors.right: parent.right
                anchors.bottom: parent.bottom

                height: 0
                visible: false

                clip: true

                states: State {
                    name: "visible"
                    when: root.launcherVisible

                    PropertyChanges {
                        wrapper.height: content.height
                        wrapper.visible: true
                    }
                }

                transitions: [
                    Transition {
                        from: ""
                        to: "visible"

                        SequentialAnimation {
                            PropertyAction {
                                target: wrapper
                                property: "visible"
                            }
                            NumberAnimation {
                                target: wrapper
                                property: "height"
                                duration: Appearance.anim.durations.large
                                easing.type: Easing.BezierSpline
                                easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
                            }
                        }
                    },
                    Transition {
                        from: "visible"
                        to: ""

                        SequentialAnimation {
                            NumberAnimation {
                                target: wrapper
                                property: "height"
                                duration: Appearance.anim.durations.extraLarge
                                easing.type: Easing.BezierSpline
                                easing.bezierCurve: Appearance.anim.curves.emphasizedDecel
                            }
                            PropertyAction {
                                target: wrapper
                                property: "visible"
                            }
                        }
                    }
                ]

                PaddedRect {
                    id: content

                    width: LauncherConfig.sizes.width
                    padding: Appearance.padding.large
                    anchors.horizontalCenter: parent.horizontalCenter

                    StyledText {
                        text: "Launcher"
                        font.pointSize: 80
                    }
                }
            }
        }
    }

    CustomShortcut {
        name: "launcher"
        description: "Toggle launcher"
        onPressed: root.bindInterrupted = false
        onReleased: {
            if (!root.bindInterrupted)
                root.launcherVisible = !root.launcherVisible;
            root.bindInterrupted = false;
        }
    }

    CustomShortcut {
        name: "launcherInterrupt"
        description: "Interrupt launcher keybind"
        onPressed: root.bindInterrupted = true
    }
}
