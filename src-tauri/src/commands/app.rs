use tauri::State;

use crate::{models::dto::AppStatus, services::app::AppService, state::AppRuntimeState};

#[tauri::command]
pub async fn get_app_status(
    state: State<'_, AppRuntimeState>,
) -> Result<AppStatus, String> {
    AppService::status(state.inner())
        .await
        .map_err(|error| error.to_string())
}
