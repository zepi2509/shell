pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    property bool powered
    property bool discovering
    readonly property list<Device> devices: []
    readonly property list<Device> connected: devices.filter(d => d.connected)

    Process {
        running: true
        command: ["bluetoothctl"]
        stdout: SplitParser {
            onRead: getInfo.running = true
        }
    }

    Process {
        id: getInfo
        running: true
        command: ["sh", "-c", "bluetoothctl show | paste -s"]
        stdout: SplitParser {
            onRead: data => {
                root.powered = data.includes("Powered: yes");
                root.discovering = data.includes("Discovering: yes");
            }
        }
    }

    Process {
        id: getDevices
        running: true
        command: ["fish", "-c", `for a in (bluetoothctl devices | cut -d ' ' -f 2); bluetoothctl info $a | jq -R 'reduce (inputs / ":") as [$key, $value] ({}; .[$key | ltrimstr("\t")] = ($value | ltrimstr(" ")))' | jq -c --arg addr $a '.Address = $addr'; end`]
        stdout: SplitParser {
            onRead: data => {
                const d = JSON.parse(data);
                root.devices.push(deviceComp.createObject(root, {
                    name: d.Name,
                    alias: d.Alias,
                    address: d.Address,
                    icon: d.Icon,
                    connected: d.Connected === "yes",
                    paired: d.Paired === "yes",
                    trusted: d.Trusted === "yes"
                }));
            }
        }
    }

    component Device: QtObject {
        property string name
        property string alias
        property string address
        property string icon
        property bool connected
        property bool paired
        property bool trusted
    }

    Component {
        id: deviceComp

        Device {}
    }
}
