pragma Singleton

import "root:/utils/scripts/fuzzysort.js" as Fuzzy
import "root:/config"
import Quickshell
import Quickshell.Io
import QtQuick

Singleton {
    id: root

    readonly property list<Action> list: [
        Action {
            name: qsTr("Scheme")
            desc: qsTr("Change the current colour scheme")
            icon: "palette"

            function onClicked(list: AppList): void {
                root.autocomplete(list, "scheme");
            }
        },
        Action {
            name: qsTr("Wallpaper")
            desc: qsTr("Change the current wallpaper")
            icon: "image"

            function onClicked(list: AppList): void {
                root.autocomplete(list, "wallpaper");
            }
        },
        Action {
            name: qsTr("Variant")
            desc: qsTr("Change the current scheme variant")
            icon: "colors"

            function onClicked(list: AppList): void {
                root.autocomplete(list, "variant");
            }
        },
        Action {
            name: qsTr("Transparency")
            desc: qsTr("Change shell transparency")
            icon: "opacity"

            function onClicked(list: AppList): void {
                root.autocomplete(list, "transparency");
            }
        },
        Action {
            name: qsTr("Light")
            desc: qsTr("Change the scheme to light mode")
            icon: "light_mode"

            function onClicked(list: AppList): void {
                list.launcher.launcherVisible = false;
            // TODO
            }
        },
        Action {
            name: qsTr("Dark")
            desc: qsTr("Change the scheme to dark mode")
            icon: "dark_mode"

            function onClicked(list: AppList): void {
                list.launcher.launcherVisible = false;
            // TODO
            }
        },
        Action {
            name: qsTr("Lock")
            desc: qsTr("Lock the current session")
            icon: "lock"

            function onClicked(list: AppList): void {
                list.launcher.launcherVisible = false;
                lock.running = true;
            }
        },
        Action {
            name: qsTr("Sleep")
            desc: qsTr("Suspend then hibernate")
            icon: "bedtime"

            function onClicked(list: AppList): void {
                list.launcher.launcherVisible = false;
                sleep.running = true;
            }
        }
    ]

    readonly property list<var> preppedNames: list.map(a => ({
                name: Fuzzy.prepare(a.name),
                action: a
            }))

    function fuzzyQuery(search: string): var {
        return Fuzzy.go(search.slice(LauncherConfig.actionPrefix.length), preppedNames, {
            all: true,
            key: "name"
        }).map(r => r.obj.action);
    }

    function autocomplete(list: AppList, text: string): void {
        list.search.text = `${LauncherConfig.actionPrefix}${text} `;
    }

    Process {
        id: lock

        command: ["loginctl", "lock-session"]
    }

    Process {
        id: sleep

        command: ["systemctl", "suspend-then-hibernate"]
    }

    component Action: QtObject {
        required property string name
        required property string desc
        required property string icon

        function onClicked(list: AppList): void {
        }
    }
}
