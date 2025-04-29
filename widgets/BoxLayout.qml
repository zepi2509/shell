import "root:/config"
import QtQuick.Layouts

GridLayout {
    property bool vertical: parent.vertical ?? false // Propagate from parent
    property bool homogenous: false
    property int spacing: Appearance.spacing.small

    flow: vertical ? GridLayout.TopToBottom : GridLayout.LeftToRight
    uniformCellWidths: homogenous || vertical
    uniformCellHeights: homogenous || !vertical
    rows: vertical ? -1 : 1
    columns: vertical ? 1 : -1
    rowSpacing: spacing
    columnSpacing: spacing
}
