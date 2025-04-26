import "root:/config"
import QtQuick.Layouts

GridLayout {
    property bool vertical: false
    property real spacing: Appearance.spacing.small
    property bool homogenous: false

    flow: vertical ? GridLayout.TopToBottom : GridLayout.LeftToRight
    uniformCellWidths: homogenous && vertical
    uniformCellHeights: homogenous && !vertical
    rows: vertical ? -1 : 1
    columns: vertical ? 1 : -1
    rowSpacing: spacing
    columnSpacing: spacing
}
