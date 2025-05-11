pragma Singleton

import Quickshell
import QtQuick

Singleton {
    readonly property Sizes sizes: Sizes {}

    component Sizes: QtObject {
        readonly property int button: 80
    }
}
