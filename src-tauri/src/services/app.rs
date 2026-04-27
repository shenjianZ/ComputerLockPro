use anyhow::Result;

use crate::{
    models::dto::AppStatus,
    services::settings::SettingsService,
    state::AppRuntimeState,
};

pub struct AppService;

impl AppService {
    pub async fn status(state: &AppRuntimeState) -> Result<AppStatus> {
        let stored = SettingsService::get_or_create(&state.db).await?;
        let lock_session = state.lock_session.read().await;
        Ok(AppStatus {
            is_locked: lock_session.is_some(),
            active_mode: lock_session.as_ref().map(|session| session.mode.clone()),
            auto_start_enabled: stored.app.auto_start_enabled,
            prevent_sleep_enabled: stored.app.prevent_sleep_enabled,
            database_ready: true,
        })
    }
}
