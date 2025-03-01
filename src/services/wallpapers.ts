import { basename } from "@/utils/strings";
import { execAsync, Gio, GLib, GObject, property, register } from "astal";
import { wallpapers as config } from "config";

export interface Wallpaper {
    path: string;
    thumbnail?: string;
}

@register({ GTypeName: "Wallpapers" })
export default class Wallpapers extends GObject.Object {
    static instance: Wallpapers;
    static get_default() {
        if (!this.instance) this.instance = new Wallpapers();

        return this.instance;
    }

    #thumbnailDir = `${CACHE}/thumbnails`;

    #list: Wallpaper[] = [];

    @property(Object)
    get list() {
        return this.#list;
    }

    async #thumbnail(path: string) {
        const thumbPath = `${this.#thumbnailDir}/${basename(path)}.jpg`;
        await execAsync(`magick -define jpeg:size=1000x500 ${path} -thumbnail 500x250 -unsharp 0x.5 ${thumbPath}`);
        return thumbPath;
    }

    async update() {
        const results = await Promise.allSettled(
            config.paths
                .get()
                .map(p => execAsync(`find ${p.path.replace("~", HOME)}/ ${p.recursive ? "" : "-maxdepth 1"} -type f`))
        );
        const files = results
            .filter(r => r.status === "fulfilled")
            .map(r => r.value.replaceAll("\n", " "))
            .join(" ");
        const list = (await execAsync(["fish", "-c", `identify -ping -format '%i\n' ${files} ; true`])).split("\n");

        this.#list = await Promise.all(list.map(async p => ({ path: p, thumbnail: await this.#thumbnail(p) })));
        this.notify("list");
    }

    constructor() {
        super();

        GLib.mkdir_with_parents(this.#thumbnailDir, 0o755);

        this.update().catch(console.error);

        const monitorDir = ({ path, recursive }: { path: string; recursive: boolean }) => {
            const file = Gio.file_new_for_path(path.replace("~", HOME));
            const monitor = file.monitor_directory(null, null);
            monitor.connect("changed", () => this.update().catch(console.error));

            const monitors = [monitor];

            if (recursive) {
                const enumerator = file.enumerate_children("standard::*", null, null);
                let child;
                while ((child = enumerator.next_file(null)))
                    if (child.get_file_type() === Gio.FileType.DIRECTORY)
                        monitors.push(...monitorDir({ path: `${path}/${child.get_name()}`, recursive }));
            }

            return monitors;
        };

        let monitors = config.paths.get().flatMap(monitorDir);
        config.paths.subscribe(v => {
            for (const m of monitors) m.cancel();
            monitors = v.flatMap(monitorDir);
        });
    }
}
