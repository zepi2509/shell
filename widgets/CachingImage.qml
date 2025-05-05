import "root:/services"
import Quickshell.Io
import QtQuick

Image {
    id: root

    property string path
    readonly property Thumbnailer.Thumbnail thumbnail: Thumbnailer.go(path, width, height)

    source: thumbnail.path ? `file://${thumbnail.path}` : ""
    asynchronous: true
    fillMode: Image.PreserveAspectCrop

    onPathChanged: {
        thumbnail.originalPath = path;
        thumbnail.reload();
    }
    onWidthChanged: {
        thumbnail.width = width;
        thumbnail.reload();
    }
    onHeightChanged: {
        thumbnail.height = height;
        thumbnail.reload();
    }
}
