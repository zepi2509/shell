pragma Singleton

import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import QtQuick

Singleton {
    id: root

    readonly property list<Client> clients: []
    readonly property var workspaces: Hyprland.workspaces
    readonly property var monitors: Hyprland.monitors
    property Client activeClient: null
    readonly property HyprlandWorkspace activeWorkspace: focusedMonitor?.activeWorkspace ?? null
    readonly property HyprlandMonitor focusedMonitor: Hyprland.monitors.values.find(m => m.lastIpcObject.focused) ?? null
    readonly property int activeWsId: activeWorkspace?.id ?? 1

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
                const rClients = root.clients;

                const len = rClients.length;
                for (let i = 0; i < len; i++) {
                    const client = rClients[i];
                    if (!clients.find(c => c.address === client?.address))
                        rClients.splice(i, 1);
                }

                for (const client of clients) {
                    const match = rClients.find(c => c.address === client.address);
                    if (match) {
                        match.lastIpcObject = client;
                    } else {
                        rClients.push(clientComp.createObject(root, {
                            lastIpcObject: client
                        }));
                    }
                }
            }
        }
    }

    Process {
        id: getActiveClient
        command: ["sh", "-c", "hyprctl -j activewindow | jq -c"]
        stdout: SplitParser {
            onRead: data => {
                const client = JSON.parse(data);
                root.activeClient = client.address ? clientComp.createObject(root, {
                    lastIpcObject: client
                }) : null;
            }
        }
    }

    component Client: QtObject {
        required property var lastIpcObject
        readonly property string address: lastIpcObject.address
        readonly property string wmClass: lastIpcObject.class
        readonly property string title: lastIpcObject.title
        readonly property string initialClass: lastIpcObject.initialClass
        readonly property string initialTitle: lastIpcObject.initialTitle
        readonly property int x: lastIpcObject.at[0]
        readonly property int y: lastIpcObject.at[1]
        readonly property int width: lastIpcObject.size[0]
        readonly property int height: lastIpcObject.size[1]
        readonly property HyprlandWorkspace workspace: Hyprland.workspaces.values.find(w => w.id === lastIpcObject.workspace.id) ?? null
        readonly property bool floating: lastIpcObject.floating
        readonly property bool fullscreen: lastIpcObject.fullscreen
        readonly property int pid: lastIpcObject.pid
        readonly property int focusHistoryId: lastIpcObject.focusHistoryID
    }

    Component {
        id: clientComp

        Client {}
    }
}
