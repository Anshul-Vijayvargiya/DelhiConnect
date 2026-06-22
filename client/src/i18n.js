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
      "Citizen": "Citizen",
      
      // Layout & Header
      "All Grievances Feed": "All Grievances Feed",
      "CM Dashboard — Overview": "CM Dashboard — Overview",
      
      // Tabs & Navigation
      "Nearby (2km)": "Nearby (2km)",
      "City Feed": "City Feed",
      "Yours": "Yours",
      
      // Badges & Statuses
      "Submitted": "Submitted",
      "Pending": "Pending",
      "Assigned": "Assigned",
      "In Progress": "In Progress",
      "Resolved": "Resolved",
      "Closed": "Closed",
      "Reopened": "Reopened",
      "Rejected": "Rejected",
      "Low": "Low",
      "Medium": "Medium",
      "High": "High",
      "Critical": "Critical",
      "SLA Breached": "SLA Breached",
      "AI": "AI",
      "Overdue": "Overdue",
      "New / Un-Assigned": "New / Un-Assigned",
      "Closed / Complied": "Closed / Complied",
      "Hotspot": "Hotspot",
      
      // Action Buttons
      "Vote Up": "Vote Up",
      "Comment": "Comment",
      "Share": "Share",
      "Track": "Track",
      "Reset": "Reset",
      "View": "View",
      "Post": "Post",
      
      // Filters
      "Status": "Status",
      "District": "District",
      "Category": "Category",
      "Priority": "Priority",
      "Search": "Search",
      "All Status": "All Status",
      "All Districts": "All Districts",
      "All": "All",
      "Search complaints...": "Search complaints...",
      
      // Table Headers & Details
      "Complaint": "Complaint",
      "Department": "Department",
      "Filed": "Filed",
      "Phone": "Phone",
      "Address": "Address",
      "Assign Department": "Assign Department",
      "Update Status": "Update Status",
      "Timeline": "Timeline",
      
      // Departments
      "PWD - Public Works Department": "PWD - Public Works Department",
      "Delhi Jal Board": "Delhi Jal Board",
      "BSES Yamuna / BSES Rajdhani / Tata Power": "BSES Yamuna / BSES Rajdhani / Tata Power",
      "MCD - Municipal Corporation": "MCD - Municipal Corporation",
      "Delhi Police": "Delhi Police",
      "Education Dept": "Education Dept",
      
      // Districts
      "Central Delhi": "Central Delhi",
      "East Delhi": "East Delhi",
      "New Delhi": "New Delhi",
      "North Delhi": "North Delhi",
      "North East Delhi": "North East Delhi",
      "North West Delhi": "North West Delhi",
      "Shahdara": "Shahdara",
      "South Delhi": "South Delhi",
      "South East Delhi": "South East Delhi",
      "South West Delhi": "South West Delhi",
      "West Delhi": "West Delhi",
      
      // KPI Cards
      "Total Complaints": "Total Complaints",
      "Pending & Assigned": "Pending & Assigned",
      "Resolved/Closed/Rejected": "Resolved/Closed/Rejected",
      "Avg Resolution": "Avg Resolution",
      "Citizen Satisfaction": "Citizen Satisfaction",
      "Active Hotspots": "Active Hotspots",
      "Resolution Rate": "Resolution Rate",
      
      // Text strings
      "GPS Location Coordinates": "GPS Location Coordinates",
      "Enable GPS": "Enable GPS",
      "Use Connaught Place": "Use Connaught Place",
      "Refresh Location": "Refresh Location",
      "Neighborhood Hotspot": "Neighborhood Hotspot",
      "Reports": "Reports",
      "Discussion": "Discussion",
      "Write a comment...": "Write a comment...",
      "No grievances found": "No grievances found",
      "Loading...": "Loading...",
      "No complaints yet": "No complaints yet",
      "Submit First Complaint": "Submit First Complaint",
      "Not assigned": "Not assigned",
      
      // Heatmap keys
      "Complaint Heatmap — Delhi NCT": "Complaint Heatmap — Delhi NCT",
      "Filter by Category": "Filter by Category",
      "All Categories": "All Categories",
      "complaint locations": "complaint locations",
      "Heatmap Intensity (Weight)": "Heatmap Intensity (Weight)",
      "Critical / Hotspot": "Critical / Hotspot",
      "High Priority": "High Priority",
      "Medium Priority": "Medium Priority",
      "Low Priority": "Low Priority",
      "Loading map data...": "Loading map data...",
      "This ticket is a hotspot merging multiple similar complaints in the area.": "This ticket is a hotspot merging multiple similar complaints in the area."
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
      "Citizen": "नागरिक",
      
      // Layout & Header
      "All Grievances Feed": "सभी लोक शिकायतें फ़ीड",
      "CM Dashboard — Overview": "सीएम डैशबोर्ड — अवलोकन",
      
      // Tabs & Navigation
      "Nearby (2km)": "आसपास (2 किमी)",
      "City Feed": "शहर फ़ीड",
      "Yours": "आपकी",
      
      // Badges & Statuses
      "Submitted": "जमा किया गया",
      "Pending": "लंबित",
      "Assigned": "सौंपा गया",
      "In Progress": "प्रगति पर",
      "Resolved": "हल किया गया",
      "Closed": "बंद",
      "Reopened": "पुनः खोला गया",
      "Rejected": "अस्वीकृत",
      "Low": "कम",
      "Medium": "मध्यम",
      "High": "उच्च",
      "Critical": "गंभीर",
      "SLA Breached": "SLA उल्लंघन",
      "AI": "एआई",
      "Overdue": "विलंबित",
      "New / Un-Assigned": "नया / असूचीबद्ध",
      "Closed / Complied": "बंद / अनुपालन",
      "Hotspot": "हॉटस्पॉट",
      
      // Action Buttons
      "Vote Up": "वोट करें",
      "Comment": "टिप्पणी",
      "Share": "साझा करें",
      "Track": "ट्रैक करें",
      "Reset": "रीसेट",
      "View": "देखें",
      "Post": "पोस्ट करें",
      
      // Filters
      "Status": "स्थिति",
      "District": "जिला",
      "Category": "श्रेणी",
      "Priority": "प्राथमिकता",
      "Search": "खोजें",
      "All Status": "सभी स्थितियां",
      "All Districts": "सभी जिले",
      "All": "सभी",
      "Search complaints...": "शिकायतें खोजें...",
      
      // Table Headers & Details
      "Complaint": "शिकायत",
      "Department": "विभाग",
      "Filed": "दर्ज किया गया",
      "Phone": "फ़ोन",
      "Address": "पता",
      "Assign Department": "विभाग सौंपें",
      "Update Status": "स्थिति अपडेट करें",
      "Timeline": "समय-सीमा",
      
      // Departments
      "PWD - Public Works Department": "लोक निर्माण विभाग (PWD)",
      "Delhi Jal Board": "दिल्ली जल बोर्ड",
      "BSES Yamuna / BSES Rajdhani / Tata Power": "बीएसईएस / टाटा पावर",
      "MCD - Municipal Corporation": "दिल्ली नगर निगम (MCD)",
      "Delhi Police": "दिल्ली पुलिस",
      "Education Dept": "शिक्षा विभाग",
      
      // Districts
      "Central Delhi": "मध्य दिल्ली",
      "East Delhi": "पूर्वी दिल्ली",
      "New Delhi": "नई दिल्ली",
      "North Delhi": "उत्तरी दिल्ली",
      "North East Delhi": "उत्तर पूर्वी दिल्ली",
      "North West Delhi": "उत्तर पश्चिमी दिल्ली",
      "Shahdara": "शाहदरा",
      "South Delhi": "दक्षिणी दिल्ली",
      "South East Delhi": "दक्षिण पूर्वी दिल्ली",
      "South West Delhi": "दक्षिण पश्चिमी दिल्ली",
      "West Delhi": "पश्चिमी दिल्ली",
      
      // KPI Cards
      "Total Complaints": "कुल शिकायतें",
      "Pending & Assigned": "लंबित और सौंपे गए",
      "Resolved/Closed/Rejected": "हल/बंद/अस्वीकृत",
      "Avg Resolution": "औसत समाधान",
      "Citizen Satisfaction": "नागरिक संतुष्टि",
      "Active Hotspots": "सक्रिय हॉटस्पॉट",
      "Resolution Rate": "समाधान दर",
      
      // Text strings
      "GPS Location Coordinates": "जीपीएस स्थान निर्देशांक",
      "Enable GPS": "जीपीएस सक्षम करें",
      "Use Connaught Place": "कनॉट प्लेस का उपयोग करें",
      "Refresh Location": "स्थान ताज़ा करें",
      "Neighborhood Hotspot": "पड़ोस हॉटस्पॉट",
      "Reports": "रिपोर्ट",
      "Discussion": "चर्चा",
      "Write a comment...": "टिप्पणी लिखें...",
      "No grievances found": "कोई लोक शिकायत नहीं मिली",
      "Loading...": "लोड हो रहा है...",
      "No complaints yet": "अभी तक कोई शिकायत नहीं",
      "Submit First Complaint": "पहली शिकायत दर्ज करें",
      "Not assigned": "सौंपा नहीं गया",
      
      // Heatmap keys
      "Complaint Heatmap — Delhi NCT": "शिकायत हीटमैप — दिल्ली एनसीटी",
      "Filter by Category": "श्रेणी द्वारा फ़िल्टर करें",
      "All Categories": "सभी श्रेणियां",
      "complaint locations": "शिकायत स्थान",
      "Heatmap Intensity (Weight)": "हीटमैप तीव्रता (भार)",
      "Critical / Hotspot": "गंभीर / हॉटस्पॉट",
      "High Priority": "उच्च प्राथमिकता",
      "Medium Priority": "मध्यम प्राथमिकता",
      "Low Priority": "कम प्राथमिकता",
      "Loading map data...": "मानचित्र डेटा लोड हो रहा है...",
      "This ticket is a hotspot merging multiple similar complaints in the area.": "यह टिकट एक पड़ोस हॉटस्पॉट है जो क्षेत्र में कई समान शिकायतों को मर्ज करता है।"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
