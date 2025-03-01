import { GLib, monitorFile, readFileAsync, Variable } from "astal";
import { Astal } from "astal/gtk3";
import { loadStyleAsync } from "./app";

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

const convertSettings = <T extends object>(obj: T): Settings<T> =>
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
    updateSection(deepMerge(DEFAULTS, JSON.parse(await readFileAsync(CONFIG))), config);
    loadStyleAsync().catch(console.error);
};

export const initConfig = () => {
    monitorFile(CONFIG, () => updateConfig().catch(e => console.warn(`Invalid config: ${e}`)));
    updateConfig().catch(e => console.warn(`Invalid config: ${e}`));
};

const DEFAULTS = {
    // Modules
    bar: {
        vertical: true,
        modules: {
            osIcon: {
                enabled: true,
            },
            activeWindow: {
                enabled: true,
            },
            mediaPlaying: {
                enabled: true,
            },
            workspaces: {
                enabled: true,
                shown: 5,
            },
            tray: {
                enabled: true,
            },
            statusIcons: {
                enabled: true,
            },
            pkgUpdates: {
                enabled: true,
            },
            notifCount: {
                enabled: true,
            },
            battery: {
                enabled: true,
            },
            dateTime: {
                enabled: true,
                format: "%d/%m/%y %R",
                detailedFormat: "%c",
            },
            power: {
                enabled: true,
            },
        },
    },
    launcher: {
        actionPrefix: ">", // Prefix for launcher actions
        apps: {
            maxResults: 30, // Actual max results, -1 for infinite
            pins: [
                ["zen", "firefox", "waterfox", "google-chrome", "chromium", "brave-browser"],
                ["foot", "alacritty", "kitty", "wezterm"],
                ["thunar", "nemo", "nautilus"],
                ["codium", "code", "clion", "intellij-idea-ultimate-edition"],
                ["spotify-adblock", "spotify", "audacious", "elisa"],
            ],
        },
        files: {
            maxResults: 40, // Actual max results, -1 for infinite
            fdOpts: ["-a", "-t", "f"], // Options to pass to `fd`
            shortenThreshold: 30, // Threshold to shorten paths in characters
        },
        math: {
            maxResults: 40, // Actual max results, -1 for infinite
        },
        windows: {
            maxResults: -1, // Actual max results, -1 for infinite
            weights: {
                // Weights for fuzzy sort
                title: 1,
                class: 1,
                initialTitle: 0.5,
                initialClass: 0.5,
            },
        },
        todo: {
            notify: true,
        },
    },
    notifpopups: {
        maxPopups: -1,
        expire: false,
        agoTime: true, // Whether to show time in ago format, e.g. 10 mins ago, or raw time, e.g. 10:42
    },
    osds: {
        volume: {
            position: Astal.WindowAnchor.RIGHT,
            margin: 20,
            hideDelay: 1500,
            showValue: true,
        },
        brightness: {
            position: Astal.WindowAnchor.LEFT,
            margin: 20,
            hideDelay: 1500,
            showValue: true,
        },
        lock: {
            spacing: 5,
            caps: {
                hideDelay: 1000,
            },
            num: {
                hideDelay: 1000,
            },
        },
    },
    sideleft: {
        directories: {
            left: {
                top: "󰉍  Downloads",

                middle: "󱧶  Documents",
                bottom: "󱍙  Music",
            },
            right: {
                top: "󰉏  Pictures",
                middle: "󰉏  Videos",
                bottom: "󱂵  Home",
            },
        },
    },
    // Services
    math: {
        maxHistory: 100,
    },
    updates: {
        interval: 900000,
    },
    weather: {
        interval: 600000,
        key: "assets/weather-api-key.txt", // Path to file containing api key relative to the base directory. To get a key, visit https://weatherapi.com/
        location: "", // Location as a string or empty to autodetect
        imperial: false,
    },
    cpu: {
        interval: 2000,
    },
    gpu: {
        interval: 2000,
    },
    memory: {
        interval: 5000,
    },
    storage: {
        interval: 5000,
    },
};

const config = convertSettings(DEFAULTS);

export const { bar, launcher, notifpopups, osds, sideleft, math, updates, weather, cpu, gpu, memory, storage } = config;
