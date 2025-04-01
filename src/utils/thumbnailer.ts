import { execAsync, Gio, GLib } from "astal";
import { basename } from "./strings";

export default class Thumbnailer {
    static readonly thumbnailDir = `${CACHE}/thumbnails`;

    static lazy = true;
    static thumbWidth = 500;
    static thumbHeight = 250;
    static maxAttempts = 5;
    static timeBetweenAttempts = 300;

    static readonly #running = new Set<string>();

    static getThumbPath(path: string) {
        const dir = path.slice(path.indexOf("/") + 1, path.lastIndexOf("/")).replaceAll("/", "-");
        return `${this.thumbnailDir}/${dir}-${basename(path)}.jpg`;
    }

    static async #thumbnail(path: string, attempts: number): Promise<string> {
        const thumbPath = this.getThumbPath(path);

        try {
            await execAsync(
                `magick -define jpeg:size=${this.thumbWidth * 2}x${this.thumbHeight * 2} ${path} -thumbnail ${
                    this.thumbWidth
                }x${this.thumbHeight} -unsharp 0x.5 ${thumbPath}`
            );
        } catch {
            if (attempts >= this.maxAttempts) {
                console.error(`Failed to generate thumbnail for ${path}`);
                return path;
            }

            await new Promise(r => setTimeout(r, this.timeBetweenAttempts));
            return this.#thumbnail(path, attempts + 1);
        }

        return thumbPath;
    }

    static async thumbnail(path: string): Promise<string> {
        let thumbPath = this.getThumbPath(path);

        // If not lazy (i.e. force gen), delete existing thumbnail
        if (!this.lazy) Gio.File.new_for_path(thumbPath).delete(null);

        // Wait for existing thumbnail for path to finish
        while (this.#running.has(path)) await new Promise(r => setTimeout(r, 100));

        // If no thumbnail, generate
        if (!GLib.file_test(thumbPath, GLib.FileTest.EXISTS)) {
            this.#running.add(path);

            thumbPath = await this.#thumbnail(path, 0);

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
