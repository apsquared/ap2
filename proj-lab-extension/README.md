# Projection Lab Export Chrome Extension

A simple Chrome extension to export data from Projection Lab using their Plugin API.

## Installation

1. **Enable Plugin Support in Projection Lab**:
   - Go to your Projection Lab Account Settings
   - Enable "Plugin Support"
   - Generate an API key

2. **Install the Extension**:
   - Open Chrome → `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" → Select this folder

3. **Use the Extension**:
   - Navigate to Projection Lab
   - Click the extension icon
   - Enter your API key
   - Click "Export All Data"

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main extension logic
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality
- `background.js` - Background service worker

## Troubleshooting

If the extension shows "API not available":
1. Make sure you're on `app.projectionlab.com`
2. Enable Plugin Support in Projection Lab settings
3. Refresh the page
4. Check the browser console for error messages
