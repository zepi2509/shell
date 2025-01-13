import { execAsync, GLib, writeFileAsync } from "astal";
import { App } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";
import Bar from "./modules/bar";
import Launcher from "./modules/launcher";
import NotifPopups from "./modules/notifpopups";
import { PopupWindow } from "./utils/widgets";

const loadStyleAsync = async () => {
    if (!GLib.file_test(`${SRC}/scss/scheme/_index.scss`, GLib.FileTest.EXISTS))
        await writeFileAsync(`${SRC}/scss/scheme/_index.scss`, '@forward "mocha";');
    App.apply_css(await execAsync(`sass ${SRC}/style.scss`), true);
};

App.start({
    instanceName: "caelestia",
    icons: "assets/icons",
    iconTheme: "Adwaita",
    main() {
        loadStyleAsync().catch(console.error);

        <Launcher />;
        <NotifPopups />;
        AstalHyprland.get_default().monitors.forEach(m => <Bar monitor={m} />);

        console.log("Caelestia started");
    },
    requestHandler(request, res) {
        let log = true;

        if (request === "reload css") loadStyleAsync().catch(console.error);
        else if (request.startsWith("toggle")) {
            const window = App.get_window(request.slice(7));
            if (window instanceof PopupWindow) window.toggle();
            else App.toggle_window(request.slice(7));

            log = false;
        } else return res("Unknown command: " + request);

        if (log) console.log(`Request handled: ${request}`);
        res("OK");
    },
});
