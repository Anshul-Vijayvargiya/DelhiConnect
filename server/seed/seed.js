require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Department = require('../models/Department');

const DELHI_DISTRICTS = [
  'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
  'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi',
  'South East Delhi', 'South West Delhi', 'West Delhi'
];

const DELHI_COORDS = {
  'Central Delhi': { lat: 28.6459, lng: 77.2151 },
  'East Delhi': { lat: 28.6508, lng: 77.2988 },
  'New Delhi': { lat: 28.6139, lng: 77.2090 },
  'North Delhi': { lat: 28.7041, lng: 77.1025 },
  'North East Delhi': { lat: 28.6980, lng: 77.2847 },
  'North West Delhi': { lat: 28.7219, lng: 77.1204 },
  'Shahdara': { lat: 28.6770, lng: 77.2913 },
  'South Delhi': { lat: 28.5291, lng: 77.2161 },
  'South East Delhi': { lat: 28.5355, lng: 77.2648 },
  'South West Delhi': { lat: 28.5726, lng: 77.0625 },
  'West Delhi': { lat: 28.6541, lng: 77.0879 }
};

const CATEGORIES = ['Roads', 'Water Supply', 'Electricity', 'Sanitation', 'Public Safety', 'Health', 'Parks', 'Education', 'Other'];
const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const DEPARTMENTS = [
  { name: 'PWD - Public Works Department', categories: ['Roads', 'Parks'], districts: DELHI_DISTRICTS },
  { name: 'Delhi Jal Board', categories: ['Water Supply'], districts: DELHI_DISTRICTS },
  { name: 'BSES Yamuna / BSES Rajdhani / Tata Power', categories: ['Electricity'], districts: DELHI_DISTRICTS },
  { name: 'MCD - Municipal Corporation', categories: ['Sanitation', 'Health', 'Other'], districts: DELHI_DISTRICTS },
  { name: 'Delhi Police', categories: ['Public Safety'], districts: DELHI_DISTRICTS },
  { name: 'Education Dept', categories: ['Education'], districts: DELHI_DISTRICTS }
];

const SAMPLE_COMPLAINTS = [
  { title: 'Large pothole on main road causing accidents', category: 'Roads', subCategory: 'Pothole' },
  { title: 'No water supply for 3 days in our area', category: 'Water Supply', subCategory: 'No Supply' },
  { title: 'Streetlight not working since last month', category: 'Electricity', subCategory: 'Streetlight' },
  { title: 'Garbage not collected for a week', category: 'Sanitation', subCategory: 'Garbage Collection' },
  { title: 'Illegal construction blocking emergency exit', category: 'Public Safety', subCategory: 'Illegal Construction' },
  { title: 'Government hospital running out of medicines', category: 'Health', subCategory: 'Medicine Shortage' },
  { title: 'Park damaged and not maintained', category: 'Parks', subCategory: 'Maintenance' },
  { title: 'School building in dangerous condition', category: 'Education', subCategory: 'Infrastructure' },
  { title: 'Sewer overflow on residential street', category: 'Sanitation', subCategory: 'Sewer' },
  { title: 'Broken water pipeline wasting water', category: 'Water Supply', subCategory: 'Pipeline Leak' },
  { title: 'Road divider damaged causing accidents', category: 'Roads', subCategory: 'Divider' },
  { title: 'Power cuts for 8 hours daily', category: 'Electricity', subCategory: 'Power Cut' },
  { title: 'Stray dogs attacking residents', category: 'Public Safety', subCategory: 'Stray Animals' },
  { title: 'Open manhole dangerous for pedestrians', category: 'Sanitation', subCategory: 'Manhole' },
  { title: 'Tree fallen on road blocking traffic', category: 'Roads', subCategory: 'Tree Fall' },
];

function randomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysBack));
  return d;
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/delhiconnect');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([Complaint.deleteMany({}), User.deleteMany({}), Department.deleteMany({})]);
    console.log('🗑️ Cleared existing data');

    // Create admin
    const adminHash = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      name: 'CM Admin', email: 'admin@delhi.gov.in',
      passwordHash: adminHash, role: 'admin', district: 'New Delhi'
    });

    // Create citizen
    const citizenHash = await bcrypt.hash('citizen123', 12);
    const citizen = await User.create({
      name: 'Anshul Vijayvargiya', phone: '+919876543210', email: 'citizen@delhi.gov.in',
      passwordHash: citizenHash, role: 'citizen', district: 'Central Delhi'
    });

    // Create officers
    const officerData = [
      { name: 'Rajesh Kumar', email: 'officer.roads@delhi.gov.in', department: 'PWD - Public Works Department', district: 'South Delhi' },
      { name: 'Priya Sharma', email: 'officer.water@delhi.gov.in', department: 'Delhi Jal Board', district: 'East Delhi' },
      { name: 'Amit Singh', email: 'officer.sanitation@delhi.gov.in', department: 'MCD - Municipal Corporation', district: 'North Delhi' },
      { name: 'Sunita Verma', email: 'officer.police@delhi.gov.in', department: 'Delhi Police', district: 'Central Delhi' },
      { name: 'Vikram Patel', email: 'officer.power@delhi.gov.in', department: 'BSES Yamuna / BSES Rajdhani / Tata Power', district: 'West Delhi' },
    ];

    const officerHash = await bcrypt.hash('officer123', 12);
    const officers = await User.insertMany(
      officerData.map(o => ({ ...o, passwordHash: officerHash, role: 'officer' }))
    );
    console.log(`✅ Created ${officers.length + 2} accounts`);

    // Create departments
    const depts = await Department.insertMany(
      DEPARTMENTS.map((d, i) => ({ ...d, headOfficer: officers[Math.min(i, officers.length - 1)]._id }))
    );
    console.log(`✅ Created ${depts.length} departments`);

    // Create 200 complaints
    const complaints = [];
    const citizenPhone = '+919876543210';

    for (let i = 0; i < 200; i++) {
      const district = randomElement(DELHI_DISTRICTS);
      const baseCoords = DELHI_COORDS[district];
      const sample = randomElement(SAMPLE_COMPLAINTS);
      const priority = randomElement(PRIORITIES);
      const status = randomElement(STATUSES);
      const slaHours = { Critical: 4, High: 24, Medium: 72, Low: 168 }[priority];
      const createdAt = randomDate(90);
      const slaDeadline = new Date(createdAt.getTime() + slaHours * 3600000);
      const resolvedAt = status === 'Resolved' ? new Date(createdAt.getTime() + randomInt(1, slaHours * 2) * 3600000) : undefined;
      const dept = DEPARTMENTS.find(d => d.categories.includes(sample.category));
      const officer = officers.find(o => o.department === dept?.name);

      complaints.push({
        ...sample,
        description: `${sample.title}. This is causing major inconvenience to residents of ${district}. Immediate attention requested.`,
        status,
        priority,
        district,
        ward: `Ward ${randomInt(1, 30)}`,
        address: `${randomInt(1, 200)}, Block ${randomElement(['A', 'B', 'C', 'D', 'E'])}, ${district}`,
        coordinates: {
          lat: baseCoords.lat + (Math.random() - 0.5) * 0.05,
          lng: baseCoords.lng + (Math.random() - 0.5) * 0.05
        },
        citizenId: citizen._id,
        citizenPhone,
        citizenName: `Citizen ${i + 1}`,
        assignedDepartment: dept?.name,
        assignedOfficerId: status !== 'Pending' ? officer?._id : undefined,
        slaDeadline,
        slaBreached: status !== 'Resolved' && new Date() > slaDeadline,
        resolvedAt,
        aiConfidenceScore: Math.random() * 0.4 + 0.6,
        aiCategory: sample.category,
        aiPriority: priority,
        aiReason: `Auto-classified based on complaint content`,
        createdAt,
        updatedAt: createdAt,
        statusHistory: [
          { status: 'Pending', changedByName: `Citizen ${i + 1}`, changedAt: createdAt, notes: 'Submitted' }
        ]
      });
    }

    await Complaint.insertMany(complaints);
    console.log('✅ Inserted 200 complaints');

    console.log('\n🎉 Seed complete!');
    console.log('═══════════════════════════════════════');
    console.log('Admin Login:   admin@delhi.gov.in / admin123');
    console.log('Officer Login: officer.roads@delhi.gov.in / officer123');
    console.log('Citizen Login: +919876543210 / citizen123');
    console.log('═══════════════════════════════════════');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
