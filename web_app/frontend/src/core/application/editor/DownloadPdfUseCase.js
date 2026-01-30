/**
 * DownloadPdfUseCase
 * Orchestrates generating a printable HTML resume
 * No dependencies - pure HTML generation logic
 */
export class DownloadPdfUseCase {
  generate(resumeData, styleSettings, layoutSettings) {
    const r = resumeData
    const s = styleSettings

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${this._getTitle(r)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; font-size: ${s.fontSize}pt; line-height: ${s.lineHeight}; color: #222; }
          .container { max-width: 800px; margin: 0 auto; padding: ${layoutSettings.margins}px; }
          h1 { font-size: 28pt; font-weight: bold; margin-bottom: 4px; }
          h2 { font-size: 10pt; text-transform: uppercase; letter-spacing: 0.1em; color: #888; border-bottom: 1px solid #eee; padding-bottom: 4px; margin-bottom: 12px; }
          .title { color: ${s.accentColor}; font-size: 14pt; }
          .contact { font-size: 9pt; color: #666; }
          .section { margin-bottom: ${layoutSettings.sectionSpacing}px; }
          .job { margin-bottom: 16px; }
          .job-header { display: flex; justify-content: space-between; }
          .company { font-weight: bold; font-size: 11pt; }
          .dates { font-size: 9pt; color: #666; font-style: italic; }
          .job-title { color: ${s.accentColor}; font-size: 10pt; font-weight: 600; }
          .skills { display: flex; flex-wrap: wrap; gap: 8px; }
          .skill { background: ${s.accentColor}15; color: ${s.accentColor}; padding: 4px 12px; border-radius: 4px; font-size: 9pt; font-weight: 600; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <div class="container">
          <header style="border-bottom: 2px solid ${s.accentColor}; padding-bottom: 16px; margin-bottom: 24px;">
            <h1>${r.firstName || ''} ${r.lastName || ''}</h1>
            <p class="title">${r.title || ''}</p>
            <p class="contact">${[r.email, r.phone, r.location].filter(Boolean).join(' • ')}</p>
          </header>
          
          ${r.summary ? `
          <div class="section">
            <h2>Profile</h2>
            <p>${r.summary}</p>
          </div>
          ` : ''}
          
          ${r.experience?.length ? `
          <div class="section">
            <h2>Experience</h2>
            ${r.experience.filter(e => e.company || e.title).map(exp => `
              <div class="job">
                <div class="job-header">
                  <span class="company">${exp.company || ''}</span>
                  <span class="dates">${exp.startDate || ''} — ${exp.endDate || ''}</span>
                </div>
                <p class="job-title">${exp.title || ''}</p>
                <p>${exp.description || ''}</p>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          ${r.skills?.length ? `
          <div class="section">
            <h2>Skills</h2>
            <div class="skills">
              ${r.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </body>
      </html>
    `
  }

  download(resumeData, styleSettings, layoutSettings) {
    const html = this.generate(resumeData, styleSettings, layoutSettings)
    const printWindow = window.open('', '_blank')
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  _getTitle(resumeData) {
    if (resumeData.title) {
      return resumeData.title
    }
    if (resumeData.firstName || resumeData.lastName) {
      return `${resumeData.firstName} ${resumeData.lastName}`.trim() + "'s Resume"
    }
    return 'Untitled Resume'
  }
}
