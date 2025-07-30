#!/bin/bash

echo "Building Tauri application in Docker..."

# Build the Tauri development image if not exists
docker compose build tauri-dev

# Run the build command in the container
docker compose run --rm tauri-dev cargo tauri build

echo "Build complete! Check src-tauri/target/release for the output."