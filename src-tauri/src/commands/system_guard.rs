use tauri::{AppHandle, State};

use crate::{
    models::dto::SystemGuardResult,
    models::vo::LockMode,
    repositories::events::EventsRepository,
    services::lock::LockService,
    services::system_guard::SystemGuardService,
    state::AppRuntimeState,
};

#[tauri::command]
pub async fn block_app(
    state: State<'_, AppRuntimeState>,
    process_name: String,
) -> Result<SystemGuardResult, String> {
    let result = SystemGuardService::block_app(process_name).map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "app_blocked", None, &result.message).await;
    Ok(result)
}

#[tauri::command]
pub async fn set_website_block(
    state: State<'_, AppRuntimeState>,
    domain: String,
    enabled: bool,
) -> Result<SystemGuardResult, String> {
    let result = SystemGuardService::set_website_block(domain, enabled)
        .map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "website_blocked", None, &result.message).await;
    Ok(result)
}

#[tauri::command]
pub async fn lock_system_input(
    state: State<'_, AppRuntimeState>,
    seconds: u32,
) -> Result<SystemGuardResult, String> {
    let result = SystemGuardService::lock_input(seconds).map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "input_locked", None, &result.message).await;
    Ok(result)
}

#[tauri::command]
pub async fn check_usb_key(
    state: State<'_, AppRuntimeState>,
) -> Result<SystemGuardResult, String> {
    let stored = crate::services::settings::SettingsService::get_or_create(&state.inner().db)
        .await
        .map_err(|error| error.to_string())?;
    Ok(SystemGuardService::check_usb_key(stored.app.usb_key_path))
}

#[tauri::command]
pub async fn check_bluetooth_device(
    state: State<'_, AppRuntimeState>,
) -> Result<SystemGuardResult, String> {
    let stored = crate::services::settings::SettingsService::get_or_create(&state.inner().db)
        .await
        .map_err(|error| error.to_string())?;
    SystemGuardService::check_bluetooth_device(stored.app.bluetooth_device_name)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn lock_if_bluetooth_missing(
    app: AppHandle,
    state: State<'_, AppRuntimeState>,
) -> Result<SystemGuardResult, String> {
    let stored = crate::services::settings::SettingsService::get_or_create(&state.inner().db)
        .await
        .map_err(|error| error.to_string())?;
    let result = SystemGuardService::check_bluetooth_device(stored.app.bluetooth_device_name)
        .map_err(|error| error.to_string())?;
    if !result.success {
        let _ = LockService::lock(&app, state.inner(), LockMode::Black).await;
    }
    Ok(result)
}
