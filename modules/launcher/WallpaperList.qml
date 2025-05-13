import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick
import QtQuick.Controls

PathView {
    id: root

    required property TextField search
    required property PersistentProperties visibilities

    model: ScriptModel {
        readonly property string search: root.search.text.split(" ").slice(1).join(" ")

        values: {
            const list = Wallpapers.fuzzyQuery(search);
            if (list.length > 1 && list.length % 2 === 0)
                list.length -= 1; // Always show odd number
            return list;
        }
        onValuesChanged: root.currentIndex = search ? 0 : values.findIndex(w => w.path === Wallpapers.actualCurrent)
    }

    Component.onCompleted: currentIndex = Wallpapers.list.findIndex(w => w.path === Wallpapers.actualCurrent)
    Component.onDestruction: Wallpapers.stopPreview()

    onCurrentItemChanged: {
        if (currentItem)
            Wallpapers.preview(currentItem.modelData.path);
    }

    implicitWidth: Math.min(LauncherConfig.maxWallpapers, count) * (LauncherConfig.sizes.wallpaperWidth * 0.8 + Appearance.padding.larger * 2)
    pathItemCount: LauncherConfig.maxWallpapers
    cacheItemCount: 4

    snapMode: PathView.SnapToItem
    preferredHighlightBegin: 0.5
    preferredHighlightEnd: 0.5
    highlightRangeMode: PathView.StrictlyEnforceRange
    highlightMoveDuration: Appearance.anim.durations.short

    delegate: WallpaperItem {
        visibilities: root.visibilities
    }

    path: Path {
        startY: root.height / 2

        PathAttribute {
            name: "z"
            value: 0
        }
        PathLine {
            x: root.width / 2
            relativeY: 0
        }
        PathAttribute {
            name: "z"
            value: 1
        }
        PathLine {
            x: root.width
            relativeY: 0
        }
    }
}
