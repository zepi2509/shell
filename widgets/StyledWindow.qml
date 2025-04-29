import "root:/utils"
import "root:/config"
import Quickshell.Wayland

WlrLayershell {
    required property string name

    namespace: `caelestia-${name}`
    color: "transparent"
}
