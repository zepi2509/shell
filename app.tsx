import Bar from "@/modules/bar";
import Launcher from "@/modules/launcher";
import NotifPopups from "@/modules/notifpopups";
import Osds from "@/modules/osds";
import Popdowns from "@/modules/popdowns";
import Session from "@/modules/session";
import Monitors from "@/services/monitors";
import Players from "@/services/players";
import type PopupWindow from "@/widgets/popupwindow";
import { execAsync, GLib, monitorFile, readFileAsync, writeFileAsync } from "astal";
import { App } from "astal/gtk3";

const loadStyleAsync = async () => {
    let schemeColours;
    if (GLib.file_test(`${CACHE}/scheme/current.txt`, GLib.FileTest.EXISTS)) {
        const currentScheme = await readFileAsync(`${CACHE}/scheme/current.txt`);
        schemeColours = currentScheme
            .split("\n")
            .map(l => {
                const [name, hex] = l.split(" ");
                return `$${name}: #${hex};`;
            })
            .join("\n");
    } else schemeColours = await readFileAsync(`${SRC}/scss/scheme/_default.scss`);
    await writeFileAsync(`${SRC}/scss/scheme/_index.scss`, schemeColours);
    App.apply_css(await execAsync(`sass ${SRC}/style.scss`), true);
};

App.start({
    instanceName: "caelestia",
    icons: "assets/icons",
    main() {
        const now = Date.now();
        loadStyleAsync().catch(console.error);
        monitorFile(`${CACHE}/scheme/current.txt`, () => loadStyleAsync().catch(console.error));

        <Launcher />;
        <NotifPopups />;
        <Osds />;
        <Session />;
        Monitors.get_default().forEach(m => <Bar monitor={m} />);
        <Popdowns />;

        console.log(`Caelestia started in ${Date.now() - now}ms`);
    },
    requestHandler(request, res) {
        if (request === "quit") App.quit();
        else if (request === "reload-css") loadStyleAsync().catch(console.error);
        else if (request.startsWith("show")) App.get_window(request.split(" ")[1])?.show();
        else if (request === "toggle sideleft") {
            const window = App.get_window("sideleft") as PopupWindow | null;
            if (window) {
                if (window.visible) window.hide();
                else window.popup_at_corner("top left");
            }
        } else if (request === "toggle sideright") {
            const window = App.get_window("sideright") as PopupWindow | null;
            if (window) {
                if (window.visible) window.hide();
                else window.popup_at_corner("top right");
            }
        } else if (request === "media play-pause") Players.get_default().lastPlayer?.play_pause();
        else if (request === "media next") Players.get_default().lastPlayer?.next();
        else if (request === "media previous") Players.get_default().lastPlayer?.previous();
        else if (request === "media stop") Players.get_default().lastPlayer?.stop();
        else if (request.startsWith("brightness")) {
            const value = request.split(" ")[1];
            const num = parseFloat(value) / (value.includes("%") ? 100 : 1);
            if (isNaN(num)) return res("Syntax: brightness <value>[%][+ | -]");
            if (value.includes("+")) Monitors.get_default().active.brightness += num;
            else if (value.includes("-")) Monitors.get_default().active.brightness -= num;
            else Monitors.get_default().active.brightness = num;
        } else return res("Unknown command: " + request);

        console.log(`Request handled: ${request}`);
        res("OK");
    },
});
