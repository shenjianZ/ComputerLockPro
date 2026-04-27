use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, State,
};

use crate::{models::vo::LockMode, services::lock::LockService, state::AppRuntimeState};

pub fn init_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let transparent = MenuItem::with_id(app, "lock_transparent", "透明锁屏", true, None::<&str>)?;
    let black = MenuItem::with_id(app, "lock_black", "黑屏锁屏", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &transparent, &black, &quit])?;

    TrayIconBuilder::new()
        .tooltip("ComputerLock Pro")
        .menu(&menu)
        .on_menu_event(handle_menu_event)
        .build(app)?;
    Ok(())
}

fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        "show" => show_main_window(app),
        "lock_transparent" => lock_from_tray(app, LockMode::Transparent),
        "lock_black" => lock_from_tray(app, LockMode::Black),
        "quit" => app.exit(0),
        _ => {}
    }
}

fn show_main_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn lock_from_tray(app: &AppHandle, mode: LockMode) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let state: State<'_, AppRuntimeState> = app.state();
        let _ = LockService::lock(&app, state.inner(), mode).await;
        show_main_window(&app);
    });
}
