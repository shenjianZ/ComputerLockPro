use tauri::{AppHandle, State};

use crate::{
    models::{
        dto::{LockEvent, LockSession, UnlockResult},
        vo::LockMode,
    },
    services::lock::LockService,
    repositories::events::EventsRepository,
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
pub async fn unlock_with_usb_key(
    app: AppHandle,
    state: State<'_, AppRuntimeState>,
) -> Result<UnlockResult, String> {
    LockService::unlock_with_usb_key(&app, state.inner())
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

#[tauri::command]
pub async fn query_lock_events(
    state: State<'_, AppRuntimeState>,
    event_type: Option<String>,
    limit: u32,
) -> Result<Vec<LockEvent>, String> {
    EventsRepository::list_filtered(&state.inner().db, event_type, limit)
        .await
        .map(|events| {
            events
                .into_iter()
                .map(|event| LockEvent {
                    id: event.id,
                    event_type: event.event_type,
                    mode: event.mode,
                    message: event.message,
                    created_at: event.created_at,
                })
                .collect()
        })
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn clear_lock_events(state: State<'_, AppRuntimeState>) -> Result<(), String> {
    EventsRepository::clear(&state.inner().db)
        .await
        .map_err(|error| error.to_string())?;
    EventsRepository::add(&state.inner().db, "logs_cleared", None, "已清空安全日志")
        .await
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn export_lock_events(
    state: State<'_, AppRuntimeState>,
    format: String,
) -> Result<String, String> {
    let events = EventsRepository::list(&state.inner().db, 500)
        .await
        .map_err(|error| error.to_string())?;
    if format.eq_ignore_ascii_case("csv") {
        let mut csv = "id,eventType,mode,message,createdAt\n".to_string();
        for event in events {
            let mode_str = event.mode.as_ref().map_or("", |m| match m {
                LockMode::Transparent => "Transparent",
                LockMode::Black => "Black",
                LockMode::Blur => "Blur",
                LockMode::Wallpaper => "Wallpaper",
                LockMode::Clock => "Clock",
            });
            let message = event.message.replace('"', "\"\"");
            csv.push_str(&format!(
                "{},\"{}\",\"{}\",\"{}\",{}\n",
                event.id,
                event.event_type,
                mode_str,
                message,
                event.created_at.to_rfc3339()
            ));
        }
        return Ok(csv);
    }

    serde_json::to_string_pretty(&events).map_err(|error| error.to_string())
}
