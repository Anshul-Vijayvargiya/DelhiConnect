const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock');

async function categorizeComplaint(text) {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'mock') {
    // Return mock data if no API key
    return {
      category: 'Roads',
      subCategory: 'Pothole',
      priority: 'Medium',
      assignDepartment: 'PWD - Public Works Department',
      confidence: 0.85,
      reason: 'Mock AI response - configure GEMINI_API_KEY for real AI'
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a civic complaint classifier for Delhi Government.
Analyze this complaint and return ONLY a valid JSON object (no markdown, no explanation):
{
  "category": "one of [Roads, Water Supply, Electricity, Sanitation, Public Safety, Health, Parks, Education, Other]",
  "subCategory": "specific sub-type string",
  "priority": "one of [Low, Medium, High, Critical]",
  "assignDepartment": "relevant Delhi department name",
  "confidence": 0.0,
  "reason": "brief explanation"
}

Complaint: ${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON in response');
  } catch (err) {
    console.error('Gemini AI Error:', err.message);
    return {
      category: 'Other',
      subCategory: 'General',
      priority: 'Medium',
      assignDepartment: 'General Administration',
      confidence: 0.5,
      reason: 'AI categorization failed - manual review required'
    };
  }
}

module.exports = { categorizeComplaint };
