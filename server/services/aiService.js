const { GoogleGenAI } = require('@google/genai');

const MODEL = 'gemini-3.8-flash';

let ai;

const getAI = () => {
    if (!process.env.AI_API_KEY) {
        throw new Error('AI_API_KEY is missing from environment variables.');
    }

    if (!ai) {
        ai = new GoogleGenAI({
            apiKey: process.env.AI_API_KEY,
        });
    }

    return ai;
};

const generateAIResponse = async (prompt, json = false) => {
    const response = await getAI().models.generateContent({
        model: MODEL,
        contents: prompt,
        ...(json && {
            config: {
                responseMimeType: 'application/json',
            },
        }),
    });

    const text = response.text;

    if (!text) {
        throw new Error('AI returned an empty response.');
    }

    return text.trim();
};

const generateJSON = async (prompt) => {
    const text = await generateAIResponse(prompt, true);

    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('JSON Parsing Error:', error.message);
        throw new Error('AI returned an invalid JSON response.');
    }
};

/* const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY || '');

const cleanAndParseJSON = (text) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        throw new Error('Failed to parse AI response into structured JSON format');
    }
}; */

exports.analyzeCVService = async (candidate) => {
    const prompt = `
    You are an expert HR Specialist and ATS Engine.
    Analyze the following candidate profile details and provide feedback.

    Candidate Profile: ${JSON.stringify(candidate)}

    Return JSON with this structure:
    {
      "overallScore": 85,
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    }
    
    overallScore must be a number from 0 to 100.
    Base your feedback only on the provided information.
    `;

    return generateJSON(prompt);
};

exports.matchJobService = async (candidateSkills, jobRequirements) => {
    const prompt = `
      Compare Candidate Skills against Job Requirements and output a match percentage with skill breakdown.

      Candidate Skills: ${JSON.stringify(candidateSkills)}
      Job Requirements: ${JSON.stringify(jobRequirements)}

      Return JSON in this structure:
      {
        "matchScore": 87,
        "matchingSkills": ["Skill 1", "Skill 2"],
        "missingSkills": ["Skill A", "Skill B"],
        "recommendation": "Strong candidate for this role."
      }

      matchScore must be a number from 0 to 100.
      Do not assume skills that are not provided.
    `;

    return generateJSON(prompt);
};

exports.analyzeJDService = async (jobDescription) => {
    const prompt = `
       Analyze this Job Description for clarity, missing information, potential bias, and overall quality.

       Job Description: ${jobDescription}

       Return strict JSON in this structure:
       {
          "qualityScore": 90,
          "clarity": "High",
          "missingInformation": ["Salary range", "Work experience detail"],
          "suggestions": ["Add expected experience", "Clarify responsibilities"]
       }

        qualityScore must be a number from 0 to 100.

    `;

    return generateJSON(prompt);
};

exports.generateCoverLetterService = async (candidateProfile, jobDetails, tone = 'Professional') => {
    const prompt = `
        Write a tailored cover letter in a ${tone} tone.
        Candidate Details: ${JSON.stringify(candidateProfile)}
        Target Job Details: ${JSON.stringify(jobDetails)}

        Use only the candidate's provided qualifications and experience.
        Do not invent achievements or qualifications.
        Return only the cover letter as plain text.
    `;

    return generateAIResponse(prompt);
};

exports.analyzeSkillGapService = async (currentSkills, targetJobSkills) => {
    const prompt = `
        Compare the candidate's current skills with the target job skills.

        Current Candidate Skills: ${JSON.stringify(currentSkills)}
        Target Job Skills: ${JSON.stringify(targetJobSkills)}

        Return strict JSON format:
        {
          "alreadyHave": ["React", "JavaScript"],
          "needToLearn": ["Docker", "AWS", "Redis"],
          "recommendedLearningOrder": ["Docker", "Redis", "AWS"]
        }

        Recommend a practical learning order based on dependencies
        and the information provided.
    `;

    return generateJSON(prompt);
};

exports.generateInterviewQuestionsService = async (jobTitle, skills, difficulty = 'Medium') => {
    const skillList = Array.isArray(skills) ? skills.join(', ') : String(skills || '');

    const prompt = `
        Generate interview practice questions for this role.

        Job Title: ${jobTitle}
        Required Skills: ${skillList}
        Difficulty: ${difficulty}

        Return JSON in this structure:
        {
           "technicalQuestions": ["Question1", "Question2"],
           "behavioralQuestions": ["Question1", "Question2"],
           "hrQuestions": ["Question1"],
           "scenarioQuestions": ["Question1"]
        }

        Questions should be relevant to the role and difficulty.
    `;

    return generateJSON(prompt);
};