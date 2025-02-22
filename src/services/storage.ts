import { GObject, interval, property, register } from "astal";
import { storage as config } from "config";
import GTop from "gi://GTop";

@register({ GTypeName: "Storage" })
export default class Storage extends GObject.Object {
    static instance: Storage;
    static get_default() {
        if (!this.instance) this.instance = new Storage();

        return this.instance;
    }

    #total: number = 0;
    #free: number = 0;
    #used: number = 0;
    #usage: number = 0;

    @property(Number)
    get total() {
        return this.#total;
    }

    @property(Number)
    get free() {
        return this.#free;
    }

    @property(Number)
    get used() {
        return this.#used;
    }

    @property(Number)
    get usage() {
        return this.#usage;
    }

    update() {
        const root = new GTop.glibtop_fsusage();
        GTop.glibtop_get_fsusage(root, "/");
        const home = new GTop.glibtop_fsusage();
        GTop.glibtop_get_fsusage(home, "/home");

        this.#total = root.blocks * root.block_size + home.blocks * home.block_size;
        this.#free = root.bavail * root.block_size + home.bavail * home.block_size;
        this.#used = this.#total - this.#free;
        this.#usage = this.#total > 0 ? (this.#used / this.#total) * 100 : 0;

        this.notify("total");
        this.notify("free");
        this.notify("used");
        this.notify("usage");
    }

    constructor() {
        super();

        let source = interval(config.interval.get(), () => this.update());
        config.interval.subscribe(i => {
            source.cancel();
            source = interval(i, () => this.update());
        });
    }
}
