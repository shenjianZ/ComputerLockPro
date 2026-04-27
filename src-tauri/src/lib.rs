pub mod config;
pub mod commands;
pub mod db;
pub mod hotkey;
pub mod models;
pub mod repositories;
pub mod services;
pub mod state;
pub mod tray;
pub mod windows;

use state::AppRuntimeState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|_app, _args, _cwd| {}))
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })
        .setup(|app| {
            let db = tauri::async_runtime::block_on(db::init_database())?;
            tauri::async_runtime::block_on(
                services::settings::SettingsService::get_or_create(&db),
            )?;
            app.manage(AppRuntimeState::new(db));
            tray::init_tray(app.handle())?;
            hotkey::init_hotkeys(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_status,
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::lock::lock_screen,
            commands::lock::unlock_screen,
            commands::lock::get_lock_events,
            commands::power::set_prevent_sleep,
            commands::power::set_autostart
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
