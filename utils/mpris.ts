import { GLib } from "astal";
import AstalMpris from "gi://AstalMpris";

const hasPlasmaIntegration = GLib.find_program_in_path("plasma-browser-integration-host") !== null;

export const isRealPlayer = (player?: AstalMpris.Player) =>
    player !== undefined &&
    // Player closed
    player.identity !== null &&
    // Remove unecessary native buses from browsers if there's plasma integration
    !(hasPlasmaIntegration && player.busName.startsWith("org.mpris.MediaPlayer2.firefox")) &&
    !(hasPlasmaIntegration && player.busName.startsWith("org.mpris.MediaPlayer2.chromium")) &&
    // playerctld just copies other buses and we don't need duplicates
    !player.busName.startsWith("org.mpris.MediaPlayer2.playerctld") &&
    // Non-instance mpd bus
    !(player.busName.endsWith(".mpd") && !player.busName.endsWith("MediaPlayer2.mpd"));
