use tauri::State;

use crate::{
    models::dto::AppSettings,
    services::settings::SettingsService,
    state::AppRuntimeState,
};

#[tauri::command]
pub async fn get_settings(
    state: State<'_, AppRuntimeState>,
) -> Result<AppSettings, String> {
    SettingsService::get_or_create(&state.inner().db)
        .await
        .map(|stored| stored.app)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, AppRuntimeState>,
    settings: AppSettings,
) -> Result<AppSettings, String> {
    SettingsService::save_app_settings(&state.inner().db, settings)
        .await
        .map_err(|error| error.to_string())
}
