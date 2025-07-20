# Language Support for Teto-Egen Personality Test

This directory contains language files and configuration for the Teto-Egen personality test application.

## Directory Structure

- `config.js` - Configuration file defining supported languages and settings
- `*.json` - Translation files for each supported language (e.g., `en.json`, `ko.json`)

## File Relationships

The language system consists of three main components:

1. **Configuration (`assets/languages/config.js`)**: Defines supported languages, their properties, and default settings.
2. **Utilities (`assets/js/language-utils.js`)**: Provides functions for language detection, selection, and formatting.
3. **Storage (`assets/js/language-storage.js`)**: Manages saving and retrieving language preferences.
4. **Translation Files (`assets/languages/*.json`)**: Contains translated text for each supported language.

## How the Language System Works

1. When the application loads, `language-storage.js` determines the preferred language:
   - First checks for a saved preference in localStorage
   - If none exists, detects the browser language
   - Falls back to the default language (Korean) if needed

2. The `language-utils.js` module provides utility functions:
   - Language detection and validation
   - Formatting dates and numbers according to language conventions
   - Handling RTL (right-to-left) languages
   - Accessing language metadata (flags, native names)

3. Translation files use a hierarchical JSON structure to organize text content.

## Adding a New Language

To add a new language:

1. Add the language definition to the `supportedLanguages` array in `config.js`
2. Create a new JSON file named with the language code (e.g., `fr.json`)
3. Copy the structure from an existing language file and translate all values
4. Test the new language by selecting it in the language dropdown

## Translation File Structure

Translation files use a hierarchical JSON structure with nested keys for organization:

```json
{
  "section": {
    "subsection": {
      "key": "Translated text"
    }
  }
}
```

## Implementation Status

The application now has a comprehensive framework for supporting 15 languages. We have implemented translation files for several languages, and the remaining ones are in progress.

## Translation Files Structure

All translation files follow a standardized hierarchical structure defined in `template.json`. This template contains all translatable strings organized by sections and features of the application. When adding new text to the application, make sure to update this template and all existing translation files.

## Supported Languages

The application is configured to support the following languages:

1. English (en) - ✓ Implemented
2. Mandarin Chinese (zh) - ✓ Implemented
3. Hindi (hi) - ✓ Implemented
4. Spanish (es) - ✓ Implemented
5. French (fr) - ⨯ In progress
6. Arabic (ar) - ⨯ In progress
7. Bengali (bn) - ⨯ In progress
8. Russian (ru) - ⨯ In progress
9. Portuguese (pt) - ⨯ In progress
10. Indonesian (id) - ⨯ In progress
11. Urdu (ur) - ⨯ In progress
12. German (de) - ⨯ In progress
13. Japanese (ja) - ⨯ In progress
14. Swahili (sw) - ⨯ In progress
15. Korean (ko) - ✓ Implemented (Default)