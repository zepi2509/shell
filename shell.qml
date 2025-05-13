import "modules/bar"
import "modules/launcher"
import "modules/osd"
import "modules/notifications"
import "modules/session"
import "modules/drawers"
import "modules/background"
import Quickshell

ShellRoot {
    Bar {}
    Launcher {}
    //Osd {}
    Background {}
    Drawers {}
    Notifications {}
    Session {}
}
