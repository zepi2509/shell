import { GLib, monitorFile, readFileAsync, Variable } from "astal";
import config from ".";
import { loadStyleAsync } from "../../app";
import defaults from "./defaults";

type Settings<T> = { [P in keyof T]: T[P] extends object & { length?: never } ? Settings<T[P]> : Variable<T[P]> };

const CONFIG = `${GLib.get_user_config_dir()}/caelestia/shell.json`;

const isObject = (o: any) => typeof o === "object" && o !== null && !Array.isArray(o);

const deepMerge = <T extends object, U extends object>(a: T, b: U, path = ""): T & U => {
    const merged: { [k: string]: any } = { ...b };
    for (const [k, v] of Object.entries(a)) {
        if (b.hasOwnProperty(k)) {
            const bv = b[k as keyof U];
            if (isObject(v) && isObject(bv)) merged[k] = deepMerge(v, bv as object, `${path}${k}.`);
            else if (typeof v !== typeof bv) {
                console.warn(`Invalid type for ${path}${k}: ${typeof v} != ${typeof bv}`);
                merged[k] = v;
            }
        } else merged[k] = v;
    }
    return merged as any;
};

export const convertSettings = <T extends object>(obj: T): Settings<T> =>
    Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, isObject(v) ? convertSettings(v) : Variable(v)])) as any;

const updateSection = (from: { [k: string]: any }, to: { [k: string]: any }, path = "") => {
    for (const [k, v] of Object.entries(from)) {
        if (to.hasOwnProperty(k)) {
            if (isObject(v)) updateSection(v, to[k], `${path}${k}.`);
            else to[k].set(v);
        } else console.warn(`Unknown config key: ${path}${k}`);
    }
};

export const updateConfig = async () => {
    updateSection(deepMerge(defaults, JSON.parse(await readFileAsync(CONFIG))), config);
    loadStyleAsync().catch(console.error);
};

export const initConfig = () => {
    monitorFile(CONFIG, () => updateConfig().catch(e => console.warn(`Invalid config: ${e}`)));
    updateConfig().catch(e => console.warn(`Invalid config: ${e}`));
};
