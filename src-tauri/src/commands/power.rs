use tauri::{AppHandle, State};
use tauri_plugin_autostart::ManagerExt;

use crate::{
    models::dto::{AutostartStatus, PowerScheduleResult, PowerStatus},
    repositories::events::EventsRepository,
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

#[tauri::command]
pub async fn schedule_power_action(
    state: State<'_, AppRuntimeState>,
    action: String,
    delay_minutes: u32,
) -> Result<PowerScheduleResult, String> {
    let result = PowerService::schedule_power_action(action, delay_minutes)
        .map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "power_scheduled", None, &result.message).await;
    Ok(result)
}

#[tauri::command]
pub async fn cancel_power_action(
    state: State<'_, AppRuntimeState>,
) -> Result<PowerScheduleResult, String> {
    let result = PowerService::cancel_power_action().map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "power_cancelled", None, &result.message).await;
    Ok(result)
}
