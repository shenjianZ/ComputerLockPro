use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindowBuilder};

use crate::models::{dto::LockDisplayInfo, vo::LockMode};

const EDGE_COVER_MARGIN: f64 = 12.0;

fn mode_query(mode: &LockMode) -> &'static str {
    match mode {
        LockMode::Transparent => "Transparent",
        LockMode::Black => "Black",
        LockMode::Blur => "Blur",
        LockMode::Wallpaper => "Wallpaper",
        LockMode::Clock => "Clock",
    }
}

pub fn show_lock_windows(
    app: &AppHandle,
    mode: &LockMode,
    all_displays: bool,
) -> tauri::Result<Vec<LockDisplayInfo>> {
    close_lock_windows(app);
    let session_label = chrono::Utc::now().timestamp_millis();
    let mut monitors = app.available_monitors()?;
    if !all_displays && monitors.len() > 1 {
        monitors.truncate(1);
    }
    let count = monitors.len();
    let mut displays = Vec::new();

    for (index, monitor) in monitors.iter().enumerate() {
        let label = format!("lock-screen-{session_label}-{index}");
        let position = monitor.position();
        let size = monitor.size();
        let title = match mode {
            LockMode::Transparent => "ComputerLock Pro - Transparent",
            LockMode::Black => "ComputerLock Pro - Black",
            LockMode::Blur => "ComputerLock Pro - Blur",
            LockMode::Wallpaper => "ComputerLock Pro - Wallpaper",
            LockMode::Clock => "ComputerLock Pro - Clock",
        };
        let url = format!("index.html?lock=1&mode={}", mode_query(mode));
        let mut builder = WebviewWindowBuilder::new(app, label, WebviewUrl::App(url.into()))
            .title(title)
            .position(
                position.x as f64 - EDGE_COVER_MARGIN,
                position.y as f64 - EDGE_COVER_MARGIN,
            )
            .inner_size(
                size.width as f64 + EDGE_COVER_MARGIN * 2.0,
                size.height as f64 + EDGE_COVER_MARGIN * 2.0,
            )
            .decorations(false)
            .resizable(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(true);
        if matches!(mode, LockMode::Transparent | LockMode::Blur) {
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
        let label = format!("lock-screen-{session_label}-0");
        let url = format!("index.html?lock=1&mode={}", mode_query(mode));
        let mut builder = WebviewWindowBuilder::new(app, label, WebviewUrl::App(url.into()))
            .title("ComputerLock Pro - Lock")
            .fullscreen(true)
            .decorations(false)
            .always_on_top(true)
            .skip_taskbar(true)
            .visible(true);
        if matches!(mode, LockMode::Transparent | LockMode::Blur) {
            builder = builder.transparent(true);
        }
        builder.build()?;
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
            let _ = window.destroy();
        }
    }
}
