import "root:/widgets"
import "root:/services"
import Quickshell

Scope {
    CustomShortcut {
        name: "session"
        description: "Toggle session menu"
        onPressed: {
            const visibilities = Visibilities.getForActive();
            visibilities.session = !visibilities.session;
        }
    }
}
