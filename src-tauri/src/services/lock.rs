use anyhow::Result;
use chrono::Utc;
use tauri::{AppHandle, Manager};

use crate::{
    models::{
        dto::{LockEvent, LockSession, UnlockResult},
        vo::LockMode,
    },
    repositories::events::EventsRepository,
    services::{password::PasswordService, settings::SettingsService},
    state::AppRuntimeState,
    windows,
};

pub struct LockService;

impl LockService {
    pub async fn lock(app: &AppHandle, state: &AppRuntimeState, mode: LockMode) -> Result<LockSession> {
        let mut session = LockSession {
            session_id: Utc::now().timestamp_millis().to_string(),
            mode: mode.clone(),
            started_at: Utc::now(),
            display_count: 1,
        };
        *state.lock_session.write().await = Some(session.clone());
        session.display_count = windows::lock::show_lock_windows(app, &mode)?;
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }
        *state.lock_session.write().await = Some(session.clone());
        EventsRepository::add(&state.db, "locked", Some(&mode), "锁屏已启动").await?;
        Ok(session)
    }

    pub async fn unlock(
        app: &AppHandle,
        state: &AppRuntimeState,
        password: String,
    ) -> Result<UnlockResult> {
        let stored = SettingsService::get_or_create(&state.db).await?;
        let valid = stored
            .password_hash
            .as_deref()
            .is_some_and(|hash| PasswordService::verify(&password, hash));
        Self::finish_unlock(app, state, valid).await
    }

    pub async fn events(state: &AppRuntimeState, limit: u32) -> Result<Vec<LockEvent>> {
        let events = EventsRepository::list(&state.db, limit).await?;
        Ok(events
            .into_iter()
            .map(|event| LockEvent {
                id: event.id,
                event_type: event.event_type,
                mode: event.mode,
                message: event.message,
                created_at: event.created_at,
            })
            .collect())
    }

    async fn finish_unlock(app: &AppHandle, state: &AppRuntimeState, valid: bool) -> Result<UnlockResult> {
        if valid {
            windows::lock::close_lock_windows(app);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
            *state.lock_session.write().await = None;
            EventsRepository::add(&state.db, "unlocked", None, "密码解锁成功").await?;
            return Ok(UnlockResult {
                success: true,
                message: "已解锁".to_string(),
            });
        }

        EventsRepository::add(&state.db, "unlock_failed", None, "密码解锁失败").await?;
        Ok(UnlockResult {
            success: false,
            message: "密码错误".to_string(),
        })
    }
}
