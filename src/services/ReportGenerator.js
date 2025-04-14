import EzekiaClient from './EzekiaClient';
import ReportTextGenerator from './OpenAIClient';

class ReportGenerator {
    constructor(ezekiaApiKey, openaiApiKey) {
        console.log("Initializing ReportGenerator with API keys:", {
            ezekiaApiKey: ezekiaApiKey ? "Provided" : "Not provided",
            openaiApiKey: openaiApiKey ? "Provided" : "Not provided"
        });

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
        console.log("ReportGenerator: Fetching assignments");
        try {
            const assignments = await this.ezekiaClient.getAssignments();
            console.log(`ReportGenerator: Received ${assignments?.length || 0} assignments`);
            return assignments;
        } catch (error) {
            console.error("ReportGenerator: Error fetching assignments:", error);
            throw error;
        }
    }

    // Fetch candidates for an assignment
    async fetchCandidates(assignmentId) {
        console.log(`ReportGenerator: Fetching candidates for assignment ${assignmentId}`);
        try {
            const candidates = await this.ezekiaClient.getCandidates(assignmentId);
            console.log(`ReportGenerator: Received ${candidates?.length || 0} candidates`);
            return candidates;
        } catch (error) {
            console.error("ReportGenerator: Error fetching candidates:", error);
            throw error;
        }
    }

    // Generate a report for a candidate
    async generateReport(candidateId, assignmentId, config) {
        console.log(`ReportGenerator: Generating report for candidate ${candidateId}`);
        try {
            // Fetch candidate data from Ezekia
            const candidateData = await this.ezekiaClient.getAllCandidateData(candidateId, assignmentId);
            console.log("ReportGenerator: Received candidate data");

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
            console.log("ReportGenerator: Generating report sections with OpenAI");
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