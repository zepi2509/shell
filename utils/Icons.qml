pragma Singleton

import Quickshell
import Quickshell.Io

Singleton {
    id: root

    readonly property var osIcons: ({
            almalinux: "",
            alpine: "",
            arch: "",
            archcraft: "",
            arcolinux: "",
            artix: "",
            centos: "",
            debian: "",
            devuan: "",
            elementary: "",
            endeavouros: "",
            fedora: "",
            freebsd: "",
            garuda: "",
            gentoo: "",
            hyperbola: "",
            kali: "",
            linuxmint: "󰣭",
            mageia: "",
            openmandriva: "",
            manjaro: "",
            neon: "",
            nixos: "",
            opensuse: "",
            suse: "",
            sles: "",
            sles_sap: "",
            "opensuse-tumbleweed": "",
            parrot: "",
            pop: "",
            raspbian: "",
            rhel: "",
            rocky: "",
            slackware: "",
            solus: "",
            steamos: "",
            tails: "",
            trisquel: "",
            ubuntu: "",
            vanilla: "",
            void: "",
            zorin: ""
        })

    readonly property var weatherIcons: ({
            warning: "󰼯",
            sunny: "󰖙",
            clear: "󰖔",
            partly_cloudy: "󰖕",
            partly_cloudy_night: "󰼱",
            cloudy: "󰖐",
            overcast: "󰖕",
            mist: "󰖑",
            patchy_rain_nearby: "󰼳",
            patchy_rain_possible: "󰼳",
            patchy_snow_possible: "󰼴",
            patchy_sleet_possible: "󰙿",
            patchy_freezing_drizzle_possible: "󰙿",
            thundery_outbreaks_possible: "󰙾",
            blowing_snow: "󰼶",
            blizzard: "󰼶",
            fog: "󰖑",
            freezing_fog: "󰖑",
            patchy_light_drizzle: "󰼳",
            light_drizzle: "󰼳",
            freezing_drizzle: "󰙿",
            heavy_freezing_drizzle: "󰙿",
            patchy_light_rain: "󰼳",
            light_rain: "󰼳",
            moderate_rain_at_times: "󰖗",
            moderate_rain: "󰼳",
            heavy_rain_at_times: "󰖖",
            heavy_rain: "󰖖",
            light_freezing_rain: "󰙿",
            moderate_or_heavy_freezing_rain: "󰙿",
            light_sleet: "󰙿",
            moderate_or_heavy_sleet: "󰙿",
            patchy_light_snow: "󰼴",
            light_snow: "󰼴",
            patchy_moderate_snow: "󰼴",
            moderate_snow: "󰼶",
            patchy_heavy_snow: "󰼶",
            heavy_snow: "󰼶",
            ice_pellets: "󰖒",
            light_rain_shower: "󰖖",
            moderate_or_heavy_rain_shower: "󰖖",
            torrential_rain_shower: "󰖖",
            light_sleet_showers: "󰼵",
            moderate_or_heavy_sleet_showers: "󰼵",
            light_snow_showers: "󰼵",
            moderate_or_heavy_snow_showers: "󰼵",
            light_showers_of_ice_pellets: "󰖒",
            moderate_or_heavy_showers_of_ice_pellets: "󰖒",
            patchy_light_rain_with_thunder: "󰙾",
            moderate_or_heavy_rain_with_thunder: "󰙾",
            moderate_or_heavy_rain_in_area_with_thunder: "󰙾",
            patchy_light_snow_with_thunder: "󰼶",
            moderate_or_heavy_snow_with_thunder: "󰼶"
        })

    readonly property var desktopEntrySubs: ({
            Firefox: "firefox"
        })

    readonly property var categoryIcons: ({
            WebBrowser: "web",
            Printing: "print",
            Security: "security",
            Network: "chat",
            Archiving: "archive",
            Compression: "archive",
            Development: "code",
            IDE: "code",
            TextEditor: "edit_note",
            Audio: "music_note",
            Music: "music_note",
            Player: "music_note",
            Recorder: "mic",
            Game: "sports_esports",
            FileTools: "files",
            FileManager: "files",
            Filesystem: "files",
            FileTransfer: "files",
            Settings: "settings",
            DesktopSettings: "settings",
            HardwareSettings: "settings",
            TerminalEmulator: "terminal",
            ConsoleOnly: "terminal",
            Utility: "build",
            Monitor: "monitor_heart",
            Midi: "graphic_eq",
            Mixer: "graphic_eq",
            AudioVideoEditing: "video_settings",
            AudioVideo: "music_video",
            Video: "videocam",
            Building: "construction",
            Graphics: "photo_library",
            "2DGraphics": "photo_library",
            RasterGraphics: "photo_library",
            TV: "tv",
            System: "host"
        })

    property string osIcon: ""
    property string osName

    function getAppCategoryIcon(name: string, fallback: string): string {
        const categories = DesktopEntries.applications.values.find(app => app.id === name)?.categories;

        if (categories)
            for (const [key, value] of Object.entries(this.categoryIcons))
                if (categories.includes(key))
                    return value;
        return fallback;
    }

    function getNetworkIcon(strength: int): string {
        if (strength >= 80)
            return "signal_wifi_4_bar";
        if (strength >= 60)
            return "network_wifi_3_bar";
        if (strength >= 40)
            return "network_wifi_2_bar";
        if (strength >= 20)
            return "network_wifi_1_bar";
        return "signal_wifi_0_bar";
    }

    function getBluetoothIcon(icon: string): string {
        if (icon.includes("headset") || icon.includes("headphones"))
            return "headphones";
        if (icon.includes("audio"))
            return "speaker";
        if (icon.includes("phone"))
            return "smartphone";
        return "bluetooth";
    }

    FileView {
        path: "/etc/os-release"
        onLoaded: {
            const lines = text().split("\n");
            let osId = lines.find(l => l.startsWith("ID="))?.split("=")[1];
            if (root.osIcons.hasOwnProperty(osId))
                root.osIcon = root.osIcons[osId];
            else {
                const osIdLike = lines.find(l => l.startsWith("ID_LIKE="))?.split("=")[1];
                if (osIdLike)
                    for (const id of osIdLike.split(" "))
                        if (root.osIcons.hasOwnProperty(id))
                            return root.osIcon = root.osIcons[id];
            }

            let nameLine = lines.find(l => l.startsWith("PRETTY_NAME="));
            if (!nameLine)
                nameLine = lines.find(l => l.startsWith("NAME="));
            root.osName = nameLine.split("=")[1].slice(1, -1);
        }
    }
}
