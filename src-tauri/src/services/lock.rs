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
    services::system_guard::SystemGuardService,
    state::AppRuntimeState,
    windows,
};

const MAX_UNLOCK_ATTEMPTS: u32 = 10;
const LOCKOUT_DURATION_SECS: u64 = 30;

pub struct LockService;

impl LockService {
    pub async fn lock(app: &AppHandle, state: &AppRuntimeState, mode: LockMode) -> Result<LockSession> {
        let stored = SettingsService::get_or_create(&state.db).await?;
        if stored.password_hash.is_none() {
            anyhow::bail!("请先设置锁屏密码");
        }

        let all_displays = stored.app.multi_display_enabled
            && stored.app.multi_display_strategy != "primary";
        let displays = windows::lock::show_lock_windows(app, &mode, all_displays)?;

        let session = LockSession {
            session_id: Utc::now().timestamp_millis().to_string(),
            mode: mode.clone(),
            started_at: Utc::now(),
            display_count: displays.len() as u32,
            displays,
        };
        *state.lock_session.write().await = Some(session.clone());

        if let Some(window) = app.get_webview_window("main") {
            let _ = window.hide();
        }

        *state.unlock_failed_count.write().await = 0;
        EventsRepository::add(&state.db, "locked", Some(&mode), "锁屏已启动").await?;
        Ok(session)
    }

    pub async fn unlock(
        app: &AppHandle,
        state: &AppRuntimeState,
        password: String,
    ) -> Result<UnlockResult> {
        if password.trim().is_empty() {
            return Ok(UnlockResult {
                success: false,
                message: "请输入密码".to_string(),
            });
        }

        {
            let failed = *state.unlock_failed_count.read().await;
            if failed >= MAX_UNLOCK_ATTEMPTS {
                return Ok(UnlockResult {
                    success: false,
                    message: format!("连续错误次数过多，请等待 {} 秒后重试", LOCKOUT_DURATION_SECS),
                });
            }
        }

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

    pub async fn unlock_with_usb_key(
        app: &AppHandle,
        state: &AppRuntimeState,
    ) -> Result<UnlockResult> {
        let stored = SettingsService::get_or_create(&state.db).await?;
        let status = SystemGuardService::check_usb_key(stored.app.usb_key_path);
        Self::finish_unlock(app, state, status.success).await
    }

    async fn finish_unlock(app: &AppHandle, state: &AppRuntimeState, valid: bool) -> Result<UnlockResult> {
        if valid {
            windows::lock::close_lock_windows(app);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
            *state.lock_session.write().await = None;
            *state.unlock_failed_count.write().await = 0;
            EventsRepository::add(&state.db, "unlocked", None, "密码解锁成功").await?;
            return Ok(UnlockResult {
                success: true,
                message: "已解锁".to_string(),
            });
        }

        let mut failed_count = state.unlock_failed_count.write().await;
        *failed_count += 1;
        let count = *failed_count;

        let message = if count >= MAX_UNLOCK_ATTEMPTS {
            format!("连续错误 {} 次，已临时锁定 {} 秒", count, LOCKOUT_DURATION_SECS)
        } else {
            format!("密码错误（{}/{}）", count, MAX_UNLOCK_ATTEMPTS)
        };

        EventsRepository::add(&state.db, "unlock_failed", None, &message).await?;
        Ok(UnlockResult {
            success: false,
            message,
        })
    }
}
