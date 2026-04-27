use tauri::{AppHandle, State};
use tauri_plugin_autostart::ManagerExt;

use crate::{
    models::dto::{AutostartStatus, PowerStatus},
    services::power::PowerService,
    services::settings::SettingsService,
    state::AppRuntimeState,
};

#[tauri::command]
pub async fn set_prevent_sleep(
    state: State<'_, AppRuntimeState>,
    enabled: bool,
) -> Result<PowerStatus, String> {
    PowerService::set_prevent_sleep(state.inner(), enabled)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn set_autostart(
    app: AppHandle,
    state: State<'_, AppRuntimeState>,
    enabled: bool,
) -> Result<AutostartStatus, String> {
    let autostart = app.autolaunch();
    if enabled {
        autostart.enable().map_err(|error| error.to_string())?;
    } else {
        autostart.disable().map_err(|error| error.to_string())?;
    }

    let mut stored = SettingsService::get_or_create(&state.inner().db)
        .await
        .map_err(|error| error.to_string())?;
    stored.app.auto_start_enabled = enabled;
    SettingsService::save_app_settings(&state.inner().db, stored.app)
        .await
        .map_err(|error| error.to_string())?;
    Ok(AutostartStatus {
        auto_start_enabled: enabled,
    })
}
