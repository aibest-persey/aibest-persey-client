import i18n from "i18next";

// 🎯 Ticket #34 Acceptance Criteria: i18n framework wired with at least 2 locales
const resources = {
  en: {
    translation: {
      settingsTitle: "Settings Profile",
      languageLabel: "Application Language",
      notificationsHeader: "Notification Preferences",
      emailNotify: "Receive Email Alerts",
      pushNotify: "Receive Desktop Push Notifications",
      saveBtn: "Save Configurations",
      successMsg: "Preferences updated locally and synchronized to profile matrix.",
      errorMsg: "Failed to persist account setting updates."
    }
  },
  bg: {
    translation: {
      settingsTitle: "Профилни Настройки",
      languageLabel: "Език на Приложението",
      notificationsHeader: "Предпочитания за Известия",
      emailNotify: "Получаване на Имейл Известия",
      pushNotify: "Получаване на Пуш Известия на Екрана",
      saveBtn: "Запази Конфигурациите",
      successMsg: "Предпочитанията са актуализирани и синхронизирани с профила.",
      errorMsg: "Възникна грешка при запазване на настройките."
    }
  }
};

i18n.init({
  resources,
  lng: localStorage.getItem("app_lang") || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false // React already safely escapes output strings
  }
});

export default i18n;
