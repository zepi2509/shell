import { monitorDirectory } from "@/utils/system";
import Thumbnailer from "@/utils/thumbnailer";
import { execAsync, GObject, property, register } from "astal";
import { wallpapers as config } from "config";
import Monitors from "./monitors";

export interface IWallpaper {
    path: string;
    thumbnails: {
        compact: string;
        medium: string;
        large: string;
    };
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

    async #listDir(path: { path: string; recursive: boolean; threshold: number }, type: "f" | "d") {
        const absPath = path.path.replace("~", HOME);
        const maxDepth = path.recursive ? "" : "-maxdepth 1";
        const files = await execAsync(`find ${absPath} ${maxDepth} -path '*/.*' -prune -o -type ${type} -print`);

        if (path.threshold > 0) {
            const data = (
                await execAsync([
                    "fish",
                    "-c",
                    `identify -ping -format '%i %w %h\n' ${files.replaceAll("\n", " ")} ; true`,
                ])
            ).split("\n");

            return data
                .filter(l => l && this.#filterSize(l, path.threshold))
                .map(l => l.split(" ").slice(0, -2).join(" "))
                .join("\n");
        }

        return files;
    }

    #filterSize(line: string, threshold: number) {
        const [width, height] = line.split(" ").slice(-2).map(Number);
        const mWidth = Math.max(...Monitors.get_default().list.map(m => m.width));
        const mHeight = Math.max(...Monitors.get_default().list.map(m => m.height));

        return width >= mWidth * threshold && height >= mHeight * threshold;
    }

    async update() {
        const results = await Promise.allSettled(
            config.paths.get().map(async p => ({ path: p, files: await this.#listDir(p, "f") }))
        );
        const successes = results.filter(r => r.status === "fulfilled").map(r => r.value);

        if (!successes.length) {
            this.#list = [];
            this.notify("list");
            this.#categories = [];
            this.notify("categories");
            return;
        }

        const files = successes.map(r => r.files.replaceAll("\n", " ")).join(" ");
        const list = (await execAsync(["fish", "-c", `identify -ping -format '%i\n' ${files} ; true`])).split("\n");

        this.#list = await Promise.all(
            list.map(async p => ({
                path: p,
                thumbnails: {
                    compact: await Thumbnailer.thumbnail(p, { width: 60, height: 60, exact: true }),
                    medium: await Thumbnailer.thumbnail(p, { width: 400, height: 150, exact: true }),
                    large: await Thumbnailer.thumbnail(p, { width: 400, height: 200, exact: true }),
                },
            }))
        );
        this.#list.sort((a, b) => a.path.localeCompare(b.path));
        this.notify("list");

        const categories = await Promise.all(successes.map(r => this.#listDir(r.path, "d")));
        this.#categories = categories
            .flatMap(c => c.split("\n"))
            .map(c => ({ path: c, wallpapers: this.#list.filter(w => w.path.startsWith(c)) }))
            .filter(c => c.wallpapers.length > 0)
            .sort((a, b) => a.path.localeCompare(b.path));
        this.notify("categories");
    }

    constructor() {
        super();

        this.update().catch(console.error);

        let monitors = config.paths
            .get()
            .map(p => monitorDirectory(p.path, () => this.update().catch(console.error), p.recursive));
        config.paths.subscribe(v => {
            this.update().catch(console.error);
            for (const m of monitors) m.cancel();
            monitors = v.map(p => monitorDirectory(p.path, () => this.update().catch(console.error), p.recursive));
        });
    }
}
