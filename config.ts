import { GLib, monitorFile, readFileAsync, Variable } from "astal";
import { Astal } from "astal/gtk3";
import { loadStyleAsync } from "./app";

const CONFIG = `${GLib.get_user_config_dir()}/caelestia/shell.json`;

const s = <T>(v: T): Variable<T> => Variable(v);

const warn = (e: Error) => console.warn(`Invalid config: ${e}`);

const updateSection = (from: { [k: string]: any }, to: { [k: string]: any }, path: string) => {
    for (const [k, v] of Object.entries(from)) {
        if (to.hasOwnProperty(k)) {
            if (typeof v === "object" && v !== null && !Array.isArray(v)) updateSection(v, to[k], `${path}.${k}`);
            else if (typeof v === typeof to[k].get()) to[k].set(v);
            else console.warn(`Invalid type for ${path}.${k}: ${typeof v} != ${typeof to[k].get()}`);
        } else console.warn(`Unknown config key: ${path}.${k}`);
    }
};

export const updateConfig = async () => {
    const conf: { [k: string]: any } = JSON.parse(await readFileAsync(CONFIG));
    for (const [k, v] of Object.entries(conf)) {
        if (config.hasOwnProperty(k)) updateSection(v, config[k as keyof typeof config], k);
        else console.warn(`Unknown config key: ${k}`);
    }
    loadStyleAsync().catch(console.error);
};

export const initConfig = () => {
    monitorFile(CONFIG, () => updateConfig().catch(warn));
    updateConfig().catch(warn);
};

const config = {
    // Modules
    bar: {
        vertical: s(true),
        modules: {
            osIcon: {
                enabled: s(true),
            },
            activeWindow: {
                enabled: s(true),
            },
            mediaPlaying: {
                enabled: s(true),
            },
            workspaces: {
                enabled: s(true),
                shown: s(5),
            },
            tray: {
                enabled: s(true),
            },
            statusIcons: {
                enabled: s(true),
            },
            pkgUpdates: {
                enabled: s(true),
            },
            notifCount: {
                enabled: s(true),
            },
            battery: {
                enabled: s(true),
            },
            dateTime: {
                enabled: s(true),
                format: s("%d/%m/%y %R"),
                detailedFormat: s("%c"),
            },
            power: {
                enabled: s(true),
            },
        },
    },
    launcher: {
        maxResults: s(15), // Max shown results at one time (i.e. max height of the launcher)
        apps: {
            maxResults: s(30), // Actual max results, -1 for infinite
            pins: s([
                ["zen", "firefox", "waterfox", "google-chrome", "chromium", "brave-browser"],
                ["foot", "alacritty", "kitty", "wezterm"],
                ["thunar", "nemo", "nautilus"],
                ["codium", "code", "clion", "intellij-idea-ultimate-edition"],
                ["spotify-adblock", "spotify", "audacious", "elisa"],
            ]),
        },
        files: {
            maxResults: s(40), // Actual max results, -1 for infinite
            fdOpts: s(["-a", "-t", "f"]), // Options to pass to `fd`
        },
        math: {
            maxResults: s(40), // Actual max results, -1 for infinite
        },
        windows: {
            maxResults: s(-1), // Actual max results, -1 for infinite
            weights: {
                // Weights for fuzzy sort
                title: s(1),
                class: s(1),
                initialTitle: s(0.5),
                initialClass: s(0.5),
            },
        },
        todo: {
            notify: s(true),
        },
    },
    notifpopups: {
        maxPopups: s(-1),
        expire: s(false),
        agoTime: s(true), // Whether to show time in ago format, e.g. 10 mins ago, or raw time, e.g. 10:42
    },
    osds: {
        volume: {
            position: s(Astal.WindowAnchor.RIGHT),
            margin: s(20),
            hideDelay: s(1500),
            showValue: s(true),
        },
        brightness: {
            position: s(Astal.WindowAnchor.LEFT),
            margin: s(20),
            hideDelay: s(1500),
            showValue: s(true),
        },
        lock: {
            spacing: s(5),
            caps: {
                hideDelay: s(1000),
            },
            num: {
                hideDelay: s(1000),
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

export const { bar, launcher, notifpopups, osds, math, updates, weather, cpu, gpu, memory, storage } = config;
