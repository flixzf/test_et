/**
 * Language configuration file for the Teto-Egen personality test application
 * Contains definitions for the top 15 most spoken languages globally
 */

const languageConfig = {
  // Default language
  defaultLanguage: 'ko',
  
  // Supported languages
  supportedLanguages: [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇬🇧",
      rtl: false,
      dateFormat: "MM/DD/YYYY",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "zh",
      name: "Chinese",
      nativeName: "中文",
      flag: "🇨🇳",
      rtl: false,
      dateFormat: "YYYY/MM/DD",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "hi",
      name: "Hindi",
      nativeName: "हिन्दी",
      flag: "🇮🇳",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "es",
      name: "Spanish",
      nativeName: "Español",
      flag: "🇪🇸",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ",",
        thousands: "."
      }
    },
    {
      code: "fr",
      name: "French",
      nativeName: "Français",
      flag: "🇫🇷",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ",",
        thousands: " "
      }
    },
    {
      code: "ar",
      name: "Arabic",
      nativeName: "العربية",
      flag: "🇸🇦",
      rtl: true,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: "٫",
        thousands: "٬"
      }
    },
    {
      code: "bn",
      name: "Bengali",
      nativeName: "বাংলা",
      flag: "🇧🇩",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "ru",
      name: "Russian",
      nativeName: "Русский",
      flag: "🇷🇺",
      rtl: false,
      dateFormat: "DD.MM.YYYY",
      numberFormat: {
        decimal: ",",
        thousands: " "
      }
    },
    {
      code: "pt",
      name: "Portuguese",
      nativeName: "Português",
      flag: "🇵🇹",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ",",
        thousands: "."
      }
    },
    {
      code: "id",
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      flag: "🇮🇩",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ",",
        thousands: "."
      }
    },
    {
      code: "ur",
      name: "Urdu",
      nativeName: "اردو",
      flag: "🇵🇰",
      rtl: true,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "de",
      name: "German",
      nativeName: "Deutsch",
      flag: "🇩🇪",
      rtl: false,
      dateFormat: "DD.MM.YYYY",
      numberFormat: {
        decimal: ",",
        thousands: "."
      }
    },
    {
      code: "ja",
      name: "Japanese",
      nativeName: "日本語",
      flag: "🇯🇵",
      rtl: false,
      dateFormat: "YYYY/MM/DD",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "sw",
      name: "Swahili",
      nativeName: "Kiswahili",
      flag: "🇹🇿",
      rtl: false,
      dateFormat: "DD/MM/YYYY",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    },
    {
      code: "ko",
      name: "Korean",
      nativeName: "한국어",
      flag: "🇰🇷",
      rtl: false,
      dateFormat: "YYYY.MM.DD",
      numberFormat: {
        decimal: ".",
        thousands: ","
      }
    }
  ],
  
  // Translation file path template
  translationFilePath: 'assets/languages/{lang}.json',
  
  // Storage key for saving language preference
  storageKey: 'teto-egen-language-preference'
};

// Export the language configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = languageConfig;
} else {
  // For browser environment
  window.languageConfig = languageConfig;
}