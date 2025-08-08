# ChordCode 🎸

An AI-powered mobile app that analyzes YouTube music videos to provide guitar chords and interactive tutorials. Built with React Native, Expo, and TypeScript.

## Features

- **🎵 AI Chord Detection**: Advanced algorithms analyze YouTube music to detect chord progressions
- **📚 Interactive Tutorials**: Step-by-step guitar tutorials generated for each song
- **⚡ Real-time Analysis**: Get chord progressions instantly without data storage
- **🎯 Scalable Architecture**: Built with TypeScript and modular design
- **📱 Cross-Platform**: Works on iOS, Android, and web
- **🚀 Fast & Efficient**: Optimized performance with smart caching

## Getting Started

### Prerequisites

- Node.js (version 18 or later)
- npm or yarn
- Expo CLI
- For mobile testing: Expo Go app on your device

### Installation

1. Clone the repository:
```bash
git clone https://github.com/granthgharewal/chordcode.git
cd chordcode
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on different platforms:
```bash
# iOS simulator
npm run ios

# Android emulator
npm run android

# Web browser
npm run web
```

### Configuration

To enable full functionality, you'll need to configure API keys:

1. **YouTube Data API**: 
   - Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Replace `YOUR_YOUTUBE_API_KEY` in `services/chordAnalysisService.ts`

2. **OpenAI API** (for enhanced tutorial generation):
   - Get an API key from [OpenAI](https://platform.openai.com/)
   - Replace `YOUR_OPENAI_API_KEY` in `services/chordAnalysisService.ts`

## Project Structure

```
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Home screen with main functionality
│   │   └── explore.tsx    # About page with features
│   ├── _layout.tsx        # Root layout configuration
│   └── index.tsx          # Entry point with redirect
├── components/            # Reusable UI components
│   ├── URLInput.tsx       # YouTube URL input component
│   ├── ChordDisplay.tsx   # Chord progression display
│   ├── TutorialDisplay.tsx # Interactive tutorial component
│   └── SongHeader.tsx     # Song information display
├── services/              # Business logic and APIs
│   ├── types.ts           # TypeScript type definitions
│   ├── utils.ts           # Utility functions
│   └── chordAnalysisService.ts # Main analysis service
└── hooks/                 # Custom React hooks
```

## Usage

1. **Paste YouTube URL**: Copy any YouTube music URL into the input field
2. **Analyze**: Tap "Get Chords & Tutorial" to start analysis
3. **View Results**: 
   - See song information and difficulty level
   - Browse chord progressions with timestamps
   - Follow step-by-step tutorial instructions
4. **Practice**: Use the interactive tutorial to learn the song

## Technology Stack

- **Frontend**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **Styling**: Native StyleSheet with theming
- **Icons**: Expo Vector Icons
- **State Management**: React Hooks
- **Development**: Expo CLI with hot reloading

## Future Enhancements

- **Audio Playback**: Synchronized chord display with audio
- **Chord Diagrams**: Visual guitar chord fingering charts
- **Difficulty Levels**: Simplified arrangements for beginners
- **Practice Mode**: Interactive practice sessions with feedback
- **Offline Mode**: Download and cache chord progressions
- **Social Features**: Share chord progressions and tutorials
- **Custom Tunings**: Support for alternate guitar tunings
- **Instrument Support**: Add support for piano, ukulele, etc.

## API Integration

Currently uses mock data for demonstration. To integrate with real APIs:

### YouTube Data API
```typescript
// Replace mock implementation in chordAnalysisService.ts
const response = await fetch(
  `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`
);
```

### Audio Analysis
Consider integrating with:
- Spotify Web API for audio features
- Custom ML models for chord detection
- Third-party music analysis services

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/granthgharewal/chordcode/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer: [Grant Gharewal](mailto:grant@example.com)

## Acknowledgments

- Expo team for the amazing development platform
- React Native community for excellent documentation
- Guitar community for inspiration and feedback

---

**Made with ❤️ for guitar learners everywhere**
