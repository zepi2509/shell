import { GObject, interval, property, register } from "astal";
import { cpu as config } from "config";
import GTop from "gi://GTop";

@register({ GTypeName: "Cpu" })
export default class Cpu extends GObject.Object {
    static instance: Cpu;
    static get_default() {
        if (!this.instance) this.instance = new Cpu();

        return this.instance;
    }

    #previous: GTop.glibtop_cpu = new GTop.glibtop_cpu();
    #usage: number = 0;

    @property(Number)
    get usage() {
        return this.#usage;
    }

    calculateUsage() {
        const current = new GTop.glibtop_cpu();
        GTop.glibtop_get_cpu(current);

        // Calculate the differences from the previous to current data
        const total = current.total - this.#previous.total;
        const idle = current.idle - this.#previous.idle;

        this.#previous = current;

        return total > 0 ? ((total - idle) / total) * 100 : 0;
    }

    update() {
        this.#usage = this.calculateUsage();
        this.notify("usage");
    }

    constructor() {
        super();

        interval(config.interval, () => this.update());
    }
}
