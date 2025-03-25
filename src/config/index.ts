import defaults from "./defaults";
import { convertSettings } from "./funcs";

const config = convertSettings(defaults);

export const {
    style,
    bar,
    launcher,
    notifpopups,
    osds,
    sideleft,
    math,
    updates,
    weather,
    cpu,
    gpu,
    memory,
    storage,
    wallpapers,
    calendar,
} = config;
export default config;
