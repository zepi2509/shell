import { Gio } from "astal";
import { Astal } from "astal/gtk3";
import { Apps } from "../services/apps";

// Code points from https://www.github.com/lukas-w/font-logos
export const osIcons: Record<string, number> = {
    almalinux: 0xf31d,
    alpine: 0xf300,
    arch: 0xf303,
    arcolinux: 0xf346,
    centos: 0x304,
    debian: 0xf306,
    elementary: 0xf309,
    endeavouros: 0xf322,
    fedora: 0xf30a,
    gentoo: 0xf30d,
    kali: 0xf327,
    linuxmint: 0xf30e,
    mageia: 0xf310,
    manjaro: 0xf312,
    nixos: 0xf313,
    opensuse: 0xf314,
    suse: 0xf314,
    sles: 0xf314,
    sles_sap: 0xf314,
    pop: 0xf32a,
    raspbian: 0xf315,
    rhel: 0xf316,
    rocky: 0xf32b,
    slackware: 0xf318,
    ubuntu: 0xf31b,
};

const appIcons: Record<string, string> = {
    "code-url-handler": "visual-studio-code",
    code: "visual-studio-code",
    "codium-url-handler": "vscodium",
    codium: "vscodium",
    "GitHub Desktop": "github-desktop",
    "gnome-tweaks": "org.gnome.tweaks",
    "org.pulseaudio.pavucontrol": "pavucontrol",
    "pavucontrol-qt": "pavucontrol",
    "jetbrains-pycharm-ce": "pycharm-community",
    "Spotify Free": "Spotify",
    safeeyes: "io.github.slgobinath.SafeEyes",
    "yad-icon-browser": "yad",
    xterm: "uxterm",
    "com-atlauncher-App": "atlauncher",
    avidemux3_qt5: "avidemux",
};

const appRegex = [
    { regex: /^steam_app_(\d+)$/, replace: "steam_icon_$1" },
    { regex: /^Minecraft\* [0-9\.]+$/, replace: "minecraft" },
];

export const getAppIcon = (name: string) => {
    if (appIcons.hasOwnProperty(name)) return appIcons[name];
    for (const { regex, replace } of appRegex) {
        const postSub = name.replace(regex, replace);
        if (postSub !== name) return postSub;
    }

    if (Astal.Icon.lookup_icon(name)) return name;

    const apps = Apps.fuzzy_query(name);
    if (apps.length > 0) return apps[0].iconName;

    return "image";
};

const categoryIcons: Record<string, string> = {
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
    System: "host",
};

export const getAppCategoryIcon = (name: string) => {
    const categories =
        Gio.DesktopAppInfo.new(`${name}.desktop`)?.get_categories()?.split(";") ??
        Apps.fuzzy_query(name)[0]?.categories;
    if (categories)
        for (const [key, value] of Object.entries(categoryIcons)) if (categories.includes(key)) return value;
    return "terminal";
};
