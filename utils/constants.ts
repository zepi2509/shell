import { exec, GLib } from "astal";

export const CACHE_DIR = GLib.get_user_cache_dir() + "/caelestia";
exec(`mkdir -p '${CACHE_DIR}'`);
