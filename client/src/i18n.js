import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "DelhiConnect": "DelhiConnect",
      "Overview": "Overview",
      "All Complaints": "All Complaints",
      "All Grievances": "All Grievances",
      "Heatmap": "Heatmap",
      "Analytics": "Analytics",
      "Reports": "Reports",
      "What is DelhiConnect?": "What is DelhiConnect?",
      "Submit Complaint": "Submit Complaint",
      "My Complaints": "My Complaints",
      "Login": "Login",
      "Logout": "Logout",
      "CM Dashboard": "CM Dashboard",
      "CM Admin": "CM Admin",
      "Officer": "Officer",
      "Citizen": "Citizen"
    }
  },
  hi: {
    translation: {
      "DelhiConnect": "दिल्ली-कनेक्ट",
      "Overview": "अवलोकन",
      "All Complaints": "सभी शिकायतें",
      "All Grievances": "सभी लोक शिकायतें",
      "Heatmap": "हीटमैप",
      "Analytics": "एनालिटिक्स",
      "Reports": "रिपोर्ट्स",
      "What is DelhiConnect?": "दिल्ली-कनेक्ट क्या है?",
      "Submit Complaint": "शिकायत दर्ज करें",
      "My Complaints": "मेरी शिकायतें",
      "Login": "लॉग इन",
      "Logout": "लॉग आउट",
      "CM Dashboard": "सीएम डैशबोर्ड",
      "CM Admin": "सीएम एडमिन",
      "Officer": "अधिकारी",
      "Citizen": "नागरिक"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
