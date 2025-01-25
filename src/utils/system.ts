import { execAsync, GLib, type Gio } from "astal";
import type AstalApps from "gi://AstalApps";
import { osIcons } from "./icons";

/**
 * See https://specifications.freedesktop.org/desktop-entry-spec/latest/exec-variables.html
 * @param exec The exec field in a desktop file
 */
const execToCmd = (app: AstalApps.Application) => {
    let exec = app.executable.replace(/%[fFuUdDnNvm]/g, ""); // Remove useless field codes
    exec = exec.replace(/%i/g, app.iconName ? `--icon ${app.iconName}` : ""); // Replace %i app icon
    exec = exec.replace(/%c/g, app.name); // Replace %c with app name
    exec = exec.replace(/%k/g, (app.app as Gio.DesktopAppInfo).get_filename() ?? ""); // Replace %k with desktop file path
    return exec;
};

export const launch = (app: AstalApps.Application) => {
    let now = Date.now();
    execAsync(["uwsm", "app", "--", app.entry]).catch(() => {
        // Try manual exec if launch fails (exits with error within 1 second)
        if (Date.now() - now < 1000) {
            now = Date.now();
            execAsync(["uwsm", "app", "--", execToCmd(app)]).catch(() => {
                // Fallback to regular launch
                if (Date.now() - now < 1000) {
                    app.frequency--; // Decrement frequency cause launch also increments it
                    app.launch();
                }
            });
        }
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
