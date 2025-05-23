pragma ComponentBehavior: Bound

import "root:/widgets"
import "root:/config"
import Quickshell

Scope {
    id: root

    required property ShellScreen screen

    ExclusionZone {
        anchors.left: true
    }

    ExclusionZone {
        anchors.top: true
    }

    ExclusionZone {
        anchors.right: true
    }

    ExclusionZone {
        anchors.bottom: true
    }

    component ExclusionZone: StyledWindow {
        screen: root.screen
        name: "border-exclusion"
        exclusiveZone: BorderConfig.thickness
    }
}
