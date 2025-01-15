import { execAsync, GLib, writeFileAsync } from "astal";
import { App } from "astal/gtk3";
import Bar from "./modules/bar";
import Launcher from "./modules/launcher";
import NotifPopups from "./modules/notifpopups";
import Osds from "./modules/osds";
import Monitors from "./services/monitors";
import Players from "./services/players";

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
        Monitors.get_default().forEach(m => {
            <Osds monitor={m} />;
            <Bar monitor={m} />;
        });

        console.log("Caelestia started");
    },
    requestHandler(request, res) {
        if (request === "reload css") loadStyleAsync().catch(console.error);
        else if (request === "media play pause") Players.get_default().lastPlayer?.play_pause();
        else if (request === "media next") Players.get_default().lastPlayer?.next();
        else if (request === "media previous") Players.get_default().lastPlayer?.previous();
        else if (request === "media stop") Players.get_default().lastPlayer?.stop();
        else if (request === "brightness up") Monitors.get_default().active.brightness += 0.1;
        else if (request === "brightness down") Monitors.get_default().active.brightness -= 0.1;
        else return res("Unknown command: " + request);

        console.log(`Request handled: ${request}`);
        res("OK");
    },
});
