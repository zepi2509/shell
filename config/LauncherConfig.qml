pragma Singleton

import Quickshell
import QtQuick

Singleton {
    readonly property Sizes sizes: Sizes {}

    component Sizes: QtObject {
        property int width: 600
    }
}
