import { execAsync, GLib, writeFileAsync } from "astal";
import { App } from "astal/gtk3";
import AstalHyprland from "gi://AstalHyprland";
import Bar from "./modules/bar";
import NotifPopups from "./modules/notifpopups";

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

        <NotifPopups />;
        AstalHyprland.get_default().monitors.forEach(m => <Bar monitor={m} />);

        console.log("Caelestia started");
    },
    requestHandler(request, res) {
        if (request === "reload css") loadStyleAsync().catch(console.error);
        else return res("Unknown command: " + request);
        console.log(`Request handled: ${request}`);
        res("OK");
    },
});
