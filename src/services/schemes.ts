import { basename } from "@/utils/strings";
import { monitorDirectory } from "@/utils/system";
import { execAsync, GLib, GObject, property, readFileAsync, register } from "astal";
import type { IPalette } from "./palette";

export interface Colours {
    light?: IPalette;
    dark?: IPalette;
}

export interface Flavour {
    name: string;
    scheme: string;
    colours: Colours;
}

export interface Scheme {
    name: string;
    flavours?: { [k: string]: Flavour };
    colours?: Colours;
}

const DATA = `${GLib.get_user_data_dir()}/caelestia`;

@register({ GTypeName: "Schemes" })
export default class Schemes extends GObject.Object {
    static instance: Schemes;
    static get_default() {
        if (!this.instance) this.instance = new Schemes();

        return this.instance;
    }

    readonly #schemeDir: string = `${DATA}/scripts/data/schemes`;

    #map: { [k: string]: Scheme } = {};

    @property(Object)
    get map() {
        return this.#map;
    }

    async parseMode(path: string): Promise<IPalette> {
        const schemeColours = (await readFileAsync(path)).split("\n").map(l => l.split(" "));
        return schemeColours.reduce((acc, [name, hex]) => ({ ...acc, [name]: `#${hex}` }), {} as IPalette);
    }

    async parseFlavour(scheme: string, name: string): Promise<Flavour> {
        const path = `${this.#schemeDir}/${scheme}/${name}`;

        let light = undefined;
        let dark = undefined;
        if (GLib.file_test(`${path}/light.txt`, GLib.FileTest.EXISTS))
            light = await this.parseMode(`${path}/light.txt`);
        if (GLib.file_test(`${path}/dark.txt`, GLib.FileTest.EXISTS)) dark = await this.parseMode(`${path}/dark.txt`);

        return { name, scheme, colours: { light, dark } };
    }

    async parseScheme(name: string): Promise<Scheme> {
        const path = `${this.#schemeDir}/${name}`;

        const flavours = await execAsync(`find ${path}/ -mindepth 1 -maxdepth 1 -type d`);
        if (flavours.trim())
            return {
                name,
                flavours: (
                    await Promise.all(flavours.split("\n").map(f => this.parseFlavour(name, basename(f))))
                ).reduce((acc, f) => ({ ...acc, [f.name]: f }), {} as { [k: string]: Flavour }),
            };

        let light = undefined;
        let dark = undefined;
        if (GLib.file_test(`${path}/light.txt`, GLib.FileTest.EXISTS))
            light = await this.parseMode(`${path}/light.txt`);
        if (GLib.file_test(`${path}/dark.txt`, GLib.FileTest.EXISTS)) dark = await this.parseMode(`${path}/dark.txt`);
        return { name, colours: { light, dark } };
    }

    async update() {
        const schemes = await execAsync(`find ${this.#schemeDir}/ -mindepth 1 -maxdepth 1 -type d`);
        for (const scheme of schemes.split("\n")) {
            const name = basename(scheme);
            this.#map[name] = await this.parseScheme(name);
        }
        this.notify("map");
    }

    constructor() {
        super();

        this.update().catch(console.error);
        monitorDirectory(this.#schemeDir, () => this.update().catch(console.error), true);
    }
}
