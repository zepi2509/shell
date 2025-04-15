import { Astal } from "astal/gtk3";

export default {
    style: {
        transparency: "normal", // One of "off", "low", "normal", "high"
        borders: true,
        vibrant: false, // Extra saturation
    },
    config: {
        notifyOnError: true,
    },
    // Modules
    bar: {
        vertical: true,
        style: "gaps", // One of "gaps", "panel", "embedded"
        layout: {
            type: "centerbox", // One of "centerbox", "flowbox"
            centerbox: {
                start: ["osIcon", "activeWindow", "mediaPlaying", "brightnessSpacer"],
                center: ["workspaces"],
                end: [
                    "volumeSpacer",
                    "tray",
                    "statusIcons",
                    "pkgUpdates",
                    "notifCount",
                    "battery",
                    "dateTime",
                    "power",
                ],
            },
            flowbox: [
                "osIcon",
                "workspaces",
                "brightnessSpacer",
                "activeWindow",
                "volumeSpacer",
                "dateTime",
                "tray",
                "battery",
                "statusIcons",
                "notifCount",
                "power",
            ],
        },
        modules: {
            workspaces: {
                shown: 5,
                showLabels: false,
                labels: ["󰮯", "󰮯", "󰮯", "󰮯", "󰮯"],
                xalign: -1,
                showWindows: false,
            },
            dateTime: {
                format: "%d/%m/%y %R",
                detailedFormat: "%c",
            },
        },
    },
    launcher: {
        style: "lines", // One of "lines", "round"
        actionPrefix: ">", // Prefix for launcher actions
        apps: {
            maxResults: 30, // Actual max results, -1 for infinite
        },
        files: {
            maxResults: 40, // Actual max results, -1 for infinite
            fdOpts: ["-a", "-t", "f"], // Options to pass to `fd`
            shortenThreshold: 30, // Threshold to shorten paths in characters
        },
        math: {
            maxResults: 40, // Actual max results, -1 for infinite
        },
        todo: {
            notify: true,
        },
        wallpaper: {
            maxResults: 20, // Actual max results, -1 for infinite
            showAllEmpty: true, // Show all wallpapers when search is empty
            style: "medium", // One of "compact", "medium", "large"
        },
        disabledActions: ["logout", "shutdown", "reboot", "hibernate"], // Actions to hide, see launcher/actions.tsx for available actions
    },
    notifpopups: {
        maxPopups: -1,
        expire: false,
        agoTime: true, // Whether to show time in ago format, e.g. 10 mins ago, or raw time, e.g. 10:42
    },
    osds: {
        volume: {
            position: Astal.WindowAnchor.RIGHT, // Top = 2, Right = 4, Left = 8, Bottom = 16
            margin: 20,
            hideDelay: 1500,
            showValue: true,
        },
        brightness: {
            position: Astal.WindowAnchor.LEFT, // Top = 2, Right = 4, Left = 8, Bottom = 16
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
    sidebar: {
        showOnStartup: false,
        modules: {
            headlines: {
                enabled: true,
            },
        },
    },
    navbar: {
        persistent: false, // Whether to show all the time or only on hover
        appearWidth: 10, // The width in pixels of the hover area for the navbar to show up
        showLabels: false, // Whether to show labels for active buttons
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
        apiKey: "", // An API key from https://weatherapi.com for accessing weather data
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
    wallpapers: {
        paths: [
            {
                recursive: true, // Whether to search recursively
                path: "~/Pictures/Wallpapers", // Path to search
                threshold: 0.8, // The threshold to filter wallpapers by size (e.g. 0.8 means wallpaper must be at least 80% of the screen size), 0 to disable
            },
        ],
    },
    calendar: {
        webcals: [] as string[], // An array of urls to ICS files which you can curl
        upcomingDays: 7, // Number of days which count as upcoming
        notify: true,
    },
    thumbnailer: {
        maxAttempts: 5,
        timeBetweenAttempts: 300,
        defaults: {
            width: 100,
            height: 100,
            exact: true,
        },
    },
    news: {
        apiKey: "", // An API key from https://newsdata.io for accessing news
        countries: ["current"], // A list of country codes or "current" for the current location
        categories: ["business", "top", "technology", "world"], // A list of news categories to filter by
        languages: ["en"], // A list of languages codes to filter by
        domains: [] as string[], // A list of news domains to pull from, see https://newsdata.io/news-sources for available domains
        excludeDomains: ["news.google.com"], // A list of news domains to exclude, e.g. bbc.co.uk
        timezone: "", // A timezone to filter by, e.g. "America/New_York", see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
        pages: 3, // Number of pages to pull (each page is 10 articles)
    },
};
