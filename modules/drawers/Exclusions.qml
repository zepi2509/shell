pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import Quickshell

Scope {
    id: root

    required property ShellScreen screen

    ExclusionZone {
        anchors.left: false
    }

    ExclusionZone {
        anchors.top: false
    }

    ExclusionZone {
        anchors.right: false
    }

    ExclusionZone {
        anchors.bottom: false
    }

    component ExclusionZone: StyledWindow {
        screen: root.screen
        name: "border-exclusion"
        width: BorderConfig.thickness
        height: BorderConfig.thickness

        anchors.top: true
        anchors.left: true
        anchors.bottom: true
        anchors.right: true
    }
}
