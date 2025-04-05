import { execAsync, GLib, type Variable } from "astal";
import { thumbnailer as config } from "config";

export interface ThumbOpts {
    width?: number;
    height?: number;
    exact?: boolean;
}

export default class Thumbnailer {
    static readonly thumbnailDir = `${CACHE}/thumbnails`;

    static readonly #running = new Set<string>();

    static getOpt<T extends keyof ThumbOpts>(opt: T, opts: ThumbOpts) {
        return opts[opt] ?? (config.defaults[opt] as Variable<NonNullable<ThumbOpts[T]>>).get();
    }

    static async getThumbPath(path: string, opts: ThumbOpts) {
        const hash = (await execAsync(`sha1sum ${path}`)).split(" ")[0];
        const size = `${this.getOpt("width", opts)}x${this.getOpt("height", opts)}`;
        const exact = this.getOpt("exact", opts) ? "-exact" : "";
        return `${this.thumbnailDir}/${hash}@${size}${exact}.png`;
    }

    static async shouldThumbnail(path: string, opts: ThumbOpts) {
        const [w, h] = (await execAsync(`identify -ping -format "%w %h" ${path}`)).split(" ").map(parseInt);
        return w > this.getOpt("width", opts) || h > this.getOpt("height", opts);
    }

    static async #thumbnail(path: string, opts: ThumbOpts, attempts: number): Promise<string> {
        const thumbPath = await this.getThumbPath(path, opts);

        try {
            const width = this.getOpt("width", opts);
            const height = this.getOpt("height", opts);
            const cropCmd = this.getOpt("exact", opts) ? `-gravity Center -extent ${width}x${height}` : "";
            await execAsync(`magick ${path} -thumbnail ${width}x${height}^ ${cropCmd} -unsharp 0x.5 ${thumbPath}`);
        } catch {
            if (attempts >= config.maxAttempts.get()) {
                console.error(`Failed to generate thumbnail for ${path}`);
                return path;
            }

            await new Promise(r => setTimeout(r, config.timeBetweenAttempts.get()));
            return this.#thumbnail(path, opts, attempts + 1);
        }

        return thumbPath;
    }

    static async thumbnail(path: string, opts: ThumbOpts = {}): Promise<string> {
        if (!(await this.shouldThumbnail(path, opts))) return path;

        let thumbPath = await this.getThumbPath(path, opts);

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
