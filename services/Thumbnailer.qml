pragma Singleton

import Quickshell
import Quickshell.Io
import QtQuick
import Qt.labs.platform

Singleton {
    id: root

    readonly property string thumbDir: `${StandardPaths.standardLocations(StandardPaths.GenericCacheLocation)[0]}/caelestia/thumbnails`.slice(7)

    function go(sha: string, path: string, width: int, height: int): string {
        if (!sha || !path || !width || !height)
            return "";

        const thumbPath = `${thumbDir}/${sha}@${width}x${height}-exact.png`;

        thumbProc.path = path;
        thumbProc.thumbPath = thumbPath;
        thumbProc.width = width;
        thumbProc.height = height;
        thumbProc.startDetached();

        return thumbPath;
    }

    Process {
        id: thumbProc

        property string path
        property string thumbPath
        property int width
        property int height

        command: ["fish", "-c", `
if ! test -f ${thumbPath}
    set -l size (identify -ping -format '%w\n%h' ${path})
    if test $size[1] -gt ${width} -o $size[2] -gt ${height}
        magick ${path} -thumbnail ${width}x${height}^ -background none -gravity center -extent ${width}x${height} -unsharp 0x.5 ${thumbPath}
    end
end
`]
    }
}
