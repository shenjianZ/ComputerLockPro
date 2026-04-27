use tauri::State;

use crate::{
    models::dto::{PasswordActionResult, PasswordStatus, SetupPasswordResult},
    repositories::events::EventsRepository,
    services::settings::SettingsService,
    state::AppRuntimeState,
};

#[tauri::command]
pub async fn get_password_status(
    state: State<'_, AppRuntimeState>,
) -> Result<PasswordStatus, String> {
    SettingsService::password_status(&state.inner().db)
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn setup_password(
    state: State<'_, AppRuntimeState>,
    password: String,
) -> Result<SetupPasswordResult, String> {
    let result = SettingsService::setup_password(&state.inner().db, password)
        .await
        .map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "password_setup", None, "已设置锁屏密码").await;
    Ok(result)
}

#[tauri::command]
pub async fn change_password(
    state: State<'_, AppRuntimeState>,
    old_password: String,
    new_password: String,
) -> Result<PasswordActionResult, String> {
    let result = SettingsService::change_password(&state.inner().db, old_password, new_password)
        .await
        .map_err(|error| error.to_string())?;
    if result.success {
        let _ = EventsRepository::add(&state.inner().db, "password_changed", None, "已修改锁屏密码").await;
    }
    Ok(result)
}

#[tauri::command]
pub async fn reset_password_with_recovery_code(
    state: State<'_, AppRuntimeState>,
    recovery_code: String,
    new_password: String,
) -> Result<SetupPasswordResult, String> {
    let result = SettingsService::reset_password_with_recovery_code(
        &state.inner().db,
        recovery_code,
        new_password,
    )
    .await
    .map_err(|error| error.to_string())?;
    let _ = EventsRepository::add(&state.inner().db, "password_reset", None, "已使用恢复码重置密码").await;
    Ok(result)
}
