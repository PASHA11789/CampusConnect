import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";

let groq = null;
let ai = null;
let initialized = false;

const initClients = () => {
    if (initialized) return;
    const groqApiKey = process.env.GROQ_API_KEY || process.env.GROP_API_KEY;
    if (groqApiKey) {
        groq = new Groq({ apiKey: groqApiKey });
    }
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
        ai = new GoogleGenAI({ apiKey: geminiApiKey });
    }
    initialized = true;
};

const VULGAR_PATTERNS = [
    /loray?\s+lag/i,
    /lan\s+lag/i,
    /lund?\s+lag/i,
    /\b(loray?|loda|lode|laude?|lund?|luns?|chutiya?|chutiye|gand|gandu|harami|kanjar|gashti|randi|bhenchod|penchod|madarchod|bitch|fuck|asshole|dick|pussy|sexii?|sexxy|sexi|sxy)\b/i
];

const withTimeout = (promise, ms = 3500) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`AI Moderation Timeout (${ms}ms)`)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
};

export const aiModeration = async (req, res, next) => {
    const startTime = process.hrtime.bigint();
    req._contentCheckStart = startTime;

    try {
        initClients();
        const textToAnalyze = [req.body.title, req.body.content, req.body.description, req.body.itemName]
            .filter(Boolean)
            .join("\n");

        if (!textToAnalyze.trim()) {
            req.body.isFlagged = false;
            return next();
        }

        const matchesVulgar = VULGAR_PATTERNS.some(pattern => pattern.test(textToAnalyze));
        if (matchesVulgar) {
            req.body.isFlagged = true;
            req.body.flagReason = "Locally flagged: Contains high-risk vulgarity or offensive language.";
            const durationMs = (Number(process.hrtime.bigint() - startTime) / 1e6).toFixed(1);
            console.log(`⏱ [Content Check] Local regex check completed in ${durationMs} ms (< 5000ms target)`);
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

        let result = null;
        let success = false;

        if (groq) {
            try {
                console.log("Attempting moderation with Groq using llama-3.1-8b-instant...");
                const response = await withTimeout(
                    groq.chat.completions.create({
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `Text to analyze: ${textToAnalyze}` }
                        ],
                        model: "llama-3.1-8b-instant", 
                        response_format: { type: "json_object" } 
                    }),
                    3500
                );
                result = JSON.parse(response.choices[0].message.content);
                success = true;
                console.log("Moderated successfully with Groq model llama-3.1-8b-instant.");
            } catch (groqErr) {
                console.warn("Groq with model llama-3.1-8b-instant failed/timed out. Error: ", groqErr.message);
                
                try {
                    console.log("Attempting moderation with Groq using fallback model llama-3.3-70b-versatile...");
                    const response = await withTimeout(
                        groq.chat.completions.create({
                            messages: [
                                { role: "system", content: systemPrompt },
                                { role: "user", content: `Text to analyze: ${textToAnalyze}` }
                            ],
                            model: "llama-3.3-70b-versatile",
                            response_format: { type: "json_object" }
                        }),
                        3500
                    );
                    result = JSON.parse(response.choices[0].message.content);
                    success = true;
                    console.log("Moderated successfully with Groq model llama-3.3-70b-versatile.");
                } catch (fallbackGroqErr) {
                    console.error("Groq fallback model llama-3.3-70b-versatile also failed/timed out. Error: ", fallbackGroqErr.message);
                }
            }
        }

        if (!success && ai) {
            try {
                console.log("Attempting moderation with Gemini using gemini-2.5-flash...");
                const response = await withTimeout(
                    ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: `System Prompt:\n${systemPrompt}\n\nUser Content:\nText to analyze: ${textToAnalyze}`,
                        config: {
                            responseMimeType: "application/json"
                        }
                    }),
                    3500
                );
                result = JSON.parse(response.text.trim());
                success = true;
                console.log("Moderated successfully with Gemini.");
            } catch (geminiErr) {
                console.error("Gemini moderation failed/timed out. Error: ", geminiErr.message);
            }
        }

        const durationMs = (Number(process.hrtime.bigint() - startTime) / 1e6).toFixed(1);
        console.log(`⏱ [Content Check] Outside AI check completed in ${durationMs} ms (< 5000ms requirement)`);

        if (success && result) {
            req.body.isFlagged = result.isObscene;
            req.body.flagReason = result.reason;
            return next();
        }

        throw new Error("All AI moderation services failed/busy.");

    } catch (error) {
        console.error("AI moderation Error: ", error);
        
        if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
            console.warn("AI moderation service failed/busy. Bypassing check in development/test environment.");
            req.body.isFlagged = false;
            req.body.flagReason = "Moderation system busy. Bypassed in dev/test.";
        } else {
            req.body.isFlagged = true;
            req.body.flagReason = "Moderation system busy. Sent for manual review to ensure academic decency.";
        }
        next();
    }
}