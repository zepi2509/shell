import "root:/widgets"
import "root:/services"
import "root:/config"
import Quickshell
import QtQuick

Column {
    id: root

    required property ShellScreen screen

    padding: Appearance.padding.large

    anchors.verticalCenter: parent.verticalCenter
    anchors.right: parent.right

    spacing: Appearance.spacing.normal

    VerticalSlider {
        icon: {
            if (Audio.muted)
                return "no_sound";
            if (value >= 0.5)
                return "volume_up";
            if (value > 0)
                return "volume_down";
            return "volume_mute";
        }
        value: Audio.volume
        onMoved: Audio.setVolume(value)

        implicitWidth: OsdConfig.sizes.sliderWidth
        implicitHeight: OsdConfig.sizes.sliderHeight
    }

    VerticalSlider {
        icon: "brightness_6"

        implicitWidth: OsdConfig.sizes.sliderWidth
        implicitHeight: OsdConfig.sizes.sliderHeight
    }
}
