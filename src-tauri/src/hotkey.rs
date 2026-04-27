use anyhow::Result;
use tauri::{AppHandle, Manager, State};
use tauri_plugin_global_shortcut::{
    Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
};

use crate::{models::vo::LockMode, services::lock::LockService, state::AppRuntimeState};

pub fn init_hotkeys(app: &AppHandle) -> Result<()> {
    let lock_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyL);
    let handler_shortcut = lock_shortcut.clone();
    app.plugin(
        tauri_plugin_global_shortcut::Builder::new()
            .with_handler(move |app, shortcut, event| {
                if shortcut == &handler_shortcut && event.state == ShortcutState::Pressed {
                    lock_from_hotkey(app);
                }
            })
            .build(),
    )?;
    app.global_shortcut().register(lock_shortcut)?;
    Ok(())
}

fn lock_from_hotkey(app: &AppHandle) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let state: State<'_, AppRuntimeState> = app.state();
        let _ = LockService::lock(&app, state.inner(), LockMode::Transparent).await;
    });
}
