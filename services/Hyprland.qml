pragma Singleton
pragma ComponentBehavior: Bound

import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import QtQuick

Singleton {
    id: root

    property list<var> clients: []
    property list<var> monitors: []
    property list<var> workspaces: []
    property var activeClient: null
    property var activeWorkspace: null
    property var focusedMonitor: null

    function reload() {
        getClients.running = true;
        getMonitors.running = true;
        getWorkspaces.running = true;
        getActiveClient.running = true;
        getActiveWorkspace.running = true;
    }

    Component.onCompleted: reload()

    Connections {
        target: Hyprland
        function onRawEvent(event: string): void {
            if (!event.endsWith("v2"))
                root.reload();
        }
    }

    component HyprData: Process {
        id: proc

        required property string type
        property string prop: type
        property bool array: true
        function transform(data) {
            return data;
        }

        command: ["bash", "-c", `hyprctl -j ${type} | jq -c`]
        stdout: SplitParser {
            onRead: data => {
                root[proc.prop] = proc.array ? JSON.parse(data).map(proc.transform) : proc.transform(JSON.parse(data));
                if (proc.type === "monitors")
                    root.focusedMonitor = root.monitors.find(m => m.focused);
            }
        }

        function transformClient(client) {
            if (!client.address)
                return null;

            return {
                address: client.address,
                x: client.at[0],
                y: client.at[1],
                width: client.size[0],
                height: client.size[1],
                workspace: transformWorkspace(client.workspace),
                floating: client.floating,
                monitor: client.monitor,
                wmClass: client.class,
                title: client.title,
                initialClass: client.initialClass,
                initialTitle: client.initialTitle,
                pid: client.pid,
                xwayland: client.xwayland,
                pinned: client.pinned,
                fullscreen: client.fullscreen,
                focusHistoryId: client.focusHistoryID,
                inhibitingIdle: client.inhibitingIdle
            };
        }

        function transformMonitor(monitor) {
            return {
                id: monitor.id,
                name: monitor.name,
                description: monitor.description,
                make: monitor.make,
                model: monitor.model,
                serial: monitor.serial,
                x: monitor.x,
                y: monitor.y,
                width: monitor.width,
                height: monitor.height,
                refreshRate: monitor.refreshRate,
                activeWorkspace: transformWorkspace(monitor.activeWorkspace),
                specialWorkspace: transformWorkspace(monitor.specialWorkspace),
                reserved: monitor.reserved,
                scale: monitor.scale,
                transform: monitor.transform,
                focused: monitor.focused,
                dpms: monitor.dpms,
                vrr: monitor.vrr,
                disabled: monitor.disabled
            };
        }

        function transformWorkspace(workspace) {
            return {
                id: workspace.id,
                name: workspace.name,
                special: workspace.name.startsWith("special:")
            };
        }
    }

    HyprData {
        id: getClients
        type: "clients"
        function transform(client) {
            return transformClient(client);
        }
    }

    HyprData {
        id: getMonitors
        type: "monitors"
        function transform(monitor) {
            return transformMonitor(monitor);
        }
    }

    HyprData {
        id: getWorkspaces
        type: "workspaces"
        function transform(workspace) {
            return transformWorkspace(workspace);
        }
    }

    HyprData {
        id: getActiveClient
        type: "activewindow"
        prop: "activeClient"
        array: false
        function transform(client) {
            return transformClient(client);
        }
    }

    HyprData {
        id: getActiveWorkspace
        type: "activeworkspace"
        prop: "activeWorkspace"
        array: false
        function transform(workspace) {
            return transformWorkspace(workspace);
        }
    }
}
