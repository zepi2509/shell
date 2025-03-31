import { GLib, monitorFile, readFileAsync, Variable, writeFileAsync } from "astal";
import config from ".";
import { loadStyleAsync } from "../../app";
import defaults from "./defaults";
import types from "./types";

type Settings<T> = { [P in keyof T]: T[P] extends object & { length?: never } ? Settings<T[P]> : Variable<T[P]> };

const CONFIG = `${GLib.get_user_config_dir()}/caelestia/shell.json`;

const isObject = (o: any): o is object => typeof o === "object" && o !== null && !Array.isArray(o);

const isCorrectType = (v: any, type: string | string[] | number[], path: string) => {
    if (Array.isArray(type)) {
        // type is array of valid values
        if (!type.includes(v as never)) {
            console.warn(`Invalid value for ${path}: ${v} != ${type.map(v => `"${v}"`).join(" | ")}`);
            return false;
        }
    } else if (type.startsWith("array of ")) {
        // Array of ...
        if (Array.isArray(v)) {
            // Remove invalid items but always return true
            const arrType = type.slice(9);
            try {
                // Recursively check type
                const type = JSON.parse(arrType);
                const valid = v.filter((item, i) =>
                    Object.entries(type).some(([k, t]) => {
                        if (!item[k]) {
                            console.warn(`Invalid shape for ${path}[${i}]: ${JSON.stringify(item)} != ${arrType}`);
                            return false;
                        }
                        return !isCorrectType(item[k], t as any, `${path}[${i}].${k}`);
                    })
                );
                v.splice(0, v.length, ...valid); // In-place filter
            } catch {
                const valid = v.filter((item, i) => {
                    if (typeof item !== arrType) {
                        console.warn(`Invalid type for ${path}[${i}]: ${typeof item} != ${arrType}`);
                        return false;
                    }
                    return true;
                });
                v.splice(0, v.length, ...valid); // In-place filter
            }
        } else {
            // Type is array but value is not
            console.warn(`Invalid type for ${path}: ${typeof v} != ${type}`);
            return false;
        }
    } else if (typeof v !== type) {
        // Value is not correct type
        console.warn(`Invalid type for ${path}: ${typeof v} != ${type}`);
        return false;
    }

    return true;
};

const deepMerge = <T extends object, U extends object>(a: T, b: U, path = ""): T & U => {
    const merged: { [k: string]: any } = { ...b };
    for (const [k, v] of Object.entries(a)) {
        if (b.hasOwnProperty(k)) {
            const bv = b[k as keyof U];
            if (isObject(v) && isObject(bv)) merged[k] = deepMerge(v, bv, `${path}${k}.`);
            else if (!isCorrectType(bv, types[path + k], path + k)) merged[k] = v;
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

export const initConfig = async () => {
    monitorFile(CONFIG, () => updateConfig().catch(e => console.warn(`Invalid config: ${e}`)));
    await updateConfig().catch(e => console.warn(`Invalid config: ${e}`));
};

export const setConfig = async (path: string, value: any) => {
    const conf = JSON.parse(await readFileAsync(CONFIG));
    let obj = conf;
    for (const p of path.split(".").slice(0, -1)) obj = obj[p];
    obj[path.split(".").at(-1)!] = value;
    await writeFileAsync(CONFIG, JSON.stringify(conf, null, 4));
};
