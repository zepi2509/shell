import { Apps } from "@/services/apps";
import { Gio } from "astal";
import type AstalApps from "gi://AstalApps";

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

export const desktopEntrySubs: Record<string, string> = {
    Firefox: "firefox",
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

export const getAppCategoryIcon = (nameOrApp: string | AstalApps.Application) => {
    const categories =
        typeof nameOrApp === "string"
            ? Gio.DesktopAppInfo.new(`${nameOrApp}.desktop`)?.get_categories()?.split(";") ??
              Apps.fuzzy_query(nameOrApp)[0]?.categories
            : nameOrApp.categories;
    if (categories)
        for (const [key, value] of Object.entries(categoryIcons)) if (categories.includes(key)) return value;
    return "terminal";
};
