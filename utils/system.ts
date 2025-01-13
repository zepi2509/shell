import { exec, execAsync, GLib } from "astal";
import type AstalApps from "gi://AstalApps";
import { osIcons } from "./icons";

export const inPath = (bin: string) => {
    try {
        exec(`which ${bin}`);
    } catch {
        return false;
    }
    return true;
};

export const launch = (app: AstalApps.Application) => {
    execAsync(["uwsm", "app", "--", app.entry]).catch(() => {
        app.frequency--; // Decrement frequency cause launch also increments it
        app.launch();
    });
    app.frequency++;
};

export const osId = GLib.get_os_info("ID") ?? "unknown";
export const osIdLike = GLib.get_os_info("ID_LIKE");
export const osIcon = String.fromCodePoint(
    (() => {
        if (osIcons.hasOwnProperty(osId)) return osIcons[osId];
        if (osIdLike) for (const id of osIdLike.split(" ")) if (osIcons.hasOwnProperty(id)) return osIcons[id];
        return 0xf31a;
    })()
);
