pragma Singleton
pragma ComponentBehavior: Bound

import Quickshell
import Quickshell.Io
import QtQuick
import Qt.labs.platform

Singleton {
    id: root

    readonly property string thumbDir: `${StandardPaths.standardLocations(StandardPaths.GenericCacheLocation)[0]}/caelestia/thumbnails`.slice(7)

    function go(path: string, width: int, height: int): var {
        return thumbComp.createObject(root, {
            originalPath: path,
            width: width,
            height: height
        });
    }

    component Thumbnail: QtObject {
        id: obj

        required property string originalPath
        required property int width
        required property int height

        property string path

        readonly property Process shaProc: Process {
            running: true
            command: ["sha1sum", obj.originalPath]
            stdout: SplitParser {
                onRead: data => {
                    const sha = data.split(" ")[0];
                    obj.path = `${root.thumbDir}/${sha}@${obj.width}x${obj.height}-exact.png`;
                    obj.thumbProc.running = true;
                }
            }
        }

        readonly property Process thumbProc: Process {
            command: ["fish", "-c", `
if test -f ${obj.path}
    exit 1
else
    set -l size (identify -ping -format '%w\n%h' ${obj.originalPath})
    if test $size[1] -gt ${obj.width} -o $size[2] -gt ${obj.height}
        magick ${obj.originalPath} -${obj.width > 1024 || obj.height > 1024 ? "resize" : "thumbnail"} ${obj.width}x${obj.height}^ -background none -gravity center -extent ${obj.width}x${obj.height} -unsharp 0x.5 ${obj.path}
    else
        cp ${obj.originalPath} ${obj.path}
    end
end`]
            onExited: code => {
                if (code === 0) {
                    const path = obj.path;
                    obj.path = "";
                    obj.path = path;
                }
            }
        }

        function reload(): void {
            shaProc.running = true;
        }
    }

    Component {
        id: thumbComp

        Thumbnail {}
    }
}
