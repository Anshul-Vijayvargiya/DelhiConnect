const axios = require('axios');

async function run() {
  try {
    // 1. Sign our own token
    console.log('Signing token...');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: '6a34f0c1a184dda64bdbd3b4', role: 'officer' }, // Real officer ID
      'delhi_cm_dashboard_super_secret_2024',
      { expiresIn: '1d' }
    );
    console.log('Got token:', token ? 'Yes' : 'No');

    const complaintId = '6a34f0c1a184dda64bdbd3bf';
    console.log(`Testing with complaint ID: ${complaintId}`);

    // 3. Update status
    console.log('Updating status...');
    const updateRes = await axios.patch(`http://localhost:5000/api/complaints/${complaintId}/status`, {
      status: 'In Progress',
      notes: 'Officer is on the way'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Success:', updateRes.status);
    console.log('Response:', updateRes.data);
  } catch (err) {
    console.error('Error occurred!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
  }
}

run();
