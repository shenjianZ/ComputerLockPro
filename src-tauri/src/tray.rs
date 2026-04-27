use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    AppHandle, Manager, State,
};

use crate::{models::vo::LockMode, services::lock::LockService, services::settings::SettingsService, state::AppRuntimeState};

pub fn init_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "显示主窗口", true, None::<&str>)?;
    let sep1 = PredefinedMenuItem::separator(app)?;
    let lock_default = MenuItem::with_id(app, "lock_default", "锁屏（默认模式）", true, None::<&str>)?;
    let lock_transparent = MenuItem::with_id(app, "lock_transparent", "透明锁屏", true, None::<&str>)?;
    let lock_black = MenuItem::with_id(app, "lock_black", "黑屏锁屏", true, None::<&str>)?;
    let lock_blur = MenuItem::with_id(app, "lock_blur", "模糊锁屏", true, None::<&str>)?;
    let lock_wallpaper = MenuItem::with_id(app, "lock_wallpaper", "壁纸锁屏", true, None::<&str>)?;
    let lock_clock = MenuItem::with_id(app, "lock_clock", "时钟锁屏", true, None::<&str>)?;
    let sep2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[
        &show, &sep1,
        &lock_default, &lock_transparent, &lock_black, &lock_blur, &lock_wallpaper, &lock_clock,
        &sep2, &quit,
    ])?;

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
        "lock_default" => lock_from_tray_default(app),
        "lock_transparent" => lock_from_tray(app, LockMode::Transparent),
        "lock_black" => lock_from_tray(app, LockMode::Black),
        "lock_blur" => lock_from_tray(app, LockMode::Blur),
        "lock_wallpaper" => lock_from_tray(app, LockMode::Wallpaper),
        "lock_clock" => lock_from_tray(app, LockMode::Clock),
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

fn lock_from_tray_default(app: &AppHandle) {
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

fn lock_from_tray(app: &AppHandle, mode: LockMode) {
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let state: State<'_, AppRuntimeState> = app.state();
        let _ = LockService::lock(&app, state.inner(), mode).await;
    });
}
