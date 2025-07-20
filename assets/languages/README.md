# Language Support for Teto-Egen Personality Test

This directory contains language files and configuration for the Teto-Egen personality test application.

## Directory Structure

- `config.js` - Configuration file defining supported languages and settings
- `*.json` - Translation files for each supported language (e.g., `en.json`, `ko.json`)
- `template.json` - Base template containing all translatable strings
- `TRANSLATION_GUIDE.md` - Guidelines for translators
- `translation-keys.md` - Documentation of all translation keys

## File Relationships and Architecture

The language system consists of five main components:

1. **Configuration (`assets/languages/config.js`)**: Defines supported languages, their properties, and default settings.
2. **Utilities (`assets/js/language-utils.js`)**: Provides functions for language detection, selection, and formatting.
3. **Storage (`assets/js/language-storage.js`)**: Manages saving and retrieving language preferences.
4. **Loader (`assets/js/language-loader.js`)**: Handles loading and caching of language files.
5. **Translator (`assets/js/language-translator.js`)**: Applies translations to the UI.
6. **UI Component (`assets/js/language-dropdown.js`)**: Creates and manages the language selection dropdown.
7. **Translation Files (`assets/languages/*.json`)**: Contains translated text for each supported language.

## How the Language System Works

1. **Initialization Flow**:
   - When the application loads, `language-storage.js` determines the preferred language
   - `language-loader.js` loads the appropriate language file, with caching for performance
   - `language-translator.js` applies translations to the UI elements
   - `language-dropdown.js` creates the language selection UI

2. **Language Selection**:
   - User selects a language from the dropdown
   - `language-storage.js` saves the preference to localStorage
   - `language-loader.js` loads the selected language file (from cache if available)
   - `language-translator.js` updates all UI elements with the new translations

3. **Performance Optimizations**:
   - Language files are cached in memory and localStorage
   - Only the current language is loaded initially
   - Additional languages are preloaded in the background based on likely usage
   - Cache management includes expiration and LRU (Least Recently Used) eviction

4. **Fallback Mechanism**:
   - If a translation is missing, falls back to the default language (Korean)
   - If a language file fails to load, falls back to the default language
   - If browser language is not supported, uses the default language

## Adding a New Language

To add a new language:

1. Add the language definition to the `supportedLanguages` array in `config.js`
2. Create a new JSON file named with the language code (e.g., `fr.json`)
3. Copy the structure from `template.json` and translate all values
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