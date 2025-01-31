import { Apps } from "@/services/apps";
import { Gio } from "astal";
import type AstalApps from "gi://AstalApps";

export const osIcons: Record<string, string> = {
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
    zorin: "",
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
