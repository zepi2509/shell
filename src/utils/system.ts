import { bind, execAsync, Gio, GLib, Variable, type Binding } from "astal";
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
    execAsync(["app2unit", "--", app.entry]).catch(() => {
        // Try manual exec if launch fails (exits with error within 1 second)
        if (Date.now() - now < 1000) {
            now = Date.now();
            execAsync(["app2unit", "--", execToCmd(app)]).catch(() => {
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
export const osIcon = (() => {
    if (osIcons.hasOwnProperty(osId)) return osIcons[osId];
    if (osIdLike) for (const id of osIdLike.split(" ")) if (osIcons.hasOwnProperty(id)) return osIcons[id];
    return "";
})();

export const currentTime = Variable(GLib.DateTime.new_now_local()).poll(1000, () => GLib.DateTime.new_now_local());
export const bindCurrentTime = (
    format: Binding<string> | string,
    fallback?: (time: GLib.DateTime) => string,
    self?: JSX.Element
) => {
    const fmt = (c: GLib.DateTime, format: string) => c.format(format) ?? fallback?.(c) ?? new Date().toLocaleString();
    if (typeof format === "string") return bind(currentTime).as(c => fmt(c, format));
    if (!self) throw new Error("bindCurrentTime: self is required when format is a Binding");
    const time = Variable.derive([currentTime, format], (c, f) => fmt(c, f));
    self?.connect("destroy", () => time.drop());
    return bind(time);
};

const monitors = new Set();
export const monitorDirectory = (
    path: string,
    callback: (
        source: Gio.FileMonitor,
        file: Gio.File,
        other_file: Gio.File | null,
        type: Gio.FileMonitorEvent
    ) => void,
    recursive: boolean = true
) => {
    const file = Gio.file_new_for_path(path.replace("~", HOME));
    const monitor = file.monitor_directory(null, null);
    monitor.connect("changed", (m, f1, f2, t) => {
        if (t === Gio.FileMonitorEvent.CHANGES_DONE_HINT || t === Gio.FileMonitorEvent.DELETED) callback(m, f1, f2, t);
    });

    if (recursive) {
        const enumerator = file.enumerate_children("standard::*", null, null);
        let child;
        while ((child = enumerator.next_file(null)))
            if (child.get_file_type() === Gio.FileType.DIRECTORY) {
                const m = monitorDirectory(`${path}/${child.get_name()}`, callback, recursive);
                monitor.connect("notify::cancelled", () => m.cancel());
            }
    }

    // Keep ref to monitor so it doesn't get GCed
    monitors.add(monitor);
    monitor.connect("notify::cancelled", () => monitor.cancelled && monitors.delete(monitor));

    return monitor;
};
