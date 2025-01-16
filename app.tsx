import { execAsync, GLib, writeFileAsync } from "astal";
import { App } from "astal/gtk3";
import Bar from "./src/modules/bar";
import Launcher from "./src/modules/launcher";
import Notifications from "./src/modules/notifications";
import NotifPopups from "./src/modules/notifpopups";
import Osds from "./src/modules/osds";
import Updates from "./src/modules/updates";
import Monitors from "./src/services/monitors";
import Players from "./src/services/players";

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
        <Osds />;
        Monitors.get_default().forEach(m => <Bar monitor={m} />);
        <Notifications />;
        <Updates />;

        console.log("Caelestia started");
    },
    requestHandler(request, res) {
        if (request === "reload css") loadStyleAsync().catch(console.error);
        else if (request.startsWith("show")) App.get_window(request.split(" ")[1])?.show();
        else if (request === "media play pause") Players.get_default().lastPlayer?.play_pause();
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
