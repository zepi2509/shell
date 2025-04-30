import "root:/config"
import QtQuick

StyledRect {
    id: root

    property var padding: 0

    readonly property real paddingTop: getRealPadding().top
    readonly property real paddingRight: getRealPadding().right
    readonly property real paddingBottom: getRealPadding().bottom
    readonly property real paddingLeft: getRealPadding().left
    readonly property real paddingX: getRealPadding().x
    readonly property real paddingY: getRealPadding().y

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

    implicitWidth: childrenRect.width + paddingX
    implicitHeight: childrenRect.height + paddingY

    onChildrenChanged: {
        for (const child of children) {
            child.x = Qt.binding(() => paddingLeft);
            child.y = Qt.binding(() => paddingTop);
        }
    }
}
