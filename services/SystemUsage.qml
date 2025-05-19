pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    property real cpuPerc
    property int memUsed
    property int memTotal
    readonly property real memPerc: memTotal > 0 ? memUsed / memTotal : 0
    property int storageUsed
    property int storageTotal
    property real storagePerc: storageTotal > 0 ? storageUsed / storageTotal : 0

    property int lastCpuIdle
    property int lastCpuTotal

    Timer {
        running: true
        interval: 1000
        repeat: true
        onTriggered: {
            stat.reload();
            meminfo.reload();
            storage.running = true;
        }
    }

    FileView {
        id: stat

        path: "/proc/stat"
        onLoaded: {
            const data = text().match(/^cpu\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
            if (data) {
                const stats = data.slice(1).map(n => parseInt(n, 10));
                const total = stats.reduce((a, b) => a + b, 0);
                const idle = stats[3];

                const totalDiff = total - root.lastCpuTotal;
                const idleDiff = idle - root.lastCpuIdle;
                root.cpuPerc = totalDiff > 0 ? (1 - idleDiff / totalDiff) : 0;

                root.lastCpuTotal = total;
                root.lastCpuIdle = idle;
            }
        }
    }

    FileView {
        id: meminfo

        path: "/proc/meminfo"
        onLoaded: {
            const data = text();
            root.memTotal = parseInt(data.match(/MemTotal: *(\d+)/)[1], 10) || 1;
            root.memUsed = (root.memTotal - parseInt(data.match(/MemAvailable: *(\d+)/)[1], 10)) || 0;
        }
    }

    Process {
        id: storage

        running: true
        command: ["sh", "-c", "df | grep '^/dev/' | awk '{print $3, $4}'"]
        stdout: SplitParser {
            splitMarker: ""
            onRead: data => {
                let used = 0;
                let avail = 0;
                for (const line of data.trim().split("\n")) {
                    const [u, a] = line.split(" ");
                    used += parseInt(u, 10);
                    avail += parseInt(a, 10);
                }
                root.storageUsed = used;
                root.storageTotal = used + avail;
            }
        }
    }
}
