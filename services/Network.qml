pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    readonly property AccessPoint active: AccessPoint {
        active: true
    }

    reloadableId: "network"

    Process {
        running: true
        command: ["nmcli", "m"]
        stdout: SplitParser {
            onRead: getNetworks.running = true
        }
    }

    Process {
        id: getNetworks
        running: true
        command: ["nmcli", "-g", "ACTIVE,SIGNAL,FREQ,SSID", "d", "w"]
        stdout: SplitParser {
            onRead: data => {
                const [active, strength, frequency, ssid] = data.split(":");
                if (active === "yes") {
                    root.active.ssid = ssid;
                    root.active.strength = parseInt(strength);
                    root.active.frequency = parseInt(frequency);
                }
            }
        }
    }

    component AccessPoint: QtObject {
        property string ssid
        property int strength
        property int frequency
        property bool active
    }
}
