// src/services/PdfGenerator.js - Optimized for Electron (no browser support needed)
import { Document, Page, Text, View, StyleSheet, Image, Font, pdf } from '@react-pdf/renderer';

// Register fonts using static font files with absolute paths for Electron
Font.register({
    family: 'Inter',
    fonts: [
        {
            src: './static/Inter_18pt-Regular.ttf',
            fontWeight: 'normal'
        },
        {
            src: './static/Inter_18pt-Bold.ttf',
            fontWeight: 'bold'
        },
        {
            src: './static/Inter_18pt-Light.ttf',
            fontWeight: 'light'
        }
    ]
});

// Styles for PDF
const styles = StyleSheet.create({
    page: {
        padding: '20mm',
        fontSize: 10,
        fontFamily: 'Inter',
        lineHeight: 1.4,
        color: '#000000',
    },
    coverPage: {
        padding: '20mm',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottom: '1pt solid #cccccc',
        paddingBottom: 5,
    },
    headerText: {
        fontSize: 9,
        color: '#333333',
    },
    pageNumber: {
        position: 'absolute',
        fontSize: 9,
        bottom: '10mm',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#333333',
    },
    companyInfo: {
        fontSize: 9,
        color: '#333333',
        lineHeight: 1.4,
    },
    offices: {
        fontSize: 8,
        color: '#333333',
        marginTop: 20,
    },
    logo: {
        width: 150,
        marginBottom: 15,
    },
    coverTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 100,
        marginBottom: 10,
    },
    coverSubtitle: {
        fontSize: 14,
        marginBottom: 40,
        fontWeight: 'bold',
    },
    coverInfo: {
        fontSize: 12,
        marginBottom: 5,
    },
    confidentialityText: {
        fontSize: 9,
        marginTop: 'auto',
        color: '#333333',
        textAlign: 'justify',
        paddingTop: 30,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottom: '1pt solid #cccccc',
    },
    subsectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
    },
    infoTable: {
        marginBottom: 15,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    infoLabel: {
        width: '30%',
        fontWeight: 'bold',
    },
    infoValue: {
        width: '70%',
    },
    experienceItem: {
        marginBottom: 15,
    },
    dateCompanyRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    dates: {
        width: '20%',
        fontWeight: 'bold',
    },
    company: {
        width: '80%',
        fontWeight: 'bold',
    },
    jobTitle: {
        marginLeft: '20%',
        marginBottom: 3,
    },
    description: {
        marginLeft: '20%',
        textAlign: 'justify',
        fontSize: 9,
    },
    educationItem: {
        marginBottom: 15,
    },
    educationDate: {
        fontWeight: 'bold',
    },
    educationDegree: {
        fontWeight: 'bold',
    },
    educationRow: {
        marginLeft: '20%',
        marginBottom: 3,
    },
    personalityText: {
        textAlign: 'justify',
        marginBottom: 10,
        fontSize: 9,
        lineHeight: 1.5,
    },
    personalityTitle: {
        fontWeight: 'bold',
        marginBottom: 3,
    },
    summaryText: {
        textAlign: 'justify',
        fontSize: 9,
        lineHeight: 1.5,
    },
    summaryTitle: {
        fontWeight: 'bold',
        marginBottom: 3,
    },
});

// Component for page header with consistent formatting
const PageHeader = ({ candidateName, pageNumber }) => (
    <View style={styles.header} fixed>
        <Text style={styles.headerText}>Vertraulicher Bericht {candidateName} - {pageNumber} -</Text>
    </View>
);

// Component for page footer
const PageFooter = () => (
    <View fixed style={styles.pageNumber}>
        {/* No text needed, the page has its own page number in the header */}
    </View>
);

// Component for cover page
const CoverPage = ({ candidate, assignment, date }) => (
    <Page size="A4" style={styles.coverPage}>
        <View>
            <Image src="./assets/images/signium-logo.png" style={styles.logo} />
            <Text style={styles.companyInfo}>Signium International GmbH</Text>
            <Text style={styles.companyInfo}>Marcus Kötting</Text>
            <Text style={styles.companyInfo}>Mauerkircherstraße 181</Text>
            <Text style={styles.companyInfo}>81925 München</Text>
            <Text style={styles.companyInfo}>t +49 (0)89 927 96 150</Text>
            <Text style={styles.companyInfo}>e marcus.koetting@signium.de</Text>
            <Text style={styles.companyInfo}>w signium.de</Text>
        </View>
        <Text style={styles.offices}>OFFICES WORLDWIDE</Text>

        <Text style={styles.coverTitle}>Vertraulicher Bericht</Text>
        <Text style={styles.coverSubtitle}>{candidate.personal_data.name}</Text>
        <Text style={styles.coverInfo}>{assignment.client?.name || 'Client'}</Text>
        <Text style={styles.coverInfo}>Position: {assignment.name}</Text>
        <Text style={styles.coverInfo}>Standort:</Text>
        <Text style={styles.coverInfo} style={{ marginTop: 40 }}>Präsentiert von:</Text>
        <Text style={styles.coverInfo}>Marcus Kötting</Text>
        <Text style={styles.coverInfo}>{date}</Text>

        <Text style={styles.confidentialityText}>
            Vertraulichkeitsklausel{'\n'}
            Dieser Vertrauliche Bericht enthält zum Teil Informationen, die uns unter Zusicherung strengster Vertraulichkeit mitgeteilt wurden. Entsprechend unseren
            berufsethischen Prinzipien müssen wir Sie dazu verpflichten, nur einer begrenzten Auswahl von Personen, die sich direkt mit der Auswertung befassen, Einsicht
            in diese Berichte zu gewähren. Der Inhalt muss auch jeglichen Drittpersonen gegenüber geheim gehalten werden. Es dürfen keinerlei Referenzen ohne
            Zustimmung des Kandidaten oder unsererseits eingeholt werden.
        </Text>
    </Page>
);

// Component for Personal Data page
const PersonalDataPage = ({ candidate }) => {
    const { personal_data } = candidate;

    return (
        <Page size="A4" style={styles.page}>
            <PageHeader candidateName={personal_data.name} pageNumber="2" />

            <Text style={styles.sectionTitle}>Persönliche Daten</Text>

            <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{personal_data.name || ''}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Adresse:</Text>
                    <Text style={styles.infoValue}>{personal_data.address || ''}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Telefonnummer:</Text>
                    <Text style={styles.infoValue}>{personal_data.phone || ''}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoValue}>{personal_data.email || ''}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Alter / Geburtsdatum:</Text>
                    <Text style={styles.infoValue}>
                        {personal_data.age ? `${personal_data.age} J.` : ''} / {personal_data.birthdate || ''}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Familienstand:</Text>
                    <Text style={styles.infoValue}>{personal_data.marital_status || ''}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nationalität:</Text>
                    <Text style={styles.infoValue}>{personal_data.nationality || ''}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sprachkenntnisse:</Text>
                    <View style={styles.infoValue}>
                        {Object.entries(personal_data.languages || {}).map(([language, level], index) => (
                            <Text key={index}>{language} {level}</Text>
                        ))}
                    </View>
                </View>
            </View>

            <Text style={styles.subsectionTitle}>Einkommen (wie von dem Kandidaten angegeben)</Text>
            <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Aktuelles Zielgehalt</Text>
                    <Text style={styles.infoValue}>€</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>davon fix</Text>
                    <Text style={styles.infoValue}>€</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>davon variabel</Text>
                    <Text style={styles.infoValue}>€</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Sonstiges</Text>
                    <Text style={styles.infoValue}></Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Erwartung</Text>
                    <Text style={styles.infoValue}></Text>
                </View>
            </View>

            <View style={styles.infoTable}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Kündigungsfrist</Text>
                    <Text style={styles.infoValue}>Monate zum Monatsende</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Umzugsbereitschaft</Text>
                    <Text style={styles.infoValue}></Text>
                </View>
            </View>

            <PageFooter />
        </Page>
    );
};

// Component for Work Experience
const WorkExperiencePage = ({ candidate }) => {
    const { experience, personal_data } = candidate;

    return (
        <Page size="A4" style={styles.page}>
            <PageHeader candidateName={personal_data.name} pageNumber="3" />

            <Text style={styles.sectionTitle}>Beurteilung und Empfehlung</Text>
            <Text style={styles.subsectionTitle}>Beruflich-fachliche Erfahrung</Text>

            {experience && experience.map((exp, index) => (
                <View style={styles.experienceItem} key={index}>
                    <View style={styles.dateCompanyRow}>
                        <Text style={styles.dates}>{exp.years || ''}</Text>
                        <Text style={styles.company}>
                            {exp.company || ''}{exp.location ? `, ${exp.location}` : ', DE'}
                        </Text>
                    </View>
                    <Text style={styles.jobTitle}>{exp.title || ''}</Text>
                    <Text style={styles.description}>{exp.description || ''}</Text>
                </View>
            ))}

            <PageFooter />
        </Page>
    );
};

// Component for Education
const EducationPage = ({ candidate }) => {
    const { education, personal_data } = candidate;

    return (
        <Page size="A4" style={styles.page}>
            <PageHeader candidateName={personal_data.name} pageNumber="4" />

            <Text style={styles.subsectionTitle}>Theoretische Ausbildung:</Text>

            {education && education.map((edu, index) => (
                <View style={styles.educationItem} key={index}>
                    <View style={styles.dateCompanyRow}>
                        <Text style={styles.dates}>{edu.years || ''}</Text>
                        <Text style={styles.company}>Abschluss {edu.degree || ''}</Text>
                    </View>

                    <View style={styles.educationRow}>
                        <Text>
                            <Text style={{ fontWeight: 'bold' }}>Universität / Bildungseinrichtung: </Text>
                            {edu.institution || ''}
                        </Text>
                    </View>

                    <View style={styles.educationRow}>
                        <Text>
                            <Text style={{ fontWeight: 'bold' }}>Studiengang: </Text>
                            {edu.field || ''}
                        </Text>
                    </View>

                    <View style={styles.educationRow}>
                        <Text>
                            <Text style={{ fontWeight: 'bold' }}>Beschreibung: </Text>
                            {edu.description || '-'}
                        </Text>
                    </View>

                    {/* Weiterbildung section - this appears in the sample report */}
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>Weiterbildung:</Text>
                        <Text style={styles.educationRow}>
                            Development Center for Potential Leaders und Präsentationstraining – Storyline und Visualisierung (beides 2024)
                        </Text>
                        <Text style={styles.educationRow}>
                            Diverse Course auf Coursera (Data Analysis, RPA, etc.)
                        </Text>
                    </View>
                </View>
            ))}

            <PageFooter />
        </Page>
    );
};

// Format the AI generated text into paragraphs
const formatAiText = (text) => {
    if (!text) return [];

    // Replace double hyphens with em dashes
    text = text.replace(/--/g, '—');

    // First split by paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs;
};

// Component for Personality Assessment
const PersonalityPage = ({ candidate, content }) => {
    const paragraphs = formatAiText(content);

    return (
        <Page size="A4" style={styles.page}>
            <PageHeader candidateName={candidate.personal_data.name} pageNumber="5" />

            <Text style={styles.sectionTitle}>Persönlichkeit und Fähigkeiten</Text>

            <Text style={styles.personalityTitle}>PERSÖNLICHKEIT</Text>
            {paragraphs.map((paragraph, idx) => (
                <Text key={idx} style={styles.personalityText}>
                    {paragraph}
                </Text>
            ))}

            <PageFooter />
        </Page>
    );
};

// Component for Summary
const SummaryPage = ({ candidate, content }) => {
    const paragraphs = formatAiText(content);

    return (
        <Page size="A4" style={styles.page}>
            <PageHeader candidateName={candidate.personal_data.name} pageNumber="6" />

            <Text style={styles.summaryTitle}>ZUSAMMENFASSUNG</Text>
            {paragraphs.map((paragraph, idx) => (
                <Text key={idx} style={styles.summaryText}>
                    {paragraph}
                </Text>
            ))}

            <PageFooter />
        </Page>
    );
};

// Main PDF Document Component
const CandidateReport = ({ candidateData, reportSections, assignment }) => {
    const date = new Date().toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <Document>
            <CoverPage
                candidate={candidateData}
                assignment={assignment}
                date={date}
            />

            <PersonalDataPage candidate={candidateData} />

            <WorkExperiencePage candidate={candidateData} />

            <EducationPage candidate={candidateData} />

            <PersonalityPage
                candidate={candidateData}
                content={reportSections.personality_section}
            />

            <SummaryPage
                candidate={candidateData}
                content={reportSections.summary_section}
            />
        </Document>
    );
};

// PDF Generation Service optimized for Electron (no browser support needed)
class PdfGenerator {
    // Generate PDF buffer for saving via Electron
    async generatePdfBuffer(candidateData, reportSections, assignment) {
        try {
            // Create the PDF document
            const pdfDocument = (
                <CandidateReport
                    candidateData={candidateData}
                    reportSections={reportSections}
                    assignment={assignment}
                />
            );

            // Generate PDF blob
            const blob = await pdf(pdfDocument).toBlob();

            // Convert blob to base64 string for IPC transmission
            return await this._blobToBase64(blob);
        } catch (error) {
            console.error('Error generating PDF buffer:', error);
            throw new Error('Failed to generate PDF report: ' + error.message);
        }
    }

    // Helper function to convert Blob to base64 string
    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Get the base64 string from the FileReader result
                // The result looks like "data:application/pdf;base64,XXXX..."
                // We need to extract just the base64 part
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
}

export default PdfGenerator;