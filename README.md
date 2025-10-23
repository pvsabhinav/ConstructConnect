# ConstructConnect

A modern mobile app for construction site communication and progress reporting.

## Features

### 📱 Messaging System
- **Slack/Discord-like interface** with workspaces for each construction project
- **Channels** for different aspects (general, updates, issues, safety)
- **Voice messaging** support for hands-free communication
- **Thread support** for organized discussions
- **Real-time messaging** with modern UI

### 📸 Photo Reporting
- **Progress reporting** with AI-generated analysis
- **Issue reporting** with automatic safety assessment
- **Camera integration** for on-site photo capture
- **AI-powered reports** that automatically post to the updates channel
- **High-contrast UI** designed for construction workers

## Design Philosophy

- **Dark theme** with high contrast for outdoor visibility
- **Rugged design** suitable for construction environments
- **Large touch targets** for use with work gloves
- **Voice-first** interactions where possible
- **Offline-capable** for areas with poor connectivity

## Tech Stack

- **React Native** with Expo
- **TypeScript** for type safety
- **Expo Camera** for photo capture
- **Expo AV** for voice messaging
- **React Navigation** for navigation
- **Custom dark theme** optimized for construction workers

## Installation

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Install the LTS version

2. **Install Expo CLI**
   ```bash
   npm install -g @expo/cli
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press 'i' for iOS simulator, 'a' for Android emulator

## Project Structure

```
ConstructConnect/
├── App.tsx                 # Main app component with navigation
├── src/
│   ├── screens/
│   │   ├── MessagingScreen.tsx      # Slack-like messaging interface
│   │   └── PhotoReportingScreen.tsx # Photo capture and AI reporting
│   └── styles/
│       ├── theme.ts                 # Dark theme configuration
│       └── global.ts                # Global styles
├── assets/                 # App icons and images
├── package.json            # Dependencies and scripts
└── app.json               # Expo configuration
```

## Key Features Implementation

### Messaging System
- **Workspace management** for different construction projects
- **Channel organization** (general, updates, issues, safety)
- **Voice messaging** with recording and playback
- **Message threading** for organized discussions
- **Real-time updates** (simulated)

### Photo Reporting
- **Camera integration** with permission handling
- **AI report generation** (mock implementation)
- **Progress vs Issue** reporting types
- **Automatic channel posting** to updates channel
- **Report history** with image previews

## Customization

### Theme Colors
Edit `src/styles/theme.ts` to customize:
- Primary colors
- Construction-specific colors (safety, danger, caution)
- Message and channel colors
- Typography and spacing

### Adding New Features
1. Create new screens in `src/screens/`
2. Add navigation in `App.tsx`
3. Update theme as needed
4. Add any new dependencies to `package.json`

## Future Enhancements

- **Real backend integration** with WebSocket support
- **Push notifications** for urgent messages
- **File sharing** for documents and blueprints
- **GPS location** tagging for reports
- **Offline mode** with sync capabilities
- **Team management** and user roles
- **Integration with construction management software**

## Development Notes

- Uses Expo managed workflow for easy deployment
- TypeScript for better code quality
- Modular component structure
- Custom hooks for state management
- Responsive design for different screen sizes

## License

This project is for demonstration purposes. Please ensure you have proper licenses for any production use.



