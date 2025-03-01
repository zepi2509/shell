import { execAsync, GLib, GObject, monitorFile, property, readFileAsync, register } from "astal";
import type { IPalette } from "./palette";

const DATA = `${GLib.get_user_data_dir()}/caelestia`;

@register({ GTypeName: "Schemes" })
export default class Schemes extends GObject.Object {
    static instance: Schemes;
    static get_default() {
        if (!this.instance) this.instance = new Schemes();

        return this.instance;
    }

    #map: { [k: string]: IPalette } = {};

    @property(Object)
    get map() {
        return this.#map;
    }

    #schemePathToName(path: string) {
        return path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf("."));
    }

    async parseScheme(path: string) {
        const schemeColours = (await readFileAsync(path)).split("\n").map(l => l.split(" "));
        return schemeColours.reduce((acc, [name, hex]) => ({ ...acc, [name]: `#${hex}` }), {} as IPalette);
    }

    async update() {
        const schemes = await execAsync(`find ${DATA}/scripts/data/schemes/ -type f`);
        for (const scheme of schemes.split("\n"))
            this.#map[this.#schemePathToName(scheme)] = await this.parseScheme(scheme);
        this.notify("map");
    }

    constructor() {
        super();

        this.update().catch(console.error);
        monitorFile(`${DATA}/scripts/data/schemes`, () => this.update().catch(console.error));
    }
}
