use serde::{Deserialize, Serialize};

use crate::models::vo::LockMode;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(default)]
pub struct AppSettings {
    pub auto_start_enabled: bool,
    pub prevent_sleep_enabled: bool,
    pub default_lock_mode: LockMode,
    pub multi_display_enabled: bool,
    pub multi_display_strategy: String,
    pub unlock_hotkey: String,
    pub password_set: bool,
    pub password_migration_required: bool,
    pub theme: String,
    pub wallpaper_path: Option<String>,
    pub usb_key_path: Option<String>,
    pub bluetooth_device_name: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_start_enabled: false,
            prevent_sleep_enabled: false,
            default_lock_mode: LockMode::Transparent,
            multi_display_enabled: true,
            multi_display_strategy: "all".to_string(),
            unlock_hotkey: "Ctrl+Alt+U".to_string(),
            password_set: false,
            password_migration_required: false,
            theme: "system".to_string(),
            wallpaper_path: None,
            usb_key_path: None,
            bluetooth_device_name: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredSettings {
    pub app: AppSettings,
    pub password_hash: Option<String>,
    #[serde(default)]
    pub recovery_code_hash: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::AppSettings;

    #[test]
    fn serializes_fields_as_camel_case() {
        let value = serde_json::to_value(AppSettings::default()).expect("serialize settings");
        assert!(value.get("autoStartEnabled").is_some());
        assert!(value.get("preventSleepEnabled").is_some());
        assert!(value.get("defaultLockMode").is_some());
    }
}
