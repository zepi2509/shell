pragma Singleton

import "fuzzysort.js" as Fuzzy
import "root:/widgets"
import "root:/config"
import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    readonly property list<DesktopEntry> list: DesktopEntries.applications.values.filter(a => !a.noDisplay).sort((a, b) => a.name.localeCompare(b.name))
    readonly property list<var> preppedNames: list.map(a => ({
                name: Fuzzy.prepare(a.name),
                entry: a
            }))

    function fuzzyQuery(search: string): var { // Idk why list<DesktopEntry> doesn't work
        return Fuzzy.go(search, preppedNames, {
            all: true,
            key: "name"
        }).map(r => r.obj.entry);
    }

    function launch(entry: DesktopEntry): void {
        launchProc.createObject(root, {
            entry
        });
    }

    Component {
        id: launchProc

        Process {
            required property DesktopEntry entry

            running: true
            command: ["app2unit", "--", `${entry.id}.desktop`]
        }
    }
}
