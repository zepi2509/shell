import { GObject, interval, property, readFileAsync, register } from "astal";
import { memory as config } from "config";

@register({ GTypeName: "Memory" })
export default class Memory extends GObject.Object {
    static instance: Memory;
    static get_default() {
        if (!this.instance) this.instance = new Memory();

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

    async update() {
        const info = await readFileAsync("/proc/meminfo");
        this.#total = parseInt(info.match(/MemTotal:\s+(\d+)/)?.[1] ?? "0", 10) * 1024;
        this.#free = parseInt(info.match(/MemAvailable:\s+(\d+)/)?.[1] ?? "0", 10) * 1024;

        if (isNaN(this.#total)) this.#total = 0;
        if (isNaN(this.#free)) this.#free = 0;

        this.#used = this.#total - this.#free;
        this.#usage = this.#total > 0 ? (this.#used / this.#total) * 100 : 0;

        this.notify("total");
        this.notify("free");
        this.notify("used");
        this.notify("usage");
    }

    constructor() {
        super();

        interval(config.interval, () => this.update().catch(console.error));
    }
}
