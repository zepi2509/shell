import "root:/services"
import Quickshell.Io
import QtQuick

Image {
    id: root

    required property string path
    property string thumbnail

    source: {
        if (thumbnail)
            return `file://${thumbnail}`;
        shaProc.running = true;
        return "";
    }
    asynchronous: true
    fillMode: Image.PreserveAspectCrop

    onPathChanged: shaProc.running = true
    onWidthChanged: shaProc.running = true
    onHeightChanged: shaProc.running = true
    onStatusChanged: {
        if (status === Image.Error)
            waitProc.running = true;
    }

    Process {
        id: shaProc

        command: ["sha1sum", root.path]
        stdout: SplitParser {
            onRead: data => root.thumbnail = Thumbnailer.go(data.split(" ")[0], root.path, root.width, root.height)
        }
    }

    Process {
        id: waitProc

        command: ["inotifywait", "-q", "-e", "close_write", "--format", "%w%f", "-m", root.thumbnail.slice(0, root.thumbnail.lastIndexOf("/"))]
        stdout: SplitParser {
            onRead: file => {
                if (file === root.thumbnail) {
                    root.source = file;
                    waitProc.running = false;
                }
            }
        }
    }
}
