pragma Singleton

import Quickshell
import QtQuick

Singleton {
    readonly property int maxShown: 8
    readonly property Sizes sizes: Sizes {}

    component Sizes: QtObject {
        property int width: 600
    }
}
