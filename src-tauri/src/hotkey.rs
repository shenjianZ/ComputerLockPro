use anyhow::Result;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
};

use crate::{services::lock::LockService, services::settings::SettingsService, state::AppRuntimeState};

pub fn init_hotkeys(app: &AppHandle) -> Result<()> {
    let lock_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyL);
    let unlock_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyU);

    let lock_handler = lock_shortcut.clone();
    let unlock_handler = unlock_shortcut.clone();
    app.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
                if event.state != ShortcutState::Pressed {
                    return;
                }
                if shortcut == &lock_handler {
                    lock_from_hotkey(app);
                } else if shortcut == &unlock_handler {
                    unlock_from_hotkey(app);
                }
            })
            .build(),
    )?;
    app.global_shortcut().register(lock_shortcut)?;
    app.global_shortcut().register(unlock_shortcut)?;
    Ok(())
}

fn lock_from_hotkey(app: &AppHandle) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let state: State<'_, AppRuntimeState> = app.state();
        let mode = SettingsService::get_or_create(&state.inner().db)
            .await
            .map(|s| s.app.default_lock_mode)
            .unwrap_or_default();
        let _ = LockService::lock(&app, state.inner(), mode).await;
    });
}

fn unlock_from_hotkey(app: &AppHandle) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let state: State<'_, AppRuntimeState> = app.state();
        let locked = state.lock_session.read().await.is_some();
        if !locked {
            return;
        }
        let _ = LockService::unlock_with_usb_key(&app, state.inner()).await;
    });
}
