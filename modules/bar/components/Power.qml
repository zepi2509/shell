import "root:/widgets"
import "root:/config"

MaterialIcon {
    text: "power_settings_new"
    color: Appearance.colours.red
    font.bold: true
    x: implicitWidth + Appearance.padding.large * 2 - BarConfig.sizes.height
    width: BarConfig.sizes.height - Appearance.padding.large * 2
}
