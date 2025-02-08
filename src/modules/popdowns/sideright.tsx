import SWeather, { type WeatherData } from "@/services/weather";
import { ellipsize } from "@/utils/strings";
import { bindCurrentTime } from "@/utils/system";
import { Calendar as WCal } from "@/utils/widgets";
import PopupWindow from "@/widgets/popupwindow";
import { bind, timeout } from "astal";
import { Astal, Gtk, type Gdk } from "astal/gtk3";

const getHoursFromUpdate = (data: WeatherData, hours: number) => {
    const updateTime = data.location.localtime_epoch;
    const updateHourStart = updateTime - (updateTime % 3600);

    let nextHour = new Date((updateHourStart + hours * 3600) * 1000).getHours();
    if (nextHour >= 24) nextHour -= 24;

    return nextHour;
};

const Time = () => (
    <box className="time">
        <box hexpand halign={Gtk.Align.CENTER}>
            <label label={bindCurrentTime("%I:%M:%S")} />
            <label className="ampm" label={bindCurrentTime("%p", c => (c.get_hour() < 12 ? "AM" : "PM"))} />
        </box>
    </box>
);

const Calendar = () => (
    <box className="calendar">
        <eventbox
            setup={self => {
                self.connect("button-press-event", (_, event: Gdk.Event) => {
                    if (event.get_button()[1] === Astal.MouseButton.MIDDLE) {
                        const now = new Date();
                        const child = self.get_child() as WCal | null;
                        if (!child) return;
                        child.select_month(now.getMonth(), now.getFullYear());
                    }
                });
            }}
        >
            <WCal
                hexpand
                showDetails={false}
                setup={self => {
                    const update = () =>
                        timeout(0.1, () => {
                            const now = new Date();
                            if (self.month === now.getMonth() && self.year === now.getFullYear())
                                self.day = now.getDate();
                            else self.day = 0;
                        });
                    self.connect("month-changed", update);
                    self.connect("next-month", update);
                    self.connect("prev-month", update);
                    self.connect("next-year", update);
                    self.connect("prev-year", update);
                    update();
                }}
            />
        </eventbox>
    </box>
);

const Weather = () => {
    const weather = SWeather.get_default();

    return (
        <box vertical className="weather">
            <centerbox className="current">
                <label
                    halign={Gtk.Align.START}
                    valign={Gtk.Align.CENTER}
                    className="status-icon"
                    label={bind(weather, "icon")}
                />
                <box vertical halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER} className="status">
                    <box halign={Gtk.Align.CENTER} className="temperature">
                        <label label={bind(weather, "temperature")} />
                        <label
                            className={bind(weather, "tempColour").as(c => `temp-icon ${c}`)}
                            label={bind(weather, "tempIcon")}
                        />
                    </box>
                    <label label={bind(weather, "condition").as(c => ellipsize(c, 16))} />
                </box>
                <box vertical halign={Gtk.Align.END} valign={Gtk.Align.CENTER} className="other-data">
                    <label
                        xalign={0}
                        label={bind(weather, "wind").as(w => ` ${w}`)}
                        tooltipText={bind(weather, "wind").as(w => `${w} wind speed`)}
                    />
                    <label
                        xalign={0}
                        label={bind(weather, "rainChance").as(r => ` ${r}`)}
                        tooltipText={bind(weather, "rainChance").as(r => `${r} chance of rain`)}
                    />
                </box>
            </centerbox>
            <box className="separator" />
            <box className="forecast">
                {Array.from({ length: 4 }).map((_, i) => (
                    <box vertical hexpand className="hour">
                        <label
                            label={bind(weather, "raw").as(r => {
                                const hour = getHoursFromUpdate(r, i + 1);
                                return `${hour % 12 || 12}${hour < 12 ? "AM" : "PM"}`;
                            })}
                        />
                        <label
                            className="icon"
                            label={bind(weather, "raw").as(r =>
                                weather.getIcon(weather.forecast[getHoursFromUpdate(r, i + 1)].condition.text)
                            )}
                        />
                        <label
                            label={bind(weather, "raw").as(r =>
                                weather.getTemp(weather.forecast[getHoursFromUpdate(r, i + 1)])
                            )}
                        />
                    </box>
                ))}
            </box>
        </box>
    );
};

export default () => (
    <PopupWindow name="sideright">
        <box vertical className="sideright">
            <Time />
            <Calendar />
            <Weather />
        </box>
    </PopupWindow>
);
