# Better Bogleheads

A Chrome extension that enhances the [Bogleheads.org](https://www.bogleheads.org) forum with visual improvements and filtering options.

## Features

- **Zebra Striping** - Alternating row colors for easier reading (customizable color)
- **Hide Read Threads** - Automatically tracks threads you've clicked and can hide them. Threads reappear when new replies are posted.
- **Highlight Hot Topics** - Highlight threads with many replies (customizable threshold and color)
- **Hide Old Threads** - Filter out threads older than a specified number of days
- **Adjustable Font Size** - Increase or decrease the thread list font size (50% - 200%)

All settings are saved and persist across sessions.

## Installation (from repo)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `extension` folder

## Files

- `manifest.json` - Extension configuration (Manifest V3)
- `content.js` - Applies enhancements to forum pages
- `background.js` - Service worker that manages the side panel
- `sidepanel.html` - Settings panel UI
- `sidepanel.js` - Settings panel logic
- `sidepanel.css` - Settings panel styling
- `icons/` - Extension icons

## Usage

1. Navigate to https://bogleheads.org/
2. Click the extension icon in the Chrome toolbar to open the side panel
3. Adjust settings as desired - changes apply immediately

## Permissions

- **storage** - To save your preferences
- **sidePanel** - To display settings in Chrome's side panel
- **tabs** - To detect when you're on a Bogleheads page
- **Host permission** - Only runs on bogleheads.org

## License(s)

- MIT License - Feel free to modify and distribute.
- Bogleheads® is a registered service mark of The John C. Bogle Center for Financial Literacy
