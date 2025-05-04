pragma Singleton

import "root:/utils/scripts/fuzzysort.js" as Fuzzy
import Quickshell
import Quickshell.Io
import QtQuick
import Qt.labs.platform

Singleton {
    id: root

    readonly property string path: `${StandardPaths.standardLocations(StandardPaths.PicturesLocation)[0]}/Wallpapers`.slice(7)

    property list<Wallpaper> list

    readonly property list<var> preppedPaths: list.map(w => ({
                path: Fuzzy.prepare(w.path),
                wall: w
            }))

    function fuzzyQuery(search: string): var {
        return Fuzzy.go(search, preppedPaths, {
            all: true,
            keys: ["name", "path"],
            scoreFn: r => r[0].score * 0.9 + r[1].score * 0.1
        }).map(r => r.obj.wall);
    }

    Process {
        running: true
        command: ["fd", ".", root.path, "-t", "f", "-e", "jpg", "-e", "jpeg", "-e", "png", "-e", "svg"]
        stdout: SplitParser {
            splitMarker: ""
            onRead: data => {
                const list = data.trim().split("\n");
                root.list = list.map(p => wallpaperComp.createObject(root, {
                        path: p
                    }));
            }
        }
    }

    component Wallpaper: QtObject {
        required property string path
        readonly property string name: path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."))
    }

    Component {
        id: wallpaperComp

        Wallpaper {}
    }
}
