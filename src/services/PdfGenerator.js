// src/services/PdfGenerator.js

class PdfGenerator {
    constructor() {
        // Simple paths that will be replaced with data URIs in Electron
        this.logoPath = "assets/images/signium-logo.png";
        this.watermarkPath = "assets/images/signium-logo-white.png";
        this.bannerPath = "assets/images/signium-banner.png";
    }

    /**
     * Generate PDF report for candidate
     * @param {Object} candidateData - The candidate data
     * @param {Object} reportSections - The AI-generated report sections
     * @param {Object} assignment - The assignment data
     * @returns {Promise<string>} - Base64-encoded PDF content
     */
    async generatePdfBuffer(candidateData, reportSections, assignment) {
        try {
            console.log('Generating PDF buffer...');

            // Generate HTML content
            const htmlContent = this._generateHTML(candidateData, reportSections, assignment);

            console.log('Sending HTML to main process for PDF conversion...');

            // Use Electron's API to convert HTML to PDF via IPC
            const pdfData = await window.api.convertHtmlToPdf({
                html: htmlContent,
                options: {
                    printBackground: true,
                    pageSize: 'A4',
                    margin: {
                        top: '20mm',
                        bottom: '20mm',
                        left: '20mm',
                        right: '20mm'
                    }
                }
            });

            console.log('PDF data received from main process');
            return pdfData;
        } catch (error) {
            console.error('Error generating PDF buffer:', error);
            throw new Error('Failed to generate PDF report: ' + error.message);
        }
    }

    /**
     * Generate HTML for the PDF report
     * @private
     */
    _generateHTML(candidateData, reportSections, assignment) {
        const { personal_data, experience, education } = candidateData;
        const date = new Date().toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>Vertraulicher Bericht ${personal_data.name}</title>
            <style>
                /* Base styles */
                body {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 10pt;
                    line-height: 1.4;
                    color: #000000;
                    background-color: #FFFFFF;
                    margin: 0;
                    padding: 0;
                }
                
                /* Page setup for print */
                @page {
                    size: A4;
                    margin: 20mm;
                }
                
                /* Common components */
                .page {
                    position: relative;
                    page-break-after: always;
                    height: 257mm; /* A4 height minus margins */
                    padding: 0;
                    box-sizing: border-box;
                }
                
                .page:last-child {
                    page-break-after: avoid;
                }
                
                .header {
                    border-bottom: 1pt solid #cccccc;
                    padding-bottom: 5pt;
                    margin-bottom: 10pt;
                    font-size: 9pt;
                    color: #333333;
                }
                
                .section-title {
                    font-size: 13pt;
                    font-weight: bold;
                    margin-bottom: 10pt;
                    padding-bottom: 5pt;
                    border-bottom: 1pt solid #cccccc;
                    color: #000000;
                }
                
                .subsection-title {
                    font-size: 12pt;
                    font-weight: bold;
                    margin-top: 15pt;
                    margin-bottom: 5pt;
                    color: #000000;
                }
                
                /* Cover page specific */
                .cover-page {
                    position: relative;
                    height: 257mm;
                }
                
                .company-info {
                    font-size: 9pt;
                    color: #333333;
                    line-height: 1.4;
                }
                
                .company-info p {
                    margin: 3pt 0;
                }
                
                .logo {
                    width: 150px;
                    margin-bottom: 15px;
                }
                
                .offices {
                    font-size: 8pt;
                    color: #333333;
                    margin-top: 20px;
                }
                
                .cover-title {
                    font-size: 18pt;
                    font-weight: bold;
                    margin-top: 100px;
                    margin-bottom: 10px;
                    color: #000000;
                }
                
                .cover-subtitle {
                    font-size: 14pt;
                    margin-bottom: 40px;
                    font-weight: bold;
                    color: #000000;
                }
                
                .cover-info {
                    font-size: 12pt;
                    margin-bottom: 5px;
                    color: #000000;
                }
                
                .confidentiality-text {
                    font-size: 9pt;
                    position: absolute;
                    bottom: 20mm;
                    left: 0;
                    right: 0;
                    color: #333333;
                    text-align: justify;
                }
                
                .confidentiality-text p {
                    margin: 5pt 0;
                }
                
                /* Info tables */
                .info-table {
                    width: 100%;
                    margin-bottom: 15px;
                }
                
                .info-row {
                    display: flex;
                    margin-bottom: 4px;
                }
                
                .info-label {
                    width: 30%;
                    font-weight: bold;
                    color: #000000;
                }
                
                .info-value {
                    width: 70%;
                    color: #000000;
                }
                
                /* Experience section */
                .experience-item {
                    margin-bottom: 15px;
                }
                
                .date-company-row {
                    display: flex;
                    margin-bottom: 3px;
                }
                
                .dates {
                    width: 20%;
                    font-weight: bold;
                    color: #000000;
                }
                
                .company {
                    width: 80%;
                    font-weight: bold;
                    color: #000000;
                }
                
                .job-title {
                    margin-left: 20%;
                    margin-bottom: 3px;
                    color: #000000;
                }
                
                .description {
                    margin-left: 20%;
                    text-align: justify;
                    font-size: 9pt;
                    color: #000000;
                }
                
                /* Education section */
                .education-item {
                    margin-bottom: 15px;
                }
                
                .education-row {
                    margin-left: 20%;
                    margin-bottom: 3px;
                    color: #000000;
                }
                
                /* Personality and Summary */
                .personality-text, .summary-text {
                    text-align: justify;
                    font-size: 9pt;
                    line-height: 1.5;
                    margin-bottom: 10px;
                    color: #000000;
                }
                
                .personality-title, .summary-title {
                    font-weight: bold;
                    margin-bottom: 3px;
                    color: #000000;
                }
                
                /* Watermark for all pages after cover */
                .watermark {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 50%;
                    opacity: 0.05;
                    z-index: -1;
                }
                
                /* Banner for the top of each page */
                .banner {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100px;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <!-- Cover Page -->
            <div class="page cover-page">
                <img src="${this.logoPath}" class="logo" alt="Signium Logo">
                
                <div class="company-info">
                    <p>Signium International GmbH</p>
                    <p>Marcus Kötting</p>
                    <p>Mauerkircherstraße 181</p>
                    <p>81925 München</p>
                    <p>t +49 (0)89 927 96 150</p>
                    <p>e marcus.koetting@signium.de</p>
                    <p>w signium.de</p>
                </div>
                
                <p class="offices">OFFICES WORLDWIDE</p>
                
                <h1 class="cover-title">Vertraulicher Bericht</h1>
                <h2 class="cover-subtitle">${personal_data.name}</h2>
                <p class="cover-info">${assignment.client?.name || 'Client'}</p>
                <p class="cover-info">Position: ${assignment.name}</p>
                <p class="cover-info">Standort:</p>
                <p class="cover-info" style="margin-top: 40px;">Präsentiert von:</p>
                <p class="cover-info">Marcus Kötting</p>
                <p class="cover-info">${date}</p>
                
                <div class="confidentiality-text">
                    <p>Vertraulichkeitsklausel</p>
                    <p>Dieser Vertrauliche Bericht enthält zum Teil Informationen, die uns unter Zusicherung strengster Vertraulichkeit mitgeteilt wurden. Entsprechend unseren
                    berufsethischen Prinzipien müssen wir Sie dazu verpflichten, nur einer begrenzten Auswahl von Personen, die sich direkt mit der Auswertung befassen, Einsicht
                    in diese Berichte zu gewähren. Der Inhalt muss auch jeglichen Drittpersonen gegenüber geheim gehalten werden. Es dürfen keinerlei Referenzen ohne
                    Zustimmung des Kandidaten oder unsererseits eingeholt werden.</p>
                </div>
            </div>
            
            <!-- Personal Data Page -->
            <div class="page">
                <img src="${this.watermarkPath}" class="watermark" alt="Signium Watermark">
                <img src="${this.bannerPath}" class="banner" alt="Signium Banner">
                
                <div class="header">
                    Vertraulicher Bericht ${personal_data.name} - 2 -
                </div>
                
                <h2 class="section-title">Persönliche Daten</h2>
                
                <div class="info-table">
                    <div class="info-row">
                        <div class="info-label">Name:</div>
                        <div class="info-value">${personal_data.name || ''}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Adresse:</div>
                        <div class="info-value">${personal_data.address || ''}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Telefonnummer:</div>
                        <div class="info-value">${personal_data.phone || ''}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">${personal_data.email || ''}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Alter / Geburtsdatum:</div>
                        <div class="info-value">
                            ${personal_data.age ? `${personal_data.age} J.` : ''} / ${personal_data.birthdate || ''}
                        </div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Familienstand:</div>
                        <div class="info-value">${personal_data.marital_status || ''}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Nationalität:</div>
                        <div class="info-value">${personal_data.nationality || ''}</div>
                    </div>
                    
                    <div class="info-row">
                        <div class="info-label">Sprachkenntnisse:</div>
                        <div class="info-value">
                            ${Object.entries(personal_data.languages || {}).map(([language, level]) =>
            `${language} ${level}<br>`
        ).join('')}
                        </div>
                    </div>
                </div>
                
                <h3 class="subsection-title">Einkommen (wie von dem Kandidaten angegeben)</h3>
                <div class="info-table">
                    <div class="info-row">
                        <div class="info-label">Aktuelles Zielgehalt</div>
                        <div class="info-value">€</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">davon fix</div>
                        <div class="info-value">€</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">davon variabel</div>
                        <div class="info-value">€</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Sonstiges</div>
                        <div class="info-value"></div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Erwartung</div>
                        <div class="info-value"></div>
                    </div>
                </div>
                
                <div class="info-table">
                    <div class="info-row">
                        <div class="info-label">Kündigungsfrist</div>
                        <div class="info-value">Monate zum Monatsende</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Umzugsbereitschaft</div>
                        <div class="info-value"></div>
                    </div>
                </div>
            </div>
            
            <!-- Work Experience Page -->
            <div class="page">
                <img src="${this.watermarkPath}" class="watermark" alt="Signium Watermark">
                <img src="${this.bannerPath}" class="banner" alt="Signium Banner">
                
                <div class="header">
                    Vertraulicher Bericht ${personal_data.name} - 3 -
                </div>
                
                <h2 class="section-title">Beurteilung und Empfehlung</h2>
                <h3 class="subsection-title">Beruflich-fachliche Erfahrung</h3>
                
                ${experience && experience.map(exp => `
                    <div class="experience-item">
                        <div class="date-company-row">
                            <div class="dates">${exp.years || ''}</div>
                            <div class="company">
                                ${exp.company || ''}${exp.location ? `, ${exp.location}` : ', DE'}
                            </div>
                        </div>
                        <div class="job-title">${exp.title || ''}</div>
                        <div class="description">${exp.description || ''}</div>
                    </div>
                `).join('')}
            </div>
            
            <!-- Education Page -->
            <div class="page">
                <img src="${this.watermarkPath}" class="watermark" alt="Signium Watermark">
                <img src="${this.bannerPath}" class="banner" alt="Signium Banner">
                
                <div class="header">
                    Vertraulicher Bericht ${personal_data.name} - 4 -
                </div>
                
                <h3 class="subsection-title">Theoretische Ausbildung:</h3>
                
                ${education && education.map((edu, index) => `
                    <div class="education-item">
                        <div class="date-company-row">
                            <div class="dates">${edu.years || ''}</div>
                            <div class="company">Abschluss ${edu.degree || ''}</div>
                        </div>
                        
                        <div class="education-row">
                            <strong>Universität / Bildungseinrichtung: </strong>
                            ${edu.institution || ''}
                        </div>
                        
                        <div class="education-row">
                            <strong>Studiengang: </strong>
                            ${edu.field || ''}
                        </div>
                        
                        <div class="education-row">
                            <strong>Beschreibung: </strong>
                            ${edu.description || '-'}
                        </div>
                        
                        <!-- Weiterbildung section as in sample report -->
                        ${index === 0 ? `
                            <div style="margin-top: 10px;">
                                <strong style="margin-left: 20%;">Weiterbildung:</strong>
                                <div class="education-row">
                                    Development Center for Potential Leaders und Präsentationstraining – Storyline und Visualisierung (beides 2024)
                                </div>
                                <div class="education-row">
                                    Diverse Course auf Coursera (Data Analysis, RPA, etc.)
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <!-- Personality Page -->
            <div class="page">
                <img src="${this.watermarkPath}" class="watermark" alt="Signium Watermark">
                <img src="${this.bannerPath}" class="banner" alt="Signium Banner">
                
                <div class="header">
                    Vertraulicher Bericht ${personal_data.name} - 5 -
                </div>
                
                <h2 class="section-title">Persönlichkeit und Fähigkeiten</h2>
                
                <div class="personality-title">PERSÖNLICHKEIT</div>
                ${this._formatAIText(reportSections.personality_section).map(para =>
            `<div class="personality-text">${para}</div>`
        ).join('')}
            </div>
            
            <!-- Summary Page -->
            <div class="page">
                <img src="${this.watermarkPath}" class="watermark" alt="Signium Watermark">
                <img src="${this.bannerPath}" class="banner" alt="Signium Banner">
                
                <div class="header">
                    Vertraulicher Bericht ${personal_data.name} - 6 -
                </div>
                
                <div class="summary-title">ZUSAMMENFASSUNG</div>
                ${this._formatAIText(reportSections.summary_section).map(para =>
            `<div class="summary-text">${para}</div>`
        ).join('')}
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Format AI generated text into paragraphs
     * @private
     */
    _formatAIText(text) {
        if (!text) return [];

        // Replace double hyphens with em dashes
        text = text.replace(/--/g, '—');

        // Split by paragraphs
        return text.split(/\n\n+/);
    }
}

export default PdfGenerator;