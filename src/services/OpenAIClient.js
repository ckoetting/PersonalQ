import axios from 'axios';

class ReportTextGenerator {
    constructor(apiKey, model = 'gpt-3.5-turbo') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = 'https://api.openai.com/v1';
    }

    // Set a new API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // Generate personality and summary sections based on candidate data
    async generateReportSections(candidateData) {
        try {
            const prompt = this._createPrompt(candidateData);

            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an executive search specialist who writes professional candidate profiles.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            const content = response.data.choices[0].message.content;
            return this._parseSections(content);
        } catch (error) {
            console.error('OpenAI API Error:', error);
            throw new Error(error.response?.data?.error?.message || 'Failed to generate report text');
        }
    }

    // Create a detailed prompt from candidate data
    _createPrompt(data) {
        const personal = data.personal_data || {};
        const experience = data.experience || [];
        const education = data.education || [];

        const experienceText = experience.map(pos =>
            `- ${pos.years}: ${pos.title} at ${pos.company}\n  ${pos.description || ''}`
        ).join('\n');

        const educationText = education.map(edu =>
            `- ${edu.years}: ${edu.degree} in ${edu.field} at ${edu.institution}`
        ).join('\n');

        const languages = Object.entries(personal.languages || {})
            .map(([lang, level]) => `${lang} (${level})`)
            .join(', ');

        const currentRole = experience.length > 0
            ? `${experience[0].title || 'N/A'} at ${experience[0].company || 'N/A'}`
            : 'N/A';

        return `
Create a professional executive search report for:

# Candidate Profile
Name: ${personal.name || 'N/A'}
Current Position: ${currentRole}
Age: ${personal.age || 'N/A'}
Nationality: ${personal.nationality || 'N/A'}
Languages: ${languages}

# Work Experience
${experienceText}

# Education
${educationText}

# Task
Write two detailed sections in German:

1. PERSÖNLICHKEIT (Personality) - ~350 words describing the candidate's character, leadership style, and professional demeanor based on their career trajectory.

2. ZUSAMMENFASSUNG (Summary) - ~450 words comprehensive overview of their professional profile, key achievements, and unique value proposition.

Guidelines:
- Use formal German
- Write in third-person
- Provide specific details rather than generic descriptions
- Format as single paragraphs with no bullet points
- Be consistent with the candidate's background

Return with headings "PERSÖNLICHKEIT" and "ZUSAMMENFASSUNG".
`;
    }

    // Extract the two sections from the response
    _parseSections(text) {
        const parts = text.split('PERSÖNLICHKEIT');

        if (parts.length < 2) {
            return {
                personality_section: '',
                summary_section: ''
            };
        }

        const secondPart = parts[1].trim();

        if (secondPart.includes('ZUSAMMENFASSUNG')) {
            const [personality, summary] = secondPart.split('ZUSAMMENFASSUNG');
            return {
                personality_section: personality.trim(),
                summary_section: summary.trim()
            };
        }

        return {
            personality_section: secondPart,
            summary_section: ''
        };
    }
}

export default ReportTextGenerator;