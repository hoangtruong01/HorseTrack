import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: {
        notifications: "Notifications",
        profile: "Profile",
        settings: "Settings",
      },
      settings: {
        title: "Settings",
        subtitle: "Manage display and language preferences for HorseTrack.",
        themeTitle: "Theme",
        themeHint: "Choose light or dark mode.",
        themeLight: "Light",
        themeDark: "Dark",
        languageTitle: "Language",
        languageHint: "Select your preferred language.",
        languageEnglish: "English",
        languageVietnamese: "Vietnamese",
      },
    },
  },
  vi: {
    translation: {
      nav: {
        notifications: "Thông báo",
        profile: "Hồ sơ",
        settings: "Cài đặt",
      },
      settings: {
        title: "Cài đặt",
        subtitle: "Quản lý giao diện và ngôn ngữ cho HorseTrack.",
        themeTitle: "Giao diện",
        themeHint: "Chọn chế độ sáng hoặc tối.",
        themeLight: "Sáng",
        themeDark: "Tối",
        languageTitle: "Ngôn ngữ",
        languageHint: "Chọn ngôn ngữ hiển thị.",
        languageEnglish: "Tiếng Anh",
        languageVietnamese: "Tiếng Việt",
      },
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "vi",
    fallbackLng: "vi",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
