import { execAsync, GLib } from "astal";
import type AstalApps from "gi://AstalApps";
import { osIcons } from "./icons";

export const launch = (app: AstalApps.Application) => {
    execAsync(["uwsm", "app", "--", app.entry]).catch(() => {
        app.frequency--; // Decrement frequency cause launch also increments it
        app.launch();
    });
    app.frequency++;
};

export const notify = (props: {
    summary: string;
    body?: string;
    icon?: string;
    urgency?: "low" | "normal" | "critical";
    transient?: boolean;
    actions?: Record<string, () => void>;
}) =>
    execAsync([
        "notify-send",
        "-a",
        "caelestia-shell",
        ...(props.icon ? ["-i", props.icon] : []),
        ...(props.urgency ? ["-u", props.urgency] : []),
        ...(props.transient ? ["-e"] : []),
        ...Object.keys(props.actions ?? {}).flatMap((k, i) => ["-A", `${i}=${k}`]),
        props.summary,
        ...(props.body ? [props.body] : []),
    ])
        .then(action => props.actions && Object.values(props.actions)[parseInt(action, 10)]?.())
        .catch(console.error);

export const osId = GLib.get_os_info("ID") ?? "unknown";
export const osIdLike = GLib.get_os_info("ID_LIKE");
export const osIcon = String.fromCodePoint(
    (() => {
        if (osIcons.hasOwnProperty(osId)) return osIcons[osId];
        if (osIdLike) for (const id of osIdLike.split(" ")) if (osIcons.hasOwnProperty(id)) return osIcons[id];
        return 0xf31a;
    })()
);
