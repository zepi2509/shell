import type { Monitor } from "@/services/monitors";
import ScreenCorner from "@/widgets/screencorner";
import { bind } from "astal/binding";
import { Astal } from "astal/gtk3";
import { bar } from "config";
import Cairo from "gi://cairo";

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
        setup={self =>
            self.connect("size-allocate", () => self.get_window()?.input_shape_combine_region(new Cairo.Region(), 0, 0))
        }
    >
        <box vertical={bind(bar.vertical)}>
            <ScreenCorner place={bind(bar.vertical).as(v => (v ? "topright" : "bottomleft"))} />
            <box expand />
            <ScreenCorner place="bottomright" />
        </box>
    </window>
);

export const BarScreenCorners = ({ monitor }: { monitor: Monitor }) => (
    <window
        namespace="caelestia-screencorners"
        monitor={monitor.id}
        anchor={bind(bar.vertical).as(
            v =>
                Astal.WindowAnchor.TOP |
                Astal.WindowAnchor.LEFT |
                (v ? Astal.WindowAnchor.BOTTOM : Astal.WindowAnchor.RIGHT)
        )}
        visible={bind(bar.style).as(s => s === "embedded")}
        setup={self =>
            self.connect("size-allocate", () => self.get_window()?.input_shape_combine_region(new Cairo.Region(), 0, 0))
        }
    >
        <box vertical={bind(bar.vertical)}>
            <ScreenCorner place="topleft" />
            <box expand />
            <ScreenCorner place={bind(bar.vertical).as(v => (v ? "bottomleft" : "topright"))} />
        </box>
    </window>
);
