pragma Singleton

import "root:/utils/scripts/fuzzysort.js" as Fuzzy
import Quickshell
import Quickshell.Io

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
        launchProc.entry = entry;
        launchProc.startDetached();
    }

    Process {
        id: launchProc

        property DesktopEntry entry

        command: ["app2unit", "--", `${entry.id}.desktop`]
    }
}
