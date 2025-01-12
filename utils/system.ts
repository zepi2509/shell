import { exec, GLib } from "astal";
import { osIcons } from "./icons";

export const inPath = (bin: string) => {
    try {
        exec(`which ${bin}`);
    } catch {
        return false;
    }
    return true;
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
