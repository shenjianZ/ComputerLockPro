use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::models::vo::LockMode;

pub fn show_lock_windows(app: &AppHandle, mode: &LockMode) -> tauri::Result<u32> {
    close_lock_windows(app);
    let monitors = app.available_monitors()?;
    let count = monitors.len();

    for (index, monitor) in monitors.iter().enumerate() {
        let label = format!("lock-screen-{index}");
        let position = monitor.position();
        let size = monitor.size();
        let title = match mode {
            LockMode::Transparent => "ComputerLock Pro - Transparent",
            LockMode::Black => "ComputerLock Pro - Black",
        };
        WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html?lock=1".into()))
            .title(title)
            .position(position.x as f64, position.y as f64)
            .inner_size(size.width as f64, size.height as f64)
            .decorations(false)
            .resizable(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(true)
            .build()?;
    }

    if count == 0 {
        WebviewWindowBuilder::new(app, "lock-screen-0", WebviewUrl::App("index.html?lock=1".into()))
            .title("ComputerLock Pro - Lock")
            .fullscreen(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(true)
            .build()?;
        return Ok(1);
    }

    Ok(count as u32)
}

pub fn close_lock_windows(app: &AppHandle) {
    for index in 0..16 {
        if let Some(window) = app.get_webview_window(&format!("lock-screen-{index}")) {
            let _ = window.close();
        }
    }
}
