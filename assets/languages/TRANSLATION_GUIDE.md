# Translation Guide for Teto-Egen Personality Test

This document provides guidelines for translators working on the Teto-Egen Personality Test application. It explains how translation keys are organized and how to maintain consistency across different language files.

## Translation Process Overview

1. **Key Extraction**: All translatable text from the application is extracted and organized into a hierarchical structure
2. **Template Creation**: A comprehensive template file (`template.json`) is created with all keys
3. **Translation**: Each language file is created by translating the values in the template
4. **Implementation**: The application loads translations dynamically based on user language preference

## Translation Key Structure

Translation keys are organized hierarchically to reflect the structure of the application:

```
app.title
app.description
startScreen.mainTitle
startScreen.intro
...
```

This hierarchical structure makes it easier to:
- Locate specific translations
- Group related translations together
- Maintain consistency across the application

## Key Categories

The translation keys are organized into the following main categories:

1. **app**: General application information (title, description)
2. **startScreen**: Text on the landing page
3. **infoModal**: Text in the information modal
4. **surveyScreen**: Text in the survey/questions screen
5. **photoScreen**: Text in the photo upload screen
6. **resultScreen**: Text in the results screen
7. **loadingScreen**: Text in loading screens
8. **alerts**: Text for alerts and notifications
9. **languageSelector**: Text for the language selection dropdown
10. **testPage**: Text for the test mode page
11. **personalityTypes**: Names of the personality types

## Translation Guidelines

When translating, please follow these guidelines:

1. **Maintain Placeholders**: Keep placeholders like `{current}`, `{total}`, or `{type}` unchanged
2. **Preserve HTML Tags**: If the original text contains HTML tags, keep them in the translation
3. **Respect Formatting**: Maintain line breaks and formatting where possible
4. **Cultural Adaptation**: Adapt the personality type names appropriately for your language
5. **Consistency**: Use consistent terminology throughout the translation
6. **Character Limits**: Be mindful of space constraints, especially for buttons and labels
7. **RTL Support**: For right-to-left languages (Arabic, Urdu), ensure proper text alignment

## Special Considerations

### Personality Type Names

The four personality types (테토남, 테토녀, 에겐남, 에겐녀) can be:
- Transliterated (phonetically adapted to your language)
- Translated (using equivalent terms in your language)
- Kept as is with explanation

Choose the approach that works best for your language and culture.

### Technical Terms

Some technical terms may not have direct equivalents in all languages. In such cases:
- Use the most appropriate term in your language
- If no equivalent exists, use the English term with an explanation
- Be consistent with your choice throughout the translation

## Testing Your Translation

After creating a translation file:
1. Make sure it's valid JSON (check for missing commas, quotes, etc.)
2. Test it in the application by selecting your language
3. Verify that all text is properly displayed
4. Check for any untranslated strings or formatting issues

## Adding New Translatable Text

When adding new text to the application:
1. Add the new key to `template.json`
2. Add translations to all existing language files
3. Document the new key in `translation-keys.md`

## Translation File Example

Here's a simplified example of how a translation file should look:

```json
{
  "app": {
    "title": "Teto-Egen Personality Test",
    "description": "Discover your Teto-Egen personality type!"
  },
  "startScreen": {
    "mainTitle": "Teto-Egen Personality Test",
    "intro": "Find out if you're a Teto Man, Teto Woman, Egen Man, or Egen Woman through a survey and facial analysis!",
    "startButton": "Start Test"
  }
}
```

## Contact

If you have any questions or need clarification about the translation process, please contact the development team.

Thank you for contributing to making the Teto-Egen Personality Test accessible to users around the world!