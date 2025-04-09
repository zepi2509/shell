import { notify } from "@/utils/system";
import { execAsync, GLib, GObject, property, readFileAsync, register, writeFileAsync } from "astal";
import { news as config } from "config";

export interface IArticle {
    title: string;
    link: string;
    keywords: string[] | null;
    creator: string[] | null;
    description: string | null;
    pubDate: string;
    source_name: string;
    category: string[];
}

@register({ GTypeName: "News" })
export default class News extends GObject.Object {
    static instance: News;
    static get_default() {
        if (!this.instance) this.instance = new News();

        return this.instance;
    }

    readonly #cachePath = `${CACHE}/news.json`;
    #notified = false;

    #loading: boolean = false;
    #articles: IArticle[] = [];
    #categories: { [category: string]: IArticle[] } = {};

    @property(Boolean)
    get loading() {
        return this.#loading;
    }

    @property(Object)
    get articles() {
        return this.#articles;
    }

    @property(Object)
    get categories() {
        return this.#categories;
    }

    async getNews() {
        if (!config.apiKey.get()) {
            if (!this.#notified) {
                notify({
                    summary: "A newsdata.io API key is required",
                    body: "You can get one by creating an account at https://newsdata.io",
                    icon: "dialog-warning-symbolic",
                    urgency: "critical",
                    actions: {
                        "Get API key": () => execAsync("app2unit -O -- https://newsdata.io").catch(console.error),
                    },
                });
                this.#notified = true;
            }
            return;
        }

        this.#loading = true;
        this.notify("loading");

        let countries = config.countries.get().join(",");
        const categories = config.categories.get().join(",");
        const languages = config.languages.get().join(",");
        const domains = config.domains.get().join(",");
        const timezone = config.timezone.get();

        if (countries.includes("current")) {
            const out = JSON.parse(await execAsync("curl ipinfo.io")).country.toLowerCase();
            countries = countries.replace("current", out);
        }

        let args = "removeduplicate=1&prioritydomain=top";
        if (countries) args += `&country=${countries}`;
        if (categories) args += `&category=${categories}`;
        if (languages) args += `&language=${languages}`;
        if (domains) args += `&domain=${domains}`;
        if (timezone) args += `&timezone=${timezone}`;

        const url = `https://newsdata.io/api/1/latest?apikey=${config.apiKey.get()}&${args}`;
        try {
            const res = JSON.parse(await execAsync(["curl", url]));
            if (res.status !== "success") throw new Error(`Failed to get news: ${res.results.message}`);

            this.#articles = [...res.results];

            let page = res.nextPage;
            for (let i = 1; i < config.pages.get(); i++) {
                const res = JSON.parse(await execAsync(["curl", `${url}&page=${page}`]));
                if (res.status !== "success") throw new Error(`Failed to get news: ${res.results.message}`);
                this.#articles.push(...res.results);
                page = res.nextPage;
            }

            writeFileAsync(this.#cachePath, JSON.stringify(this.#articles)).catch(console.error);
        } catch (e) {
            console.error(e);

            if (GLib.file_test(this.#cachePath, GLib.FileTest.EXISTS))
                this.#articles = JSON.parse(await readFileAsync(this.#cachePath));
        }
        this.notify("articles");

        this.updateCategories();

        this.#loading = false;
        this.notify("loading");
    }

    updateCategories() {
        this.#categories = {};
        for (const article of this.#articles) {
            for (const category of article.category) {
                if (!this.#categories.hasOwnProperty(category)) this.#categories[category] = [];
                this.#categories[category].push(article);
            }
        }
        this.notify("categories");
    }

    constructor() {
        super();

        if (GLib.file_test(this.#cachePath, GLib.FileTest.EXISTS))
            readFileAsync(this.#cachePath)
                .then(data => {
                    this.#articles = JSON.parse(data);
                    this.notify("articles");
                    this.updateCategories();
                })
                .catch(console.error);

        this.getNews().catch(console.error);
        config.apiKey.subscribe(() => this.getNews().catch(console.error));
        config.countries.subscribe(() => this.getNews().catch(console.error));
        config.categories.subscribe(() => this.getNews().catch(console.error));
        config.languages.subscribe(() => this.getNews().catch(console.error));
        config.domains.subscribe(() => this.getNews().catch(console.error));
        config.timezone.subscribe(() => this.getNews().catch(console.error));
        config.pages.subscribe(() => this.getNews().catch(console.error));
    }
}
