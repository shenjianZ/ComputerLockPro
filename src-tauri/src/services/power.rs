use anyhow::{bail, Result};
use std::process::Command;

use crate::{
    models::dto::{PowerScheduleResult, PowerStatus},
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

    pub fn schedule_power_action(action: String, delay_minutes: u32) -> Result<PowerScheduleResult> {
        let delay_seconds = delay_minutes.clamp(1, 1440) * 60;
        match action.as_str() {
            "shutdown" => schedule_shutdown(delay_seconds)?,
            "sleep" => schedule_sleep(delay_seconds),
            _ => bail!("不支持的电源动作"),
        }

        Ok(PowerScheduleResult {
            action,
            delay_seconds,
            message: format!("系统电源动作已计划在 {delay_minutes} 分钟后执行"),
        })
    }

    pub fn cancel_power_action() -> Result<PowerScheduleResult> {
        cancel_shutdown();
        Ok(PowerScheduleResult {
            action: "cancel".to_string(),
            delay_seconds: 0,
            message: "已取消可取消的关机计划".to_string(),
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

#[cfg(target_os = "windows")]
fn schedule_shutdown(delay_seconds: u32) -> Result<()> {
    Command::new("shutdown")
        .args(["/s", "/t", &delay_seconds.to_string()])
        .spawn()?;
    Ok(())
}

#[cfg(not(target_os = "windows"))]
fn schedule_shutdown(_delay_seconds: u32) -> Result<()> {
    Ok(())
}

#[cfg(target_os = "windows")]
fn schedule_sleep(delay_seconds: u32) {
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(delay_seconds as u64));
        let _ = Command::new("rundll32")
            .args(["powrprof.dll,SetSuspendState", "0,1,0"])
            .spawn();
    });
}

#[cfg(not(target_os = "windows"))]
fn schedule_sleep(_delay_seconds: u32) {}

#[cfg(target_os = "windows")]
fn cancel_shutdown() {
    let _ = Command::new("shutdown").arg("/a").spawn();
}

#[cfg(not(target_os = "windows"))]
fn cancel_shutdown() {}
