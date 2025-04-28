import "root:/config"
import QtQuick
import QtQuick.Layouts

Rectangle {
    id: root

    default property alias children: layout.children
    readonly property alias visibleChildren: layout.visibleChildren

    property bool vertical: false
    property bool homogenous: false
    property bool animated: false
    property int spacing: Appearance.spacing.small
    property var padding: 0

    readonly property int paddingTop: getRealPadding().top
    readonly property int paddingRight: getRealPadding().right
    readonly property int paddingBottom: getRealPadding().bottom
    readonly property int paddingLeft: getRealPadding().left
    readonly property int paddingX: getRealPadding().x
    readonly property int paddingY: getRealPadding().y

    function getRealPadding() {
        const pad = {};

        if (Array.isArray(padding)) {
            if (padding.length === 2) {
                pad.top = pad.bottom = padding[0];
                pad.left = pad.right = padding[1];
            } else if (padding.length === 3) {
                pad.top = padding[0];
                pad.left = pad.right = padding[1];
                pad.bottom = padding[2];
            } else if (padding.length === 4) {
                pad.top = padding[0];
                pad.right = padding[1];
                pad.bottom = padding[2];
                pad.left = padding[3];
            }
        } else {
            pad.top = pad.bottom = pad.left = pad.right = padding;
        }

        pad.x = pad.left + pad.right;
        pad.y = pad.top + pad.bottom;

        return pad;
    }

    function childAt(x: real, y: real): Item {
        return layout.childAt(x, y);
    }

    color: "transparent"

    implicitWidth: layout.implicitWidth + paddingX
    implicitHeight: layout.implicitHeight + paddingY

    GridLayout {
        id: layout

        x: root.paddingLeft
        y: root.paddingTop

        flow: root.vertical ? GridLayout.TopToBottom : GridLayout.LeftToRight
        uniformCellWidths: root.homogenous || root.vertical
        uniformCellHeights: root.homogenous || !root.vertical
        rows: root.vertical ? -1 : 1
        columns: root.vertical ? 1 : -1
        rowSpacing: root.spacing
        columnSpacing: root.spacing
    }

    Behavior on color {
        ColorAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.standard
        }
    }

    Behavior on implicitWidth {
        enabled: root.animated

        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasized
        }
    }

    Behavior on implicitHeight {
        enabled: root.animated

        NumberAnimation {
            duration: Appearance.anim.durations.normal
            easing.type: Easing.BezierSpline
            easing.bezierCurve: Appearance.anim.curves.emphasized
        }
    }
}
