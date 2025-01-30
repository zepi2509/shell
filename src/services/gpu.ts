import { execAsync, Gio, GObject, interval, property, register } from "astal";
import { gpu as config } from "config";

@register({ GTypeName: "Gpu" })
export default class Gpu extends GObject.Object {
    static instance: Gpu;
    static get_default() {
        if (!this.instance) this.instance = new Gpu();

        return this.instance;
    }

    readonly available: boolean = false;
    #usage: number = 0;

    @property(Number)
    get usage() {
        return this.#usage;
    }

    async calculateUsage() {
        const percs = (await execAsync("fish -c 'cat /sys/class/drm/card*/device/gpu_busy_percent'")).split("\n");
        return percs.reduce((a, b) => a + parseFloat(b), 0) / percs.length;
    }

    update() {
        this.calculateUsage().then(usage => {
            this.#usage = usage;
            this.notify("usage");
        });
    }

    constructor() {
        super();

        let enumerator = null;
        try {
            enumerator = Gio.File.new_for_path("/sys/class/drm").enumerate_children(
                Gio.FILE_ATTRIBUTE_STANDARD_NAME,
                Gio.FileQueryInfoFlags.NONE,
                null
            );
        } catch {}

        let info: Gio.FileInfo | undefined | null;
        while ((info = enumerator?.next_file(null))) {
            if (/card[0-9]+/.test(info.get_name())) {
                this.available = true;
                break;
            }
        }

        if (this.available) interval(config.interval, () => this.update());
    }
}
