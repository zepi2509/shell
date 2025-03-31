const BOOL = "boolean";
const STR = "string";
const NUM = "number";
const ARR = (type: string) => `array of ${type}`;
const OBJ_ARR = (shape: object) => ARR(JSON.stringify(shape));

export default {
    "style.transparency": ["off", "normal", "high"],
    "style.vibrant": BOOL,
    // Bar
    "bar.vertical": BOOL,
    "bar.style": ["gaps", "panel", "embedded"],
    "bar.modules.osIcon.enabled": BOOL,
    "bar.modules.activeWindow.enabled": BOOL,
    "bar.modules.mediaPlaying.enabled": BOOL,
    "bar.modules.workspaces.enabled": BOOL,
    "bar.modules.workspaces.shown": NUM,
    "bar.modules.tray.enabled": BOOL,
    "bar.modules.statusIcons.enabled": BOOL,
    "bar.modules.pkgUpdates.enabled": BOOL,
    "bar.modules.notifCount.enabled": BOOL,
    "bar.modules.battery.enabled": BOOL,
    "bar.modules.dateTime.enabled": BOOL,
    "bar.modules.dateTime.format": STR,
    "bar.modules.dateTime.detailedFormat": STR,
    "bar.modules.power.enabled": BOOL,
    // Launcher
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
    // Sideleft
    "sideleft.directories.left.top": STR,
    "sideleft.directories.left.middle": STR,
    "sideleft.directories.left.bottom": STR,
    "sideleft.directories.right.top": STR,
    "sideleft.directories.right.middle": STR,
    "sideleft.directories.right.bottom": STR,
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
    "wallpapers.paths": OBJ_ARR({ recursive: BOOL, path: STR }),
} as { [k: string]: string | string[] | number[] };
