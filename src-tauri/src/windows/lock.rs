use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::models::{dto::LockDisplayInfo, vo::LockMode};

pub fn show_lock_windows(
    app: &AppHandle,
    mode: &LockMode,
    all_displays: bool,
) -> tauri::Result<Vec<LockDisplayInfo>> {
    close_lock_windows(app);
    let mut monitors = app.available_monitors()?;
    if !all_displays && monitors.len() > 1 {
        monitors.truncate(1);
    }
    let count = monitors.len();
    let mut displays = Vec::new();

    for (index, monitor) in monitors.iter().enumerate() {
        let label = format!("lock-screen-{index}");
        let position = monitor.position();
        let size = monitor.size();
        let title = match mode {
            LockMode::Transparent => "ComputerLock Pro - Transparent",
            LockMode::Black => "ComputerLock Pro - Black",
            LockMode::Blur => "ComputerLock Pro - Blur",
            LockMode::Wallpaper => "ComputerLock Pro - Wallpaper",
            LockMode::Clock => "ComputerLock Pro - Clock",
        };
        let mut builder = WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html?lock=1".into()))
            .title(title)
            .position(position.x as f64, position.y as f64)
            .inner_size(size.width as f64, size.height as f64)
            .decorations(false)
            .resizable(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(true);
        if matches!(mode, LockMode::Transparent) {
            builder = builder.transparent(true);
        }
        builder.build()?;
        displays.push(LockDisplayInfo {
            index: index as u32,
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
            is_primary: index == 0,
        });
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
        displays.push(LockDisplayInfo {
            index: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            is_primary: true,
        });
    }

    Ok(displays)
}

pub fn close_lock_windows(app: &AppHandle) {
    let labels: Vec<String> = app
        .webview_windows()
        .keys()
        .filter(|label| label.starts_with("lock-screen-"))
        .cloned()
        .collect();
    for label in labels {
        if let Some(window) = app.get_webview_window(&label) {
            let _ = window.close();
        }
    }
}
