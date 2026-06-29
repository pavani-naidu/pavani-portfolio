"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeSentiment = exports.generateJournalSummary = exports.generateChatResponse = void 0;
const generative_ai_1 = require("@google/generative-ai");
// Initialize the Gemini API client if key is provided
const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new generative_ai_1.GoogleGenerativeAI(apiKey) : null;
// System prompts defining YuviMantra AI's personality
const CHAT_SYSTEM_INSTRUCTION = `
You are YuviMantra AI, a warm, empathetic, and respectful emotional wellness, productivity, and study companion for students.
Your tagline is "A Friend Who Listens. An AI That Cares."
Your primary role is to act as a supportive, encouraging, and completely non-judgmental friend.

GUIDELINES:
1. Speak naturally and warmly. Avoid cold, clinical, or overly formal language. Use words of encouragement.
2. Clearly make it known that you are an AI companion, NOT a therapist, psychologist, or medical doctor.
3. If a student is in immediate danger, distress, or expresses thoughts of self-harm/suicide, respond with profound empathy, prioritize their safety, and strongly encourage them to reach out to trusted adults, professional counselors, or local emergency services/crisis hotlines. Do not try to diagnose or treat them.
4. Help them with stress, study pressure, time management, building confidence, productivity methods (like Pomodoro), preparing for exams, exam anxiety, sleep hygiene, and daily motivation.
5. Use clean Markdown formatting with bullet points and bold text where helpful, but keep response sizes readable and conversational.
`;
// Simulated fallback answers for offline development
const SIMULATED_RESPONSES = [
    "I hear you, and I'm here for you. Being a student can be really overwhelming sometimes. What's on your mind right now?",
    "That sounds like a lot to carry. Remember to take a deep breath. Let's take things one small step at a time. How can I support you with this?",
    "I completely understand why you'd feel that way. It's okay to feel stressed. Have you taken a break or had some water recently?",
    "You are doing the best you can, and that is more than enough! I'm here to listen whenever you need to vent or map out a plan.",
    "Let's break this study load down together. A quick Pomodoro session (25 minutes of focus, 5 minutes of rest) might help you get started. Should we set a goal?",
];
const SIMULATED_SUMMARIES = [
    "You reflected on your current stress levels and noted the importance of taking breaks. It shows great self-awareness.",
    "You shared your feelings about academic challenges. Remember to celebrate your small victories along the way.",
    "A thoughtful entry about finding balance in your routine. Sticking to healthy habits will helper you build long-term resilience.",
    "You expressed some exhaustion today. Please prioritize a restful night's sleep and gentle self-care.",
];
const getLocalSimulatedResponse = (newMessage) => {
    const text = newMessage.toLowerCase();
    // 1. Suicide / Self-Harm Safety Checks
    if (text.includes('suicide') ||
        text.includes('self-harm') ||
        text.includes('kill myself') ||
        text.includes('end my life') ||
        text.includes('hurt myself')) {
        return "I'm so sorry you're feeling this way, but please know that you are not alone and there is support available. Because I'm an AI companion, I can't provide the professional support you deserve. Please reach out to someone you trust, or contact a local crisis hotline or emergency services right now. People who care want to help you through this.";
    }
    // 2. Relationship / Ex / Breakup Checks
    if (text.includes('ex') ||
        text.includes('breakup') ||
        text.includes('relationship') ||
        text.includes('girlfriend') ||
        text.includes('boyfriend') ||
        text.includes('crush') ||
        text.includes('divorce')) {
        return "Seeing an ex or managing relationship feelings can be really tough and bring up unexpected emotions. It's completely natural to feel thrown off balance by that. Be gentle with yourself. Do you want to share what thoughts are coming up for you, or do you need a distraction?";
    }
    // 3. Support Checks
    if (text.includes('support') ||
        text.includes('help me') ||
        text.includes('need help') ||
        text.includes('companion')) {
        return "I am right here by your side. Whatever is happening, we can take it one small step at a time. What is the main thing that feels heavy or challenging for you right now? I'm ready to listen.";
    }
    // 3.5 Sickness / Fever / Rest Ideas Checks
    if (text.includes('fever') ||
        text.includes('sick') ||
        text.includes('cold') ||
        text.includes('flu') ||
        text.includes('ill') ||
        text.includes('headache') ||
        text.includes('rest') ||
        text.includes('sleep') ||
        text.includes('tired')) {
        if (text.includes('rest') || text.includes('sleep') || text.includes('tired')) {
            return "Rest is essential to heal. Some gentle ideas to rest your mind and body:\n\n1. Do a 5-minute deep breathing session in our Meditation room.\n2. Put away all screens and rest your eyes in a dark room.\n3. Drink warm water or herbal tea.\n4. Take a warm shower to relax your muscles.\n\nPlease don't force yourself to study today. Your body needs sleep!";
        }
        return "I'm really sorry to hear you're feeling sick! Getting a fever is a clear sign your body needs to rest. Please prioritize warm liquids, stay hydrated, and try to sleep. Let go of study tasks for today—healing is your number one priority right now. Have you checked your temperature or taken any medicine?";
    }
    // 4. Emotional Sadness / Grief Checks
    if (text.includes('sad') ||
        text.includes('unhappy') ||
        text.includes('depressed') ||
        text.includes('cry') ||
        text.includes('lonely') ||
        text.includes('hurt')) {
        return "I hear you, and it's completely valid to feel sad. Please remember that you don't have to go through it alone. I'm here to listen without judgment. Take a gentle breath. What's making you feel this way today? We can talk about it, or I can help you with a breathing exercise to rest your mind.";
    }
    // 5. Stress & Overwhelm / Study Anxiety Checks
    if (text.includes('stress') ||
        text.includes('anxious') ||
        text.includes('anxiety') ||
        text.includes('worry') ||
        text.includes('overwhelmed') ||
        text.includes('panicked')) {
        return "That sounds like a lot of weight to carry. Let's take a slow breath in... and out. Wellness and focus are a practice. Would you like to guide through a Box Breathing session in our Meditation room, or should we organize your goals in the Study Planner to make things feel more manageable?";
    }
    // 6. Quotes / Motivation
    if (text.includes('quote') ||
        text.includes('motivate') ||
        text.includes('motivation') ||
        text.includes('inspiration') ||
        text.includes('affirmation') ||
        text.includes('give')) {
        return "Here is a quote for you today:\n\n> *'You don't have to see the whole staircase, just take the first step.'* — Martin Luther King Jr.\n\nRemember that you are capable and doing your best is more than enough. What subject or activity are we focusing on today?";
    }
    // 7. Cooking / Ice Cream / Recipes
    if (text.includes('ice cream') ||
        text.includes('recipe') ||
        text.includes('cook') ||
        text.includes('food') ||
        text.includes('eat') ||
        text.includes('hungry')) {
        return "Making homemade ice cream is actually super fun and simple! The easiest no-churn recipe is:\n\n1. Whip **2 cups of cold heavy cream** until stiff peaks form.\n2. Gently fold in **1 can (14oz) of sweetened condensed milk** and **1 tsp of vanilla extract**.\n3. Pour into a container and freeze for 6 hours!\n\nCooking can be a great mindful distraction. Are you planning to make some today?";
    }
    // 8. Pomodoro / Study Checks
    if (text.includes('study') ||
        text.includes('exam') ||
        text.includes('test') ||
        text.includes('homework') ||
        text.includes('pomodoro') ||
        text.includes('fail')) {
        return "Study goals can feel heavy! Breaking your workload into focus blocks is highly effective. You can launch a Pomodoro session (25 minutes of studying, 5 minutes of rest) in our Study Planner. Which subject are we tackling first?";
    }
    // 9. Greetings Checks
    if (text.includes('hello') ||
        text.includes('hi') ||
        text.includes('hey') ||
        text.includes('greetings')) {
        return "Hello! I'm YuviMantra AI, your emotional wellness and study companion. How are you holding up today? I'm here to listen.";
    }
    // 9.5 Drinks / Coca-Cola / Water
    if (text.includes('coca cola') ||
        text.includes('coke') ||
        text.includes('drink') ||
        text.includes('soda') ||
        text.includes('water')) {
        return "A cold beverage like Coca-Cola sounds refreshing right now! Just make sure to balance it with plenty of fresh water to keep your hydration high. Staying hydrated is a great, simple wellness habit! How else are you feeling?";
    }
    // 10. Thanks
    if (text.includes('thanks') || text.includes('thank you') || text.includes('thx')) {
        return "You are so welcome! I'm always here to listen. Remember to drink some water and take care of yourself today.";
    }
    // 11. General Rotated Fallbacks (so it doesn't repeat the same sentence)
    const fallbacks = [
        "I hear you. Tell me more about that—I'm here to listen and help you unpack it.",
        "That makes sense. It's completely okay to share whatever is on your mind. How has that been affecting you?",
        "I'm listening. Taking time to put your feelings into words is a great wellness practice. What else are you reflecting on today?",
        "I understand. I'm right here with you. What do you feel would be the most supportive thing for you in this moment?",
        "Thank you for sharing that with me. It is helpful to express what is going on. What is the next small step you want to take today?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};
const generateChatResponse = async (history, newMessage) => {
    // If API key is not configured, return a friendly simulated response
    if (!genAI) {
        console.log('[Gemini SDK] API key not found. Using offline simulated response.');
        return getLocalSimulatedResponse(newMessage);
    }
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: CHAT_SYSTEM_INSTRUCTION,
        });
        // Format chat history to Gemini's SDK format
        const chat = model.startChat({
            history: history.map((h) => ({
                role: h.role,
                parts: [{ text: h.parts }],
            })),
        });
        const result = await chat.sendMessage(newMessage);
        return result.response.text();
    }
    catch (error) {
        console.warn('[Gemini SDK Error] Falling back to local offline responder:', error);
        return getLocalSimulatedResponse(newMessage);
    }
};
exports.generateChatResponse = generateChatResponse;
const generateJournalSummary = async (content) => {
    if (!genAI) {
        return SIMULATED_SUMMARIES[Math.floor(Math.random() * SIMULATED_SUMMARIES.length)];
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Write a short, highly supportive 1-sentence emotional summary and encouragement based on this journal entry: "${content}". Be empathetic, concise, and speak directly to the writer.`;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    }
    catch (error) {
        console.error('[Gemini Journal Summary Error]:', error);
        return 'A mindful entry reflecting on your experiences. Keep writing and expressing yourself!';
    }
};
exports.generateJournalSummary = generateJournalSummary;
const analyzeSentiment = async (content) => {
    if (!genAI) {
        // Simple rule-based sentiment detector for offline dev
        const lower = content.toLowerCase();
        const positiveWords = ['happy', 'glad', 'excited', 'good', 'great', 'awesome', 'proud', 'accomplished', 'love', 'joy', 'calm', 'peace'];
        const negativeWords = ['sad', 'bad', 'angry', 'mad', 'depressed', 'anxious', 'scared', 'worry', 'stress', 'tired', 'hate', 'fear', 'fail'];
        let posCount = 0;
        let negCount = 0;
        positiveWords.forEach(w => { if (lower.includes(w))
            posCount++; });
        negativeWords.forEach(w => { if (lower.includes(w))
            negCount++; });
        if (posCount > negCount) {
            return { sentiment: 'positive', score: Math.min(0.1 * (posCount - negCount), 1.0) };
        }
        else if (negCount > posCount) {
            return { sentiment: 'negative', score: Math.max(-0.1 * (negCount - posCount), -1.0) };
        }
        else {
            return { sentiment: 'neutral', score: 0 };
        }
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Perform sentiment analysis on the following text. Respond strictly in the JSON format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "score": number between -1.0 and 1.0
}
Text to analyze: "${content}"`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        // Parse JSON safely
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                sentiment: parsed.sentiment || 'neutral',
                score: typeof parsed.score === 'number' ? parsed.score : 0,
            };
        }
        return { sentiment: 'neutral', score: 0 };
    }
    catch (error) {
        console.error('[Gemini Sentiment Analysis Error]:', error);
        return { sentiment: 'neutral', score: 0 };
    }
};
exports.analyzeSentiment = analyzeSentiment;
