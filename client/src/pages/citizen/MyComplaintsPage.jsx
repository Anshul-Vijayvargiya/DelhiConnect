import { useEffect, useState } from 'react';
import { complaintsAPI } from '../../services/api';
import { StatusBadge, PriorityBadge } from '../../components/Badges';
import { timeAgo } from '../../utils/helpers';
import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';

export default function MyComplaintsPage() {
  const { t, i18n } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const translateComplaintText = (text) => {
    if (!text) return '';
    let translated = text;
    const translations = {
      'Large pothole on main road causing accidents': 'मुख्य सड़क पर बड़ा गड्ढा दुर्घटनाओं का कारण',
      'No water supply for 3 days in our area': 'हमारे क्षेत्र में 3 दिनों से पानी की आपूर्ति नहीं',
      'Streetlight not working since last month': 'पिछले महीने से स्ट्रीटलाइट काम नहीं कर रही है',
      'Garbage not collected for a week': 'एक सप्ताह से कचरा नहीं उठाया गया',
      'Illegal construction blocking emergency exit': 'आपातकालीन निकास को अवरुद्ध करने वाला अवैध निर्माण',
      'Government hospital running out of medicines': 'सरकारी अस्पताल में दवाइयों की कमी',
      'Park damaged and not maintained': 'पार्क क्षतिग्रस्त और रखरखाव न होना',
      'School building in dangerous condition': 'स्कूल भवन खतरनाक स्थिति में',
      'Sewer overflow on residential street': 'आवासीय सड़क पर सीवर का पानी बहना',
      'Broken water pipeline wasting water': 'टूटी पानी की पाइपलाइन से पानी बर्बाद',
      'Road divider damaged causing accidents': 'सड़क विभाजक क्षतिग्रस्त दुर्घटनाओं का कारण',
      'Power cuts for 8 hours daily': 'रोजाना 8 घंटे बिजली कटौती',
      'Stray dogs attacking residents': 'आवारा कुत्ते निवासियों पर हमला कर रहे हैं',
      'Open manhole dangerous for pedestrians': 'पैदल यात्रियों के लिए खुला मैनहोल खतरनाक',
      'Tree fallen on road blocking traffic': 'सड़क पर पेड़ गिरने से यातायात बाधित'
    };

    for (const [key, value] of Object.entries(translations)) {
      if (translated.includes(key)) {
        if (i18n.language === 'hi') {
          translated = translated.replace(key, value);
          translated = translated.replace(/\bat Block\b/gi, 'ब्लॉक');
          translated = translated.replace(/\bnear street\b/gi, 'गली के पास');
        }
        break;
      }
    }
    return translated;
  };

  useEffect(() => {
    complaintsAPI.list({ limit: 50 })
      .then(r => setComplaints(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="My Complaints">
      <div className="max-w-3xl space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">{t('Loading...')}</div>
        ) : complaints.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="font-semibold text-slate-700">{t('No complaints yet')}</h3>
            <a href="/" className="mt-4 inline-block btn-primary">{t('Submit First Complaint')}</a>
          </div>
        ) : complaints.map(c => (
          <div key={c._id} className="card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">{translateComplaintText(c.title)}</h3>
                <p className="text-xs text-slate-400 mt-0.5">#{String(c._id).slice(-6).toUpperCase()} · {timeAgo(c.createdAt)}</p>
                <p className="text-sm text-slate-500 mt-1">{t(c.district)} {c.ward && `· ${c.ward}`}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={c.status} />
                <PriorityBadge priority={c.priority} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-slate-400">{c.assignedDepartment ? t(c.assignedDepartment) : t('Not assigned')}</span>
              <a href={`/track/${c.grievanceId || `GR-${String(c._id).slice(-5).toUpperCase()}`}`} className="text-sm text-blue-700 hover:underline font-medium">
                {t('Track')} →
              </a>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
