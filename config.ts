import { Astal } from "astal/gtk3";

// Modules
export const bar = {
    wsPerGroup: 10,
    dateTimeFormat: "%d/%m/%y %R",
};

export const launcher = {
    maxResults: 15,
    fdOpts: ["-a", "-t", "f"],
    pins: [
        ["firefox", "waterfox", "google-chrome", "chromium", "brave-browser", "vivaldi-stable", "vivaldi-snapshot"],
        ["foot", "alacritty", "kitty", "wezterm"],
        ["thunar", "nemo", "nautilus"],
        ["codium", "code", "clion", "intellij-idea-ultimate-edition"],
        ["spotify-adblock", "spotify", "audacious", "elisa"],
    ],
    windows: {
        // Weights for fuzzysort
        title: 1,
        class: 1,
        initialTitle: 0.5,
        initialClass: 0.5,
    },
};

export const notifpopups = {
    maxPopups: -1,
    expire: false,
};

export const osds = {
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
};

// Services
export const updates = {
    interval: 900000,
};
