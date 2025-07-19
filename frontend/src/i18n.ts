import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // Çeviri dosyalarını backend'den (veya public klasöründen) yükler
  .use(LanguageDetector) // Tarayıcı dilini algılar
  .use(initReactI18next) // i18n'i react-i18next ile bağlar
  .init({
    supportedLngs: ['tr', 'en', 'ar'], // Desteklenen diller
    fallbackLng: "tr", // Eğer algılanan dil desteklenmiyorsa kullanılacak varsayılan dil
    debug: process.env.NODE_ENV === 'development', // Geliştirme ortamında debug mesajları
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'], // Dil seçimini nerede saklayacağı
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Çeviri dosyalarının yolu
    },
    react: {
      useSuspense: false // İçerik yüklenirken Suspense kullanılıp kullanılmayacağı
    }
  });

export default i18n; 