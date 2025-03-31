import type { Monitor } from "@/services/monitors";
import ScreenCorner from "@/widgets/screencorner";
import { bind } from "astal/binding";
import { Astal } from "astal/gtk3";
import { bar } from "config";

export default ({ monitor }: { monitor: Monitor }) => (
    <window
        namespace="caelestia-screencorners"
        monitor={monitor.id}
        anchor={bind(bar.vertical).as(
            v =>
                Astal.WindowAnchor.BOTTOM |
                Astal.WindowAnchor.RIGHT |
                (v ? Astal.WindowAnchor.TOP : Astal.WindowAnchor.LEFT)
        )}
    >
        <box vertical={bind(bar.vertical)}>
            <ScreenCorner place={bind(bar.vertical).as(v => (v ? "topright" : "bottomleft"))} />
            <box expand />
            <ScreenCorner place="bottomright" />
        </box>
    </window>
);
