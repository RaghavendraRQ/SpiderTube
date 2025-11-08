# SpiderTube

A modern desktop music streaming application that allows you to search, browse, and play music from YouTube with a sleek user interface.

## 🎵 Features

- **Music Search**: Search for songs, albums, playlists, and artists
- **Genre Browsing**: Explore music by genres and moods
- **Audio Streaming**: Stream music directly from YouTube using efficient audio extraction
- **Playlist Support**: Browse and play playlists and albums
- **Local Caching**: Smart caching system for improved performance
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Cross-Platform**: Desktop application for Windows, macOS, and Linux

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **Vite** as build tool
- **Radix UI** for accessible UI components
- **Zustand** for state management
- **React Router** for navigation

### Backend
- **Tauri 2** - Desktop application framework
- **Rust** - Backend logic and API
- **RustyPipe** - YouTube data extraction library
- **yt-dlp** - Audio stream extraction
- **FFmpeg** - Audio processing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) or **Bun** runtime
- **Rust** (latest stable version)
- **yt-dlp** - [Installation guide](https://github.com/yt-dlp/yt-dlp#installation)
- **FFmpeg** - [Installation guide](https://ffmpeg.org/download.html)

### Installing Prerequisites

#### macOS (using Homebrew)
```bash
brew install node rust yt-dlp ffmpeg
```

#### Ubuntu/Debian
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install yt-dlp and FFmpeg
sudo apt install yt-dlp ffmpeg
```

#### Windows
```powershell
# Using winget
winget install OpenJS.NodeJS
winget install Rustlang.Rust.MSVC
winget install yt-dlp.yt-dlp
winget install Gyan.FFmpeg
```

Or use [Scoop](https://scoop.sh/):
```powershell
scoop install nodejs rust yt-dlp ffmpeg
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RaghavendraRQ/SpiderTube.git
   cd SpiderTube
   ```

2. **Install dependencies**
   
   Using npm:
   ```bash
   npm install
   ```
   
   Or using Bun:
   ```bash
   bun install
   ```

## 💻 Development

### Running in Development Mode

To start the development server with hot reload:

Using npm:
```bash
npm run tauri dev
```

Or using Bun:
```bash
bun run tauri dev
```

This will:
- Start the Vite development server for the frontend
- Compile the Rust backend
- Launch the Tauri application window

### Building for Production

To create a production build:

Using npm:
```bash
npm run tauri build
```

Or using Bun:
```bash
bun run tauri build
```

The compiled application will be available in `src-tauri/target/release/bundle/`.

## 📁 Project Structure

```
SpiderTube/
├── src/                      # React frontend source code
│   ├── components/          # React components
│   │   ├── LocalPlayer.tsx  # Audio player component
│   │   ├── Search/          # Search functionality
│   │   ├── Main/            # Main view components
│   │   ├── overlay/         # Overlay components (sidebar, player)
│   │   └── ui/              # Reusable UI components
│   ├── models/              # TypeScript data models
│   ├── store/               # Zustand state management
│   ├── hooks/               # Custom React hooks
│   ├── home.tsx             # Home page
│   ├── genre.tsx            # Genre browsing page
│   └── App.tsx              # Main application component
├── src-tauri/               # Rust backend source code
│   ├── src/
│   │   ├── connectors/      # API connectors
│   │   ├── model/           # Rust data models
│   │   ├── request/         # Request handlers (streaming, API)
│   │   ├── lib.rs           # Main library entry point
│   │   └── main.rs          # Application entry point
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── package.json             # Node.js dependencies
└── vite.config.ts           # Vite configuration
```

## 🔧 How It Works

SpiderTube works by combining several technologies to provide a seamless music streaming experience:

1. **Search & Discovery**: Uses the RustyPipe library to fetch music metadata from YouTube
2. **Audio Extraction**: When you play a song, yt-dlp extracts the audio stream URL
3. **Processing**: FFmpeg processes the audio stream for optimal playback
4. **Caching**: Downloaded audio is cached locally for faster subsequent playback
5. **Playback**: The React frontend uses HTML5 audio APIs to play the processed audio

### Architecture Flow

```
User Interface (React) 
    ↓
Tauri IPC Bridge
    ↓
Rust Backend
    ├→ RustyPipe (YouTube metadata)
    ├→ yt-dlp (Audio extraction)
    └→ FFmpeg (Audio processing)
    ↓
Local Cache & Playback
```

## 🔑 Key Features Explained

### Audio Streaming
The application uses a two-step process:
1. Fetches the video metadata using RustyPipe
2. Streams audio using yt-dlp and processes it with FFmpeg in chunks (256KB)

### Caching System
Downloaded audio files are stored in the application's cache directory for quick access on subsequent plays.

### Genre Discovery
Genres are fetched from multiple sources and cached locally for browsing offline.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the terms specified by the repository owner.

## ⚠️ Disclaimer

This application is for educational purposes. Please respect YouTube's Terms of Service and content creators' rights.

## 🐛 Known Issues

- Ensure yt-dlp and FFmpeg are properly installed and available in your system PATH
- First-time audio streaming may take a few seconds while extracting the stream

## 📧 Contact

For issues and feature requests, please use the [GitHub Issues](https://github.com/RaghavendraRQ/SpiderTube/issues) page.