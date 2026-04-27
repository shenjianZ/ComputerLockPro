use anyhow::Result;

use crate::{
    models::dto::PowerStatus,
    services::settings::SettingsService,
    state::AppRuntimeState,
};

pub struct PowerService;

impl PowerService {
    pub async fn set_prevent_sleep(
        state: &AppRuntimeState,
        enabled: bool,
    ) -> Result<PowerStatus> {
        let mut stored = SettingsService::get_or_create(&state.db).await?;
        stored.app.prevent_sleep_enabled = enabled;
        SettingsService::save_app_settings(&state.db, stored.app).await?;
        apply_prevent_sleep(enabled);
        Ok(PowerStatus {
            prevent_sleep_enabled: enabled,
        })
    }
}

#[cfg(target_os = "windows")]
fn apply_prevent_sleep(enabled: bool) {
    use windows_sys::Win32::System::Power::{
        SetThreadExecutionState, ES_CONTINUOUS, ES_DISPLAY_REQUIRED, ES_SYSTEM_REQUIRED,
    };

    let flags = if enabled {
        ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
    } else {
        ES_CONTINUOUS
    };
    unsafe {
        SetThreadExecutionState(flags);
    }
}

#[cfg(not(target_os = "windows"))]
fn apply_prevent_sleep(_enabled: bool) {}
