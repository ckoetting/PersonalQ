import axios from 'axios';

class EzekiaClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://ezekia.com/api';
        this.headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
    }

    // Set a new API key
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        this.headers = {
            ...this.headers,
            'Authorization': `Bearer ${apiKey}`
        };
    }

    // Base request method - updated to use IPC
    // In EzekiaClient.js - request method
    async request(method, endpoint, params = {}, data = null) {
        try {
            console.log(`API Request: ${method} ${endpoint}`, {
                params: JSON.stringify(params),
                data: data ? 'Has data' : 'No data'
            });

            const response = await window.api.ezekiaRequest({
                method,
                endpoint,
                params,
                data
            });

            if (response.error) {
                console.error(`API Error (${endpoint}):`, response.message);
                throw new Error(response.message);
            }

            console.log(`API Response (${endpoint}): Success with ${
                Array.isArray(response)
                    ? `${response.length} items`
                    : (response.data ? `${Array.isArray(response.data) ? response.data.length : 1} items` : 'no data')
            }`);

            return response;
        } catch (error) {
            console.error(`Ezekia API Error (${endpoint}):`, error);
            throw new Error(error.message || 'Failed to fetch data from Ezekia');
        }
    }

// In EzekiaClient.js - getAssignments method
    // In EzekiaClient.js - getAssignments method
    async getAssignments(limit = 100) {
        console.log('Fetching assignments using V2 endpoint');
        const params = {
            isAssignment: true,
            count: limit,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        };

        // Add fields with correct relationship paths
        params['fields[]'] = 'name';
        params['fields[]'] = 'status';
        params['fields[]'] = 'relationships.company'; // This is the correct path
        params['fields[]'] = 'contactPerson';
        params['fields[]'] = 'createdAt';
        params['fields[]'] = 'description';
        params['fields[]'] = 'candidates_count';

        const response = await this.request('GET', 'projects', params);
        return response.data || [];
    }

    // Fetch candidates for a specific assignment - UPDATED to use correct fields format
    // In EzekiaClient.js - getCandidates method
    async getCandidates(assignmentId, limit = 100) {
        console.log(`Fetching candidates for assignment ${assignmentId}`);
        const params = {
            count: limit,
            sortBy: 'updatedAt',
            sortOrder: 'desc'
        };

        // Add the correct fields based on API response
        params['fields[]'] = 'id';
        params['fields[]'] = 'name';
        params['fields[]'] = 'firstName';
        params['fields[]'] = 'lastName';
        params['fields[]'] = 'profilePicture'; // This is the correct field name
        params['fields[]'] = 'profile.positions'; // This is where work experience is stored
        params['fields[]'] = 'status';
        params['fields[]'] = 'experience_years';

        const response = await this.request('GET', `projects/${assignmentId}/candidates`, params);
        return response.data || [];
    }

    // Get detailed information about a candidate - UPDATED with correct fields format
    async getCandidate(personId) {
        console.log(`Fetching detailed candidate info for person ${personId}`);
        const params = {};

        // Add fields individually
        params['fields[]'] = 'name';
        params['fields[]'] = 'firstName';
        params['fields[]'] = 'lastName';
        params['fields[]'] = 'emails';
        params['fields[]'] = 'phones';
        params['fields[]'] = 'address';
        params['fields[]'] = 'birthday';
        params['fields[]'] = 'maritalStatus';
        params['fields[]'] = 'nationality';
        params['fields[]'] = 'languages';
        params['fields[]'] = 'photo';

        const response = await this.request('GET', `v2/people/${personId}`, params);

        return response.data || {};
    }

    // Get work experience/positions for a candidate
    async getPositions(personId) {
        console.log(`Fetching positions for person ${personId}`);

        // First try to get the complete profile
        const candidate = await this.getCandidate(personId);

        // Check if positions are already in the data
        if (candidate && candidate.profile && candidate.profile.positions) {
            console.log(`Found ${candidate.profile.positions.length} positions in profile data`);
            return candidate.profile.positions;
        }

        // If not, try the dedicated endpoint
        const params = {
            sortBy: 'startDate',
            sortOrder: 'desc'
        };

        const response = await this.request('GET', `v2/people/${personId}/positions`, params);
        console.log(`Positions fetched from dedicated endpoint: ${response.data?.length || 0}`);

        return response.data || [];
    }

    // Get education history for a candidate
    // In EzekiaClient.js - getEducation method
    async getEducation(personId) {
        console.log(`Fetching education for person ${personId}`);

        // Try to extract education from position summaries (as a fallback)
        const positions = await this.getPositions(personId);
        const educationEntries = [];

        // Check each position summary for education-related content
        for (const pos of positions) {
            if (pos.summary &&
                (pos.summary.toLowerCase().includes('ausbildung') ||
                    pos.summary.toLowerCase().includes('studium') ||
                    pos.summary.toLowerCase().includes('universität') ||
                    pos.summary.toLowerCase().includes('schule'))) {

                // This is a basic approach - in production you might want something more sophisticated
                educationEntries.push({
                    years: pos.startDate ? `${pos.startDate.substr(0, 4)} - ${pos.endDate === '9999-12-31' ? 'Present' : pos.endDate?.substr(0, 4) || 'Present'}` : '',
                    degree: 'Education/Training',
                    institution: pos.company?.name || '',
                    field: pos.title || '',
                    description: pos.summary || ''
                });
            }
        }

        // If we found some education entries from the summaries, return them
        if (educationEntries.length > 0) {
            console.log(`Extracted ${educationEntries.length} education entries from position summaries`);
            return educationEntries;
        }

        // Otherwise, try the dedicated endpoint as a fallback
        const params = {
            sortBy: 'start',
            sortOrder: 'desc'
        };

        try {
            const response = await this.request('GET', `people/${personId}/education`, params);
            console.log(`Education fetched from dedicated endpoint: ${response.data?.length || 0}`);
            return response.data || [];
        } catch (error) {
            console.log('Education endpoint returned error, using empty array as fallback');
            return [];
        }
    }

    // Get project/assignment details
    async getProject(projectId) {
        console.log(`Fetching project details for project ${projectId}`);
        const params = {};

        // Add fields individually
        params['fields[]'] = 'name';
        params['fields[]'] = 'status';
        params['fields[]'] = 'client';
        params['fields[]'] = 'contactPerson';
        params['fields[]'] = 'createdAt';
        params['fields[]'] = 'description';

        const response = await this.request('GET', `projects/${projectId}`, params);
        return response.data || {};
    }

    // Get all data needed for a candidate report
    async getAllCandidateData(personId, projectId = null) {
        console.log(`Getting all candidate data for person ${personId}`);
        // Get basic candidate data
        const candidate = await this.getCandidate(personId);

        // Add positions/work experience
        const positions = await this.getPositions(personId);
        candidate.positions = positions;

        // Add education history
        const education = await this.getEducation(personId);
        candidate.education = education;

        // Get assignment/project data if provided
        if (projectId) {
            const project = await this.getProject(projectId);
            candidate.project = project;
        }

        // Process the data to match the report format
        return this._processCandidateData(candidate);
    }

    // Process the raw API data into a format suitable for the report
    _processCandidateData(data) {
        const result = {
            personal_data: {
                name: data.name || '',
                address: this._formatAddress(data.address || {}),
                phone: this._getPrimaryPhone(data.phones || []),
                email: this._getPrimaryEmail(data.emails || []),
                age: this._calculateAge(data.birthday || ''),
                birthdate: this._formatDate(data.birthday || ''),
                marital_status: data.maritalStatus || '',
                nationality: data.nationality || '',
                languages: this._formatLanguages(data.languages || []),
                photo: data.photo || ''
            },
            education: this._processEducation(data.education || []),
            experience: this._processPositions(data.positions || []),
            project_data: data.project || {}
        };

        return result;
    }

    // Format address data into a string
    _formatAddress(address) {
        const components = [];

        if (address.street) {
            components.push(address.street);
        }

        if (address.postalCode && address.city) {
            components.push(`${address.postalCode} ${address.city}`);
        } else if (address.city) {
            components.push(address.city);
        }

        return components.join('\n');
    }

    // Get the primary phone number
    _getPrimaryPhone(phones) {
        if (!phones || phones.length === 0) {
            return '';
        }

        return phones[0].number || '';
    }

    // Get the primary email address
    _getPrimaryEmail(emails) {
        if (!emails || emails.length === 0) {
            return '';
        }

        return emails[0].email || '';
    }

    // Calculate age from birthdate
    _calculateAge(birthdate) {
        if (!birthdate) {
            return null;
        }

        try {
            const birthDate = new Date(birthdate);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();

            // Adjust if birthday hasn't occurred yet this year
            if (
                today.getMonth() < birthDate.getMonth() ||
                (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            return age;
        } catch (error) {
            console.error('Error calculating age:', error);
            return null;
        }
    }

    // Format a date string to desired format
    _formatDate(dateStr) {
        if (!dateStr) {
            return '';
        }

        try {
            const date = new Date(dateStr);
            return date.toISOString().split('T')[0]; // YYYY-MM-DD
        } catch (error) {
            console.error('Error formatting date:', error);
            return dateStr;
        }
    }

    // Format language proficiency data
    _formatLanguages(languages) {
        const result = {};

        for (const lang of languages) {
            const languageName = lang.language?.name || '';
            const proficiency = lang.level || '';

            if (languageName) {
                result[languageName] = proficiency;
            }
        }

        return result;
    }

    // Process education data
    _processEducation(education) {
        const result = [];

        for (const edu of education) {
            const entry = {
                years: `${edu.startYear || ''} - ${edu.endYear || ''}`,
                degree: edu.degree || '',
                institution: edu.institution || '',
                field: edu.field || '',
                description: edu.description || ''
            };

            result.push(entry);
        }

        // Sort by end year (most recent first)
        return result.sort((a, b) => {
            const yearA = a.years.split(' - ')[1] || '';
            const yearB = b.years.split(' - ')[1] || '';

            if (yearA === yearB) return 0;
            return yearA > yearB ? -1 : 1;
        });
    }

    // Process work experience data
    _processPositions(positions) {
        const result = [];

        for (const pos of positions) {
            const entry = {
                years: `${pos.startDate || ''} - ${pos.endDate === '9999-12-31' ? 'Present' : pos.endDate || 'Present'}`,
                title: pos.title || '',
                company: pos.company?.name || '',
                description: pos.summary || ''
            };

            result.push(entry);
        }

        // Sort by end date (most recent first)
        return result.sort((a, b) => {
            const yearA = a.years.split(' - ')[1];
            const yearB = b.years.split(' - ')[1];

            if (yearA === 'Present') return -1;
            if (yearB === 'Present') return 1;

            if (yearA === yearB) return 0;
            return yearA > yearB ? -1 : 1;
        });
    }
}

export default EzekiaClient;