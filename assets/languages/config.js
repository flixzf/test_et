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
      flag: "gb",
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
      flag: "cn",
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
      flag: "in",
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
      flag: "es",
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
      flag: "fr",
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
      flag: "sa",
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
      flag: "bd",
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
      flag: "ru",
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
      flag: "pt",
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
      flag: "id",
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
      flag: "pk",
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
      flag: "de",
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
      flag: "jp",
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
      flag: "tz",
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
      flag: "kr",
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