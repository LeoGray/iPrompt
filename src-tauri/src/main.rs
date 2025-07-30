// Prevents additional console window on Windows in release, DO NOT REMOVE!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::PathBuf;

// Get app data directory for the current platform
fn get_app_dir() -> Result<PathBuf, String> {
    let home_dir = dirs::data_dir()
        .ok_or_else(|| "Failed to get home directory".to_string())?;
    
    let app_dir = home_dir.join("iPrompt");
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&app_dir)
        .map_err(|e| format!("Failed to create app directory: {}", e))?;
    
    Ok(app_dir)
}

// Get data file path
fn get_data_file_path() -> Result<PathBuf, String> {
    let mut path = get_app_dir()?;
    path.push("iprompt-data.json");
    Ok(path)
}

// Command to get platform information
#[tauri::command]
fn platform_info() -> String {
    std::env::consts::OS.to_string()
}

// Command to get app version
#[tauri::command]
fn app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

// Read data file
#[tauri::command]
fn read_data_file() -> Result<String, String> {
    let file_path = get_data_file_path()?;
    
    if !file_path.exists() {
        return Ok(String::new());
    }
    
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read data file: {}", e))
}

// Write data file
#[tauri::command]
fn write_data_file(data: String) -> Result<(), String> {
    let file_path = get_data_file_path()?;
    
    fs::write(&file_path, data)
        .map_err(|e| format!("Failed to write data file: {}", e))
}

// Create backup
#[tauri::command]
fn create_backup() -> Result<String, String> {
    let data_file = get_data_file_path()?;
    
    if !data_file.exists() {
        return Err("No data file to backup".to_string());
    }
    
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let mut backup_path = get_app_dir()?;
    backup_path.push("backups");
    
    // Create backups directory
    fs::create_dir_all(&backup_path)
        .map_err(|e| format!("Failed to create backups directory: {}", e))?;
    
    backup_path.push(format!("iprompt-backup-{}.json", timestamp));
    
    fs::copy(&data_file, &backup_path)
        .map_err(|e| format!("Failed to create backup: {}", e))?;
    
    Ok(backup_path.to_string_lossy().to_string())
}

// List backups
#[tauri::command]
fn list_backups() -> Result<Vec<String>, String> {
    let mut backup_dir = get_app_dir()?;
    backup_dir.push("backups");
    
    if !backup_dir.exists() {
        return Ok(Vec::new());
    }
    
    let entries = fs::read_dir(&backup_dir)
        .map_err(|e| format!("Failed to read backups directory: {}", e))?;
    
    let mut backups = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            if let Some(name) = entry.file_name().to_str() {
                if name.starts_with("iprompt-backup-") && name.ends_with(".json") {
                    backups.push(name.to_string());
                }
            }
        }
    }
    
    backups.sort();
    backups.reverse(); // Most recent first
    Ok(backups)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            platform_info,
            app_version,
            read_data_file,
            write_data_file,
            create_backup,
            list_backups
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}