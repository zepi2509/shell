import { basename } from "@/utils/strings";
import { monitorDirectory } from "@/utils/system";
import { execAsync, GLib, GObject, property, register } from "astal";
import { wallpapers as config } from "config";

export interface IWallpaper {
    path: string;
    thumbnail?: string;
}

export interface ICategory {
    path: string;
    wallpapers: IWallpaper[];
}

@register({ GTypeName: "Wallpapers" })
export default class Wallpapers extends GObject.Object {
    static instance: Wallpapers;
    static get_default() {
        if (!this.instance) this.instance = new Wallpapers();

        return this.instance;
    }

    #thumbnailDir = `${CACHE}/thumbnails`;

    #list: IWallpaper[] = [];
    #categories: ICategory[] = [];

    @property(Object)
    get list() {
        return this.#list;
    }

    @property(Object)
    get categories() {
        return this.#categories;
    }

    async #thumbnail(path: string) {
        const dir = path.slice(1, path.lastIndexOf("/")).replaceAll("/", "-");
        const thumbPath = `${this.#thumbnailDir}/${dir}-${basename(path)}.jpg`;
        await execAsync(`magick -define jpeg:size=1000x500 ${path} -thumbnail 500x250 -unsharp 0x.5 ${thumbPath}`);
        return thumbPath;
    }

    #listDir(path: { path: string; recursive: boolean }, type: "f" | "d") {
        const absPath = path.path.replace("~", HOME);
        const maxDepth = path.recursive ? "" : "-maxdepth 1";
        return execAsync(`find ${absPath} ${maxDepth} -path '*/.*' -prune -o -type ${type} -print`);
    }

    async update() {
        const results = await Promise.allSettled(
            config.paths.get().map(async p => ({ path: p, files: await this.#listDir(p, "f") }))
        );
        const successes = results.filter(r => r.status === "fulfilled").map(r => r.value);

        const files = successes.map(r => r.files.replaceAll("\n", " ")).join(" ");
        const list = (await execAsync(["fish", "-c", `identify -ping -format '%i\n' ${files} ; true`])).split("\n");

        this.#list = await Promise.all(list.map(async p => ({ path: p, thumbnail: await this.#thumbnail(p) })));
        this.notify("list");

        const categories = await Promise.all(successes.map(r => this.#listDir(r.path, "d")));
        this.#categories = categories
            .flatMap(c => c.split("\n"))
            .map(c => ({ path: c, wallpapers: this.#list.filter(w => w.path.startsWith(c)) }))
            .filter(c => c.wallpapers.length > 0);
        this.notify("categories");
    }

    constructor() {
        super();

        GLib.mkdir_with_parents(this.#thumbnailDir, 0o755);

        this.update().catch(console.error);

        let monitors = config.paths
            .get()
            .map(p => monitorDirectory(p.path, () => this.update().catch(console.error), p.recursive));
        config.paths.subscribe(v => {
            for (const m of monitors) m.cancel();
            monitors = v.map(p => monitorDirectory(p.path, () => this.update().catch(console.error), p.recursive));
        });
    }
}
