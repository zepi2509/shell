import type AstalHyprland from "gi://AstalHyprland";

export type Address = `0x${string}`;

export interface Client {
    address: Address;
    mapped: boolean;
    hidden: boolean;
    at: [number, number];
    size: [number, number];
    workspace: {
        id: number;
        name: string;
    };
    floating: boolean;
    pseudo: boolean;
    monitor: number;
    class: string;
    title: string;
    initialClass: string;
    initialTitle: string;
    pid: number;
    xwayland: boolean;
    pinned: boolean;
    fullscreen: AstalHyprland.Fullscreen;
    fullscreenClient: AstalHyprland.Fullscreen;
    grouped: Address[];
    tags: string[];
    swallowing: string;
    focusHistoryID: number;
    inhibitingIdle: boolean;
}
