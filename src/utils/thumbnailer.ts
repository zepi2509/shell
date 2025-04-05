import { execAsync, Gio, GLib } from "astal";
import { pathToFileName } from "./strings";

export interface ThumbOpts {
    width?: number;
    height?: number;
    exact?: boolean;
}

export default class Thumbnailer {
    static readonly thumbnailDir = `${CACHE}/thumbnails`;

    static lazy: boolean = true;
    static maxAttempts: number = 5;
    static timeBetweenAttempts: number = 300;
    static defaults: Required<ThumbOpts> = {
        width: 100,
        height: 100,
        exact: true,
    };

    static readonly #running = new Set<string>();

    static getOpt<T extends keyof ThumbOpts>(opt: T, opts: ThumbOpts) {
        return opts[opt] ?? this.defaults[opt];
    }

    static getThumbPath(path: string, opts: ThumbOpts) {
        const size = `${this.getOpt("width", opts)}x${this.getOpt("height", opts)}`;
        const exact = this.getOpt("exact", opts) ? "-exact" : "";
        return `${this.thumbnailDir}/${pathToFileName(path, "")}@${size}${exact}.png`;
    }

    static async shouldThumbnail(path: string, opts: ThumbOpts) {
        const [w, h] = (await execAsync(`identify -ping -format "%w %h" ${path}`)).split(" ").map(parseInt);
        return w > this.getOpt("width", opts) || h > this.getOpt("height", opts);
    }

    static async #thumbnail(path: string, opts: ThumbOpts, attempts: number): Promise<string> {
        const thumbPath = this.getThumbPath(path, opts);

        try {
            const width = this.getOpt("width", opts);
            const height = this.getOpt("height", opts);
            const cropCmd = this.getOpt("exact", opts) ? `-gravity Center -extent ${width}x${height}` : "";
            await execAsync(`magick ${path} -thumbnail ${width}x${height}^ ${cropCmd} -unsharp 0x.5 ${thumbPath}`);
        } catch {
            if (attempts >= this.maxAttempts) {
                console.error(`Failed to generate thumbnail for ${path}`);
                return path;
            }

            await new Promise(r => setTimeout(r, this.timeBetweenAttempts));
            return this.#thumbnail(path, opts, attempts + 1);
        }

        return thumbPath;
    }

    static async thumbnail(path: string, opts: ThumbOpts = {}): Promise<string> {
        if (!(await this.shouldThumbnail(path, opts))) return path;

        let thumbPath = this.getThumbPath(path, opts);

        // If not lazy (i.e. force gen), delete existing thumbnail
        if (!this.lazy) Gio.File.new_for_path(thumbPath).delete(null);

        // Wait for existing thumbnail for path to finish
        while (this.#running.has(path)) await new Promise(r => setTimeout(r, 100));

        // If no thumbnail, generate
        if (!GLib.file_test(thumbPath, GLib.FileTest.EXISTS)) {
            this.#running.add(path);

            thumbPath = await this.#thumbnail(path, opts, 0);

            this.#running.delete(path);
        }

        return thumbPath;
    }

    // Static class
    private constructor() {}

    static {
        GLib.mkdir_with_parents(this.thumbnailDir, 0o755);
    }
}
