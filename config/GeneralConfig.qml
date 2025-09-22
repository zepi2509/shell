import Quickshell.Io

JsonObject {
    property Apps apps: Apps {}
    property Idle idle: Idle {}
    property Battery battery: Battery {}

    component Apps: JsonObject {
        property list<string> terminal: ["foot"]
        property list<string> audio: ["pavucontrol"]
        property list<string> playback: ["mpv"]
        property list<string> explorer: ["thunar"]
    }

    component Idle: JsonObject {
        property bool inhibitWhenAudio: true
        property real lockTimeout: 180 // 3 mins
        property real dpmsTimeout: 300 // 5 mins
        property real sleepTimeout: 600 // 10 mins
    }

    component Battery: JsonObject {
        property list<var> warnLevels: [
            {
                level: 20,
                title: qsTr("Low battery"),
                message: qsTr("You might want to plug in a charger"),
                icon: "battery_android_frame_2"
            },
            {
                level: 10,
                title: qsTr("Did you see the previous message?"),
                message: qsTr("You should probably plug in a charger <b>now</b>"),
                icon: "battery_android_frame_1"
            },
            {
                level: 5,
                title: qsTr("Critical battery level"),
                message: qsTr("PLUG THE CHARGER RIGHT NOW!!"),
                icon: "battery_android_alert",
                critical: true
            },
        ]
        property int criticalLevel: 3
    }
}
