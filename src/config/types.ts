const BOOL = "boolean";
const STR = "string";
const NUM = "number";
const ARR = (type: string | string[]) => `array of ${typeof type === "string" ? type : JSON.stringify(type)}`;
const OBJ_ARR = (shape: object) => ARR(JSON.stringify(shape));

const barModules = [
    "osIcon",
    "activeWindow",
    "mediaPlaying",
    "brightnessSpacer",
    "workspaces",
    "volumeSpacer",
    "tray",
    "statusIcons",
    "pkgUpdates",
    "notifCount",
    "battery",
    "dateTime",
    "power",
];

export default {
    "style.transparency": ["off", "normal", "high"],
    "style.borders": BOOL,
    "style.vibrant": BOOL,
    // Bar
    "bar.vertical": BOOL,
    "bar.style": ["gaps", "panel", "embedded"],
    "bar.layout.type": ["centerbox", "flowbox"],
    "bar.layout.centerbox.start": ARR(barModules),
    "bar.layout.centerbox.center": ARR(barModules),
    "bar.layout.centerbox.end": ARR(barModules),
    "bar.layout.flowbox": ARR(barModules),
    "bar.modules.workspaces.shown": NUM,
    "bar.modules.dateTime.format": STR,
    "bar.modules.dateTime.detailedFormat": STR,
    // Launcher
    "launcher.style": ["lines", "round"],
    "launcher.actionPrefix": STR,
    "launcher.apps.maxResults": NUM,
    "launcher.files.maxResults": NUM,
    "launcher.files.fdOpts": ARR(STR),
    "launcher.files.shortenThreshold": NUM,
    "launcher.math.maxResults": NUM,
    "launcher.todo.notify": BOOL,
    "launcher.wallpaper.style": ["compact", "medium", "large"],
    "launcher.disabledActions": ARR(STR),
    // Notif popups
    "notifpopups.maxPopups": NUM,
    "notifpopups.expire": BOOL,
    "notifpopups.agoTime": BOOL,
    // OSDs
    "osds.volume.position": [2, 4, 8, 16],
    "osds.volume.margin": NUM,
    "osds.volume.hideDelay": NUM,
    "osds.volume.showValue": BOOL,
    "osds.brightness.position": [2, 4, 8, 16],
    "osds.brightness.margin": NUM,
    "osds.brightness.hideDelay": NUM,
    "osds.brightness.showValue": BOOL,
    "osds.lock.spacing": NUM,
    "osds.lock.caps.hideDelay": NUM,
    "osds.lock.num.hideDelay": NUM,
    // Sidebar
    "sidebar.showOnStartup": BOOL,
    // Services
    "math.maxHistory": NUM,
    "updates.interval": NUM,
    "weather.interval": NUM,
    "weather.key": STR,
    "weather.location": STR,
    "weather.imperial": BOOL,
    "cpu.interval": NUM,
    "gpu.interval": NUM,
    "memory.interval": NUM,
    "storage.interval": NUM,
    "wallpapers.paths": OBJ_ARR({ recursive: BOOL, path: STR, threshold: NUM }),
    "calendar.webcals": ARR(STR),
    "calendar.upcomingDays": NUM,
    "calendar.notify": BOOL,
} as { [k: string]: string | string[] | number[] };
