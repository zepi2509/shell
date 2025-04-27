pragma Singleton

import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import QtQuick

Singleton {
    id: root

    readonly property ListModel clients: ListModel {}
    readonly property var workspaces: Hyprland.workspaces
    readonly property var monitors: Hyprland.monitors
    property var activeClient: null
    property HyprlandWorkspace activeWorkspace: null
    property HyprlandMonitor focusedMonitor: Hyprland.monitors.values.find(m => m.lastIpcObject.focused) ?? null

    Component.onCompleted: reload()

    function reload() {
        Hyprland.refreshWorkspaces();
        Hyprland.refreshMonitors();
        getClients.running = true;
        getActiveClient.running = true;
        getActiveWorkspace.running = true;
    }

    function dispatch(request: string): void {
        Hyprland.dispatch(request);
    }

    Connections {
        target: Hyprland

        function onRawEvent(event: HyprlandEvent): void {
            if (!event.name.endsWith("v2"))
                root.reload();
        }
    }

    Process {
        id: getClients
        command: ["bash", "-c", "hyprctl -j clients | jq -c"]
        stdout: SplitParser {
            onRead: data => {
                const clients = JSON.parse(data);
                root.clients.clear();
                for (const client of clients) {
                    root.clients.append({
                        lastIpcObject: client,
                        address: client.address,
                        class: client.class,
                        title: client.title
                    });
                }
            }
        }
    }

    Process {
        id: getActiveClient
        command: ["bash", "-c", "hyprctl -j activewindow | jq -c"]
        stdout: SplitParser {
            onRead: data => {
                const client = JSON.parse(data);
                root.activeClient = {
                    lastIpcObject: client,
                    address: client.address,
                    class: client.class,
                    title: client.title
                };
            }
        }
    }

    Process {
        id: getActiveWorkspace
        command: ["bash", "-c", "hyprctl -j activeworkspace | jq -c"]
        stdout: SplitParser {
            onRead: data => {
                const ws = JSON.parse(data);
                root.activeWorkspace = root.workspaces.values.find(w => w.id === ws.id) ?? null;
            }
        }
    }
}
