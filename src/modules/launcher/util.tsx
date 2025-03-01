import { FlowBox } from "@/utils/widgets";
import type { Variable } from "astal";
import { App, Gtk } from "astal/gtk3";

export type Mode = "apps" | "files" | "math" | "windows";

export interface LauncherContent {
    updateContent(search: string): void;
    handleActivate(search: string): void;
}

export const close = () => App.get_window("launcher")?.hide();

export const limitLength = <T,>(arr: T[], cfg: { maxResults: Variable<number> }) =>
    cfg.maxResults.get() > 0 && arr.length > cfg.maxResults.get() ? arr.slice(0, cfg.maxResults.get()) : arr;

export const ContentBox = () => (
    <FlowBox homogeneous valign={Gtk.Align.START} minChildrenPerLine={2} maxChildrenPerLine={2} />
);
