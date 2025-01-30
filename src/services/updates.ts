import { execAsync, GLib, GObject, property, readFileAsync, register, writeFileAsync } from "astal";
import { updates as config } from "config";

export interface Update {
    full: string;
    name: string;
    description: string;
    url: string;
    version: {
        old: string;
        new: string;
    };
}

export interface Repo {
    repo?: string[];
    updates: Update[];
    icon: string;
    name: string;
}

export interface Data {
    cached?: boolean;
    repos: Repo[];
    errors: string[];
}

@register({ GTypeName: "Updates" })
export default class Updates extends GObject.Object {
    static instance: Updates;
    static get_default() {
        if (!this.instance) this.instance = new Updates();

        return this.instance;
    }

    readonly #cachePath = `${CACHE}/updates.txt`;

    #timeout?: GLib.Source;
    #loading = false;
    #data: Data = { cached: true, repos: [], errors: [] };

    @property(Boolean)
    get loading() {
        return this.#loading;
    }

    @property(Object)
    get updateData() {
        return this.#data;
    }

    @property(Object)
    get list() {
        return this.#data.repos.map(r => r.updates).flat();
    }

    @property(Number)
    get numUpdates() {
        return this.#data.repos.reduce((acc, repo) => acc + repo.updates.length, 0);
    }

    async #updateFromCache() {
        this.#data = JSON.parse(await readFileAsync(this.#cachePath));
        this.notify("update-data");
        this.notify("list");
        this.notify("num-updates");
    }

    async getRepo(repo: string) {
        return (await execAsync(`bash -c "comm -12 <(pacman -Qq | sort) <(pacman -Slq '${repo}' | sort)"`)).split("\n");
    }

    async constructUpdate(update: string) {
        const info = await execAsync(`pacman -Qi ${update.split(" ")[0]}`);
        return info.split("\n").reduce(
            (acc, line) => {
                let [key, value] = line.split(" : ");
                key = key.trim().toLowerCase();
                if (key === "name" || key === "description" || key === "url") acc[key] = value.trim();
                else if (key === "version") acc.version.old = value.trim();
                return acc;
            },
            { version: { new: update.split("->")[1].trim() } } as Update
        );
    }

    getUpdates() {
        // Return if already getting updates
        if (this.#loading) return;

        this.#loading = true;
        this.notify("loading");

        // Get new updates
        Promise.allSettled([execAsync("checkupdates"), execAsync("yay -Qua")])
            .then(async ([pacman, yay]) => {
                const data: Data = { repos: [], errors: [] };

                // Pacman updates (checkupdates)
                if (pacman.status === "fulfilled") {
                    const repos: Repo[] = [
                        { repo: await this.getRepo("core"), updates: [], icon: "hub", name: "Core repository" },
                        {
                            repo: await this.getRepo("extra"),
                            updates: [],
                            icon: "add_circle",
                            name: "Extra repository",
                        },
                        {
                            repo: await this.getRepo("multilib"),
                            updates: [],
                            icon: "account_tree",
                            name: "Multilib repository",
                        },
                    ];

                    for (const update of pacman.value.split("\n")) {
                        const pkg = update.split(" ")[0];
                        for (const repo of repos)
                            if (repo.repo?.includes(pkg)) repo.updates.push(await this.constructUpdate(update));
                    }

                    for (const repo of repos) if (repo.updates.length > 0) data.repos.push(repo);
                }

                // AUR and devel updates (yay -Qua)
                if (yay.status === "fulfilled") {
                    const aur: Repo = { updates: [], icon: "deployed_code_account", name: "AUR" };

                    for (const update of yay.value.split("\n")) {
                        if (/^\s*->/.test(update)) data.errors.push(update); // Error
                        else aur.updates.push(await this.constructUpdate(update));
                    }

                    if (aur.updates.length > 0) data.repos.push(aur);
                }

                if (data.errors.length > 0 && data.repos.length === 0) {
                    this.#updateFromCache().catch(console.error);
                } else {
                    // Cache and set
                    writeFileAsync(this.#cachePath, JSON.stringify({ cached: true, ...data })).catch(console.error);
                    this.#data = data;
                    this.notify("update-data");
                    this.notify("list");
                    this.notify("num-updates");
                }

                this.#loading = false;
                this.notify("loading");

                this.#timeout?.destroy();
                this.#timeout = setTimeout(() => this.getUpdates(), config.interval);
            })
            .catch(console.error);
    }

    constructor() {
        super();

        // Initial update from cache, if fail then write valid data to cache so future reads don't fail
        this.#updateFromCache().catch(() =>
            writeFileAsync(this.#cachePath, JSON.stringify(this.#data)).catch(console.error)
        );
        this.getUpdates();
    }
}
