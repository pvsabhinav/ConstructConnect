# Gemini AI Integration Setup Guide

## Overview
The ConstructConnect app now uses Google Gemini AI for real photo analysis instead of mock responses. This provides actual AI-powered construction site analysis.

## Setup Instructions

### 1. Get Your Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key
1. Open `src/config/api.ts`
2. Replace `'your_gemini_api_key_here'` with your actual API key:
   ```typescript
   GEMINI_API_KEY: 'your_actual_api_key_here',
   ```

### 3. Test the Integration
1. Run the app: `npm start`
2. Navigate to the "Reports" tab
3. Take a photo or select an existing image
4. Choose "Progress Report" or "Issue Report"
5. The app will now use real Gemini AI analysis

## Features

### Real AI Analysis
- **Progress Reports**: Analyzes construction progress, completion percentage, materials, quality, timeline, and safety
- **Issue Reports**: Identifies safety concerns, severity levels, locations, causes, and recommendations
- **Confidence Scoring**: Each analysis includes a confidence level (0-1)
- **Actionable Recommendations**: Specific steps to take based on the analysis

### Fallback System
- If API key is not configured, the app falls back to mock responses
- If API calls fail, the app gracefully falls back to mock responses
- Console warnings indicate when fallback is being used

### Error Handling
- Network timeouts and API errors are handled gracefully
- Image processing errors are caught and logged
- The app continues to function even if AI analysis fails

## API Usage
- Uses Gemini 1.5 Flash model for fast responses
- Images are converted to base64 for API transmission
- Responses are parsed to extract structured data
- Rate limiting and retry logic can be added as needed

## Security Notes
- Keep your API key secure and don't commit it to version control
- Consider using environment variables for production deployments
- Monitor your API usage in the Google AI Studio dashboard

## Troubleshooting
- **"Gemini API key not configured"**: Make sure you've updated the API key in `src/config/api.ts`
- **"Failed to process image"**: Check that the image URI is valid and accessible
- **Network errors**: Verify your internet connection and API key validity
- **Analysis not working**: Check the console for error messages and ensure the API key has proper permissions

