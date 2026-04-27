use tauri::{AppHandle, State};

use crate::{
    models::{
        dto::{LockEvent, LockSession, UnlockResult},
        vo::LockMode,
    },
    services::lock::LockService,
    state::AppRuntimeState,
};

#[tauri::command]
pub async fn lock_screen(
    app: AppHandle,
    state: State<'_, AppRuntimeState>,
    mode: LockMode,
) -> Result<LockSession, String> {
    LockService::lock(&app, state.inner(), mode)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn unlock_screen(
    app: AppHandle,
    state: State<'_, AppRuntimeState>,
    password: String,
) -> Result<UnlockResult, String> {
    LockService::unlock(&app, state.inner(), password)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn get_lock_events(
    state: State<'_, AppRuntimeState>,
    limit: u32,
) -> Result<Vec<LockEvent>, String> {
    LockService::events(state.inner(), limit)
        .await
        .map_err(|error| error.to_string())
}
