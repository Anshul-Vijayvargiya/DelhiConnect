// Shared constants used across the application

export const DELHI_DISTRICTS = [
  'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
  'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi',
  'South East Delhi', 'South West Delhi', 'West Delhi'
];

export const COMPLAINT_TYPES = [
  { id: 'garbage',     label: 'Garbage / Waste',       icon: '🗑️',  category: 'Sanitation',    priority: 'Medium', dept: 'MCD - Municipal Corporation' },
  { id: 'pothole',     label: 'Pothole / Road Damage',  icon: '🛣️',  category: 'Roads',         priority: 'High',   dept: 'PWD - Public Works Department' },
  { id: 'sewer',       label: 'Sewer Problem',          icon: '💧',  category: 'Sanitation',    priority: 'High',   dept: 'Delhi Jal Board' },
  { id: 'streetlight', label: 'Street Light',           icon: '💡',  category: 'Electricity',   priority: 'Medium', dept: 'BSES Yamuna / BSES Rajdhani / Tata Power' },
  { id: 'water',       label: 'Water Issue',            icon: '🚰',  category: 'Water Supply',  priority: 'High',   dept: 'Delhi Jal Board' },
  { id: 'health',      label: 'Health Issue',           icon: '🏥',  category: 'Health',        priority: 'High',   dept: 'Health Dept' },
  { id: 'dangerous',   label: 'Dangerous Condition',    icon: '⚠️',  category: 'Public Safety', priority: 'Critical', dept: 'Delhi Police' },
  { id: 'environment', label: 'Environment Issue',      icon: '🌿',  category: 'Parks',         priority: 'Medium', dept: 'MCD - Municipal Corporation' },
  { id: 'noise',       label: 'Noise Complaint',        icon: '🔊',  category: 'Public Safety', priority: 'Low',    dept: 'Delhi Police' },
  { id: 'police',      label: 'Police Issue',           icon: '🚔',  category: 'Public Safety', priority: 'High',   dept: 'Delhi Police' },
  { id: 'other',       label: 'Other',                  icon: '📋',  category: 'Other',         priority: 'Low',    dept: 'General Administration' },
];

export const CATEGORIES = [
  'Roads', 'Water Supply', 'Electricity', 'Sanitation',
  'Public Safety', 'Health', 'Parks', 'Education', 'Other'
];

export const EMERGENCY_CONTACTS = [
  { label: 'Police',          number: '100',  icon: '🚔', color: '#1A3A6B', desc: '24×7 Emergency' },
  { label: 'Ambulance',       number: '108',  icon: '🚑', color: '#DC2626', desc: 'Medical Emergency' },
  { label: 'Fire Services',   number: '101',  icon: '🚒', color: '#EA580C', desc: '24×7 Fire Brigade' },
  { label: 'Women Helpline',  number: '1091', icon: '👩', color: '#7C3AED', desc: 'Women Safety' },
  { label: 'CM Helpline',     number: '1076', icon: '🏛️', color: '#16A34A', desc: 'Grievance Support' },
  { label: 'Disaster Mgmt',   number: '1077', icon: '⛑️', color: '#D97706', desc: 'Natural Disaster' },
];

export const PUBLIC_SERVICES = [
  { id: 'property-tax',  label: 'Property Tax',      icon: '🏠', url: 'https://www.mcd.gov.in', desc: 'Pay & view property tax' },
  { id: 'birth-cert',   label: 'Birth Certificate', icon: '👶', url: 'https://delhigovt.nic.in', desc: 'Apply for birth certificate' },
  { id: 'death-cert',   label: 'Death Certificate', icon: '📋', url: 'https://delhigovt.nic.in', desc: 'Apply for death certificate' },
  { id: 'ration-card',  label: 'Ration Card',       icon: '🪪', url: 'https://nfs.delhi.gov.in', desc: 'Apply / modify ration card' },
  { id: 'driving-lic',  label: 'Driving Licence',   icon: '🚗', url: 'https://parivahan.gov.in', desc: 'Apply & renew licence' },
  { id: 'voter-id',     label: 'Voter ID',          icon: '🗳️', url: 'https://nvsp.in', desc: 'Register / update voter ID' },
  { id: 'water-conn',   label: 'Water Connection',  icon: '💧', url: 'https://djb.gov.in', desc: 'New water connection' },
  { id: 'elec-conn',    label: 'Power Connection',  icon: '⚡', url: 'https://bsesdelhi.com', desc: 'New electricity connection' },
];

export const NEARBY_FACILITY_TYPES = [
  { id: 'hospital',       label: 'Hospital',         icon: '🏥', query: 'hospital' },
  { id: 'police',         label: 'Police Station',   icon: '🚔', query: 'police station' },
  { id: 'railway',        label: 'Railway Station',  icon: '🚂', query: 'railway station' },
  { id: 'metro',          label: 'Metro Station',    icon: '🚇', query: 'metro station' },
  { id: 'park',           label: 'Park',             icon: '🌳', query: 'park' },
  { id: 'school',         label: 'School',           icon: '🏫', query: 'school' },
  { id: 'atm',            label: 'ATM',              icon: '🏧', query: 'ATM' },
  { id: 'pharmacy',       label: 'Pharmacy',         icon: '💊', query: 'pharmacy' },
];

export const DEPARTMENTS = [
  'PWD - Public Works Department',
  'Delhi Jal Board',
  'BSES Yamuna / BSES Rajdhani / Tata Power',
  'MCD - Municipal Corporation',
  'Delhi Police',
  'Education Dept',
  'General Administration'
];

export const STATUS_OPTIONS = ['Submitted', 'Assigned', 'In Progress', 'Resolved', 'Reopened', 'Closed', 'Rejected'];
export const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

export const CATEGORY_ICONS = {
  'Roads': '🛣️',
  'Water Supply': '💧',
  'Electricity': '⚡',
  'Sanitation': '🗑️',
  'Public Safety': '🚔',
  'Health': '🏥',
  'Parks': '🌳',
  'Education': '🏫',
  'Other': '📋'
};

export const STATUS_COLORS = {
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Submitted': 'bg-slate-100 text-slate-700 border border-slate-200',
  'Assigned': 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-orange-100 text-orange-700',
  'Resolved': 'bg-emerald-100 text-emerald-800',
  'Reopened': 'bg-purple-100 text-purple-800 animate-pulse',
  'Closed': 'bg-green-100 text-green-800 font-semibold',
  'Rejected': 'bg-red-100 text-red-800',
};

export const PRIORITY_COLORS = {
  'Critical': 'bg-red-100 text-red-800',
  'High': 'bg-orange-100 text-orange-700',
  'Medium': 'bg-yellow-100 text-yellow-700',
  'Low': 'bg-slate-100 text-slate-600',
};

export const SLA_HOURS = { Critical: 4, High: 24, Medium: 72, Low: 168 };
