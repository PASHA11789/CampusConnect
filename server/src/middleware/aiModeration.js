import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const VULGAR_PATTERNS = [
    /loray?\s+lag/i,
    /lan\s+lag/i,
    /lund?\s+lag/i,
    /\b(loray?|loda|lode|laude?|lund?|luns?|chutiya?|chutiye|gand|gandu|harami|kanjar|gashti|randi|bhenchod|penchod|madarchod|bitch|fuck|asshole|dick|pussy|sexii?|sexxy|sexi|sxy)\b/i
];

export const aiModeration = async (req, res, next) => {
    try {
        const textToAnalyze = [req.body.title, req.body.content, req.body.description]
            .filter(Boolean)
            .join("\n");

        if (!textToAnalyze.trim()) {
            req.body.isFlagged = false
            return next()
        }

        // 1. Fast Local Regex Moderation Fallback
        const matchesVulgar = VULGAR_PATTERNS.some(pattern => pattern.test(textToAnalyze));
        if (matchesVulgar) {
            req.body.isFlagged = true;
            req.body.flagReason = "Locally flagged: Contains high-risk vulgarity or offensive language.";
            return next();
        }
        
        const systemPrompt = `You are an automated community moderator for a university student portal. 
    Your job is to ensure that only decent, respectful, and appropriate comments are published. This is a strict academic environment with conservative South Asian/Pakistani cultural values.
    
    Analyze the text for obscenity, vulgarity, profanity, sexually suggestive language, flirting, or romantic/sexual advances.
    
    CRITICAL RULES:
    1. FLIRTING & SUGGESTIVE COMPLIMENTS: Any physical/romantic/sexual compliments, flirting, or suggestive remarks directed at individuals are strictly forbidden. This includes calling someone "hot", "so hot", "sexy", "sexii", "hawt", "cute", or their variations/misspellings (e.g., "sxy", "sexi", "sexxy"), as well as terms of endearment ("sweetie", "bae", "shona", "jigar", etc.) when used suggestively. Any such post MUST be flagged as obscene (isObscene: true).
    2. LOCAL CULTURE & TRANSLITERATION: Detect profanity, abusive terms, offensive slurs, and culturally inappropriate/flirting terms in all scripts and transliterations:
       - English (e.g., "hot", "sexy", "sexii", "bitch", etc.)
       - Urdu in Arabic script
       - Roman Urdu (Urdu transliterated into English alphabet, such as abusive transliterations, Romanized Urdu slurs, or informal romantic slang like "loray lag gaye", "lan lag gaye", "lund", "chutiya", "gand").
    3. ACADEMIC DECENCY: Keep a very high standard of decency. If the post contains any vulgar, indecent, suggestive, or highly inappropriate content for a university setting, flag it.
    4. CONTEXT AWARENESS: Distinguish between literal academic discussions (e.g., "a hot topic in physics", "hot weather", or "sex chromosomes") which are ALLOWED, and personal remarks, flirting, or obscenities (e.g., "you are so hot", "sexii pic", "check out this hot girl/guy") which MUST BE FLAGGED.
    
    Respond ONLY with a valid JSON object in this format:
    {"isObscene": true|false, "reason": "brief explanation of why it was flagged or why it is clean"}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${systemPrompt}\n\nText to analyze: ${textToAnalyze}`,
            config: {
                responseMimeType: "application/json"
            }
        })

        const result = JSON.parse(response.text)
        req.body.isFlagged = result.isObscene;
        req.body.flagReason = result.reason;

        next()
    } catch (error) {
        console.error("AI moderation Error: ", error)
        // Fail-safe approach: if the AI moderation service is rate-limited or fails, send to moderator review instead of posting unmoderated.
        // In development/test environments, bypass to allow local development/testing without dependency on external API availability.
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
            console.warn("AI moderation service failed/busy. Bypassing check in development/test environment.");
            req.body.isFlagged = false;
            req.body.flagReason = "Moderation system busy. Bypassed in dev/test.";
        } else {
            req.body.isFlagged = true;
            req.body.flagReason = "Moderation system busy. Sent for manual review to ensure academic decency.";
        }
        next()
    }
}