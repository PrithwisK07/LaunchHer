const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// We define exactly what we want the AI to give us back
const schema = {
    type: SchemaType.OBJECT,
    properties: {
        businessName: { 
            type: SchemaType.STRING, 
            description: "The name of the business. If not provided, suggest a professional one based on their name/activity." 
        },
        nicCode: { 
            type: SchemaType.STRING, 
            description: "The official 4-digit Indian Udyam NIC code that best matches the business activity described." 
        }
    },
    required: ["businessName", "nicCode"]
};

// Initialize the fast, free tier model
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
    }
});

async function extractBusinessDetails(userMessage) {
    const prompt = `
    You are an expert Indian business formalization assistant. 
    Analyze the user's message, extract their business details, and determine the correct 4-digit NIC code for Udyam registration.
    User Message: "${userMessage}"
    `;

    const result = await model.generateContent(prompt);
    // The response is guaranteed to be a JSON string matching our schema
    return JSON.parse(result.response.text());
}

module.exports = { extractBusinessDetails };