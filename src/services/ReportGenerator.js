import EzekiaClient from './EzekiaClient';
import ReportTextGenerator from './OpenAIClient';

class ReportGenerator {
    constructor(ezekiaApiKey, openaiApiKey) {
        this.ezekiaClient = new EzekiaClient(ezekiaApiKey);
        this.openaiClient = new ReportTextGenerator(openaiApiKey);
    }

    // Update API keys if needed
    updateApiKeys(ezekiaApiKey, openaiApiKey) {
        if (ezekiaApiKey) {
            this.ezekiaClient.setApiKey(ezekiaApiKey);
        }

        if (openaiApiKey) {
            this.openaiClient.setApiKey(openaiApiKey);
        }
    }

    // Fetch assignments from Ezekia
    async fetchAssignments() {
        return await this.ezekiaClient.getAssignments();
    }

    // Fetch candidates for an assignment
    async fetchCandidates(assignmentId) {
        return await this.ezekiaClient.getCandidates(assignmentId);
    }

    // Generate a report for a candidate
    async generateReport(candidateId, assignmentId, config) {
        try {
            // Fetch candidate data from Ezekia
            const candidateData = await this.ezekiaClient.getAllCandidateData(candidateId, assignmentId);

            // Filter data based on user configuration
            const filteredData = {};

            if (config.includePersonal) {
                filteredData.personal_data = candidateData.personal_data;
            }

            if (config.includeExperience) {
                filteredData.experience = candidateData.experience;
            }

            if (config.includeEducation) {
                filteredData.education = candidateData.education;
            }

            // Generate report text using OpenAI
            const reportSections = await this.openaiClient.generateReportSections(filteredData);

            // Return complete report data
            return {
                candidateData,
                reportSections
            };
        } catch (error) {
            console.error('Error generating report:', error);
            throw new Error('Failed to generate report: ' + error.message);
        }
    }

    // Create a markdown file from the report sections
    createMarkdownReport(candidateData, reportSections) {
        const candidateName = candidateData.personal_data.name || 'Candidate';

        return `# Candidate Report for ${candidateName}

## PERSÖNLICHKEIT
${reportSections.personality_section}

## ZUSAMMENFASSUNG
${reportSections.summary_section}
`;
    }
}

export default ReportGenerator;