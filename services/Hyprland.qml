pragma Singleton

import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import QtQuick

Singleton {
    id: root

    property list<Client> clients: []
    readonly property var workspaces: Hyprland.workspaces
    readonly property var monitors: Hyprland.monitors
    readonly property Client activeClient: Client {}
    readonly property HyprlandWorkspace activeWorkspace: focusedMonitor?.activeWorkspace ?? null
    readonly property HyprlandMonitor focusedMonitor: Hyprland.monitors.values.find(m => m.lastIpcObject.focused) ?? null

    function reload() {
        Hyprland.refreshWorkspaces();
        Hyprland.refreshMonitors();
        getClients.running = true;
        getActiveClient.running = true;
    }

    function dispatch(request: string): void {
        Hyprland.dispatch(request);
    }

    Component.onCompleted: reload()

    Connections {
        target: Hyprland

        function onRawEvent(event: HyprlandEvent): void {
            if (!event.name.endsWith("v2"))
                root.reload();
        }
    }

    Process {
        id: getClients
        command: ["sh", "-c", "hyprctl -j clients | jq -c"]
        stdout: SplitParser {
            onRead: data => {
                const clients = JSON.parse(data);
                root.clients = clients.map(c => clientComp.createObject(root, {
                        lastIpcObject: c
                    })).filter(c => c);
            }
        }
    }

    Process {
        id: getActiveClient
        command: ["sh", "-c", "hyprctl -j activewindow | jq -c"]
        stdout: SplitParser {
            onRead: data => root.activeClient.lastIpcObject = JSON.parse(data)
        }
    }

    component Client: QtObject {
        property var lastIpcObject
        property string address: lastIpcObject?.address ?? ""
        property string wmClass: lastIpcObject?.class ?? ""
        property string title: lastIpcObject?.title ?? ""
        property string initialClass: lastIpcObject?.initialClass ?? ""
        property string initialTitle: lastIpcObject?.initialTitle ?? ""
        property int x: lastIpcObject?.at[0] ?? 0
        property int y: lastIpcObject?.at[1] ?? 0
        property int width: lastIpcObject?.size[0] ?? 0
        property int height: lastIpcObject?.size[1] ?? 0
        property HyprlandWorkspace workspace: Hyprland.workspaces.values.find(w => w.id === lastIpcObject?.workspace.id) ?? null
        property bool floating: lastIpcObject?.floating ?? false
        property bool fullscreen: lastIpcObject?.fullscreen ?? false
        property int pid: lastIpcObject?.pid ?? 0
    }

    Component {
        id: clientComp

        Client {}
    }
}
