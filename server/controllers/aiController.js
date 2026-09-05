const axios = require('axios');
const EmailHistory = require('../models/EmailHistory');

exports.generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    if (typeof prompt !== 'string') {
      return res.status(400).json({ message: 'Prompt must be a string' });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({ message: 'Prompt cannot be empty' });
    }

    if (prompt.length > 2000) {
      return res.status(400).json({ message: 'Prompt cannot exceed 2000 characters' });
    }

    // Call Groq API (Free tier - No quota issues!)
    const groqApiKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ message: 'AI service is not configured. Please set GROQ_API_KEY.' });
    }

    const systemPrompt = `You are an expert job outreach strategist.

Your task is to generate a HIGH-CONVERTING cold email to a recruiter for a job opportunity.

IMPORTANT:
- Even if the user gives only 2–4 words, assume realistic context.
- Do NOT ask for clarification.
- Make professional assumptions.
- Avoid generic phrases.
- Keep it concise and structured.

====================================================
OUTPUT FORMAT (STRICT)
====================================================

Return ONLY valid JSON:

{
  "subject": "",
  "emailBody": "",
  "linkedInDM": "",
  "followUpEmail": ""
}

No markdown.
No explanations.
Only JSON.

====================================================
CONTEXT ASSUMPTIONS
====================================================

Assume:
- Candidate has 2+ years experience
- Strong in DSA and system design
- Has worked on backend APIs or scalable systems
- Has contributed to production-level features
- Actively seeking Software Engineer roles

If prompt is short like:
"SDE role"
"Backend engineer"
"Startup job"
"Product company"

Create intelligent assumptions about:
- Scaling challenges
- Hiring urgency
- Performance or system reliability issues
- Team growth

====================================================
SUBJECT LINE RULES
====================================================

• 6–9 words
• Must sound confident
• No generic phrases like:
  - "Quick question"
  - "Looking for opportunity"
  - "Job application"
• Should highlight value or experience

Example styles:
"Backend engineer with 2+ yrs scaling APIs"
"Engineer focused on scalable system design"
"Software engineer improving system performance"

====================================================
EMAIL BODY STRUCTURE (STRICT)
====================================================

Keep 60–90 words.

Line 1: Personalized observation about hiring  
Line 2: Mention common hiring/scaling challenge  
Line 3-4: Candidate's experience and strengths  
Line 5: Specific impact or contribution  
Line 6: Clear CTA  
Line 7: Sign-off with name and title  

Tone:
• Confident
• Professional
• Not desperate
• No emojis
• No hype words

====================================================
LINKEDIN DM STRUCTURE
====================================================

30–50 words.
Short, conversational.
Observation + value + soft ask.

====================================================
FOLLOW-UP EMAIL STRUCTURE
====================================================

50–80 words.
New angle.
Emphasize long-term value.
Professional urgency.
Clear CTA.

====================================================

Return ONLY valid JSON.`;
    
    const fullPrompt = `${systemPrompt}\n\nUser REQUEST: "${prompt.trim()}"\n\nGenerate STRONG cold email even if prompt is short. Make smart assumptions. Return ONLY valid JSON:\n{"subject": "...", "emailBody": "...", "linkedInDM": "...", "followUpEmail": "..."}`;
    
    // Candidate models on Groq with automatic fallback
    const candidateModels = [
      process.env.GROQ_MODEL,
      "openai/gpt-oss-120b",
      "openai/gpt-oss-20b",
      "qwen/qwen3.8-27b"
    ].filter(Boolean);

    let aiResponse;
    let lastAiError;

    for (const model of candidateModels) {
      try {
        aiResponse = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model,
            messages: [
              {
                role: "user",
                content: fullPrompt
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
            max_tokens: 1024
          },
          {
            headers: {
              'Authorization': `Bearer ${groqApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000
          }
        );
        if (aiResponse?.data?.choices?.[0]?.message?.content) {
          break; // Successfully got response
        }
      } catch (err) {
        lastAiError = err;
        console.warn(`Groq model ${model} failed (${err.response?.status || err.message}), attempting fallback...`);
      }
    }

    if (!aiResponse || !aiResponse.data?.choices?.[0]?.message) {
      throw lastAiError || new Error('Invalid response from Groq API');
    }

    const generatedText = aiResponse.data.choices[0].message.content;
    
    // Robust JSON extraction & cleanup
    let cleanText = (generatedText || '').trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    }

    let parsedResponse = null;

    // 1. Direct parse attempt
    try {
      parsedResponse = JSON.parse(cleanText);
    } catch (e) {}

    // 2. Extract outermost { ... }
    if (!parsedResponse) {
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (e1) {
          // 3. Fix unescaped control characters/newlines inside string literals
          try {
            const sanitized = jsonMatch[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, (c) => {
              if (c === '\n') return '\\n';
              if (c === '\r') return '\\r';
              if (c === '\t') return '\\t';
              return '';
            });
            parsedResponse = JSON.parse(sanitized);
          } catch (e2) {}
        }
      }
    }

    // 4. Fallback field extraction via regex if JSON syntax was damaged
    if (!parsedResponse) {
      const extractField = (fieldName) => {
        const regex = new RegExp(`"${fieldName}"\\s*:\\s*"([\\s\\S]*?)(?:"\\s*,|"\\s*})`, 'i');
        const m = cleanText.match(regex);
        return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() : '';
      };
      const sub = extractField('subject');
      const body = extractField('emailBody');
      if (sub || body) {
        parsedResponse = {
          subject: sub || 'Job Outreach',
          emailBody: body || cleanText,
          linkedInDM: extractField('linkedInDM'),
          followUpEmail: extractField('followUpEmail')
        };
      }
    }

    if (!parsedResponse) {
      console.error('JSON parse error. Generated text:', generatedText);
      return res.status(500).json({ 
        message: 'Failed to parse AI response', 
        error: 'The AI generated invalid formatting. Please try again.' 
      });
    }

    const emailData = {
      subject: parsedResponse.subject || "New Opportunity",
      emailBody: parsedResponse.emailBody || "",
      linkedInDM: parsedResponse.linkedInDM || "",
      followUpEmail: parsedResponse.followUpEmail || ""
    };

    // Validate response data
    if (!emailData.subject || !emailData.emailBody) {
      return res.status(500).json({ 
        message: 'AI generated incomplete email data. Please try again.' 
      });
    }

    // Save to history
    const historyEntry = await EmailHistory.create({
      userId: req.user._id,
      prompt: prompt.trim(),
      subject: emailData.subject,
      emailBody: emailData.emailBody,
      linkedInDM: emailData.linkedInDM,
      followUpEmail: emailData.followUpEmail
    });

    res.status(200).json(historyEntry);
  } catch (error) {
    console.error('AI Generation Error:', error.response?.data || error.message);
    
    if (error.response?.status === 429) {
      return res.status(429).json({ 
        message: 'Too many requests. Please wait a moment before trying again.',
        error: 'Rate limit exceeded'
      });
    }

    res.status(500).json({ 
      message: 'Failed to generate email', 
      error: error.response?.data?.error?.message || error.message 
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await EmailHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};
