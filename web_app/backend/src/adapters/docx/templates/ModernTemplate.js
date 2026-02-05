import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export class ModernTemplate {
  /**
   * Generates a DOCX buffer from resume data using Modern template style
   * @param {Resume} resume - The resume entity to convert to DOCX
   * @returns {Promise<Uint8Array>} - DOCX buffer as Uint8Array
   */
  async generate(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    const sections = resume.sections || {};

    // Extract styles
    const style = resume.style || {};
    
    const fontFamily = 'Inter'; // Request Inter, fallback to Word default if missing
    const fontSize = style.fontSize || 11;
    
    // Color parsing
    const parseHexColor = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? result[0] : '2463EB'; 
    };
    
    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const slate900 = '0f172a';
    const slate700 = '334155';
    const slate500 = '64748b';

    const docSections = [];

    // Helper for Section Headers
    const createSectionHeader = (text) => {
      return new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        run: {
          font: fontFamily,
          size: 24, // 12pt
          bold: true,
          color: accentColor,
          allCaps: true,
          characterSpacing: 20 // Tracking
        },
        border: {
             // Optional: bottom border often used in Modern templates? 
             // Vue template didn't clearly show it, just spacing.
        }
      });
    };

    // --- HEADER ---
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      docSections.push(
        new Paragraph({
          text: fullName,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.LEFT,
          run: {
            font: fontFamily,
            size: 48, // 24pt
            bold: true,
            color: slate900
          }
        })
      );
    }

    if (sections.title) {
        docSections.push(new Paragraph({
        text: sections.title,
        alignment: AlignmentType.LEFT,
        run: {
          font: fontFamily,
          size: 28, // 14pt
          bold: true,
          italics: true,
          color: accentColor
        },
        spacing: { after: 100 }
      }));
    }

    // Contact Info
    const contactParts = [
      sections.email,
      sections.phone,
      sections.location,
      ...(sections.socials || []).map(s => s.url || s.username)
    ].filter(Boolean).join(' • ');

    if (contactParts) {
      docSections.push(new Paragraph({
        text: contactParts,
        alignment: AlignmentType.LEFT,
        run: {
          font: fontFamily,
          size: 20, // 10pt
          color: slate500
        },
        spacing: { after: 300 }
      }));
    }

    // --- SUMMARY ---
    if (sections.summary) {
      docSections.push(createSectionHeader('Profile'));
      docSections.push(new Paragraph({
        text: sections.summary,
        run: {
          font: fontFamily,
          size: fontSize * 2,
          color: slate700
        }
      }));
    }

    // --- EXPERIENCE ---
    if (sections.experience?.length > 0) {
      docSections.push(createSectionHeader('Experience'));
      
      for (const job of sections.experience) {
        // Company Name
        docSections.push(new Paragraph({
             text: job.company || '',
             run: {
                 font: fontFamily,
                 size: 24, // 12pt
                 bold: true,
                 color: slate900
             },
             spacing: { before: 100 }
        }));

        // Title + Date
        // Word is easier to stack than side-by-side without tables/tabs
        // Let's stack them for reliability
        
        const title = job.title || job.position || '';
        if (title) {
            docSections.push(new Paragraph({
                text: title,
                run: {
                    font: fontFamily,
                    size: fontSize * 2,
                    bold: true,
                    italics: true,
                    color: accentColor
                }
            }));
        }
        
        const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ') || job.date;
        const meta = [dateRange, job.location].filter(Boolean).join(' | ');
        if (meta) {
            docSections.push(new Paragraph({
                text: meta,
                run: {
                    font: fontFamily,
                    size: (fontSize - 1) * 2,
                    color: slate500
                }
            }));
        }

        // Description
        if (job.description) {
            docSections.push(new Paragraph({
                text: job.description,
                run: {
                    font: fontFamily,
                    size: fontSize * 2,
                    color: slate700
                },
                spacing: { before: 100 }
            }));
        }

        // Achievements
        if (job.achievements?.length > 0) {
            for (const ach of job.achievements) {
                docSections.push(new Paragraph({
                    text: ach,
                    bullet: { level: 0 },
                    run: {
                        font: fontFamily,
                        size: fontSize * 2,
                        color: slate700
                    }
                }));
            }
        }
      }
    }

    // --- EDUCATION ---
    if (sections.education?.length > 0) {
      docSections.push(createSectionHeader('Education'));
      for (const edu of sections.education) {
           docSections.push(new Paragraph({
               text: edu.school || edu.university,
               run: {
                   font: fontFamily,
                   size: 24,
                   bold: true,
                   color: slate900
               },
               spacing: { before: 100 }
           }));
           
           const degree = [edu.degree, edu.field].filter(Boolean).join(', ');
           if (degree) {
               docSections.push(new Paragraph({
                   text: degree,
                   run: {
                       font: fontFamily,
                       size: fontSize * 2,
                       color: slate700
                   }
               }));
           }
           
           const date = [edu.startDate, edu.endDate].filter(Boolean).join(' - ') || edu.year;
           if (date) {
               docSections.push(new Paragraph({
                   text: date,
                   run: {
                       font: fontFamily,
                       size: (fontSize - 1) * 2,
                       color: slate500
                   }
               }));
           }
      }
    }

    // --- SKILLS ---
    const skills = sections.skills;
    if (skills) {
       docSections.push(createSectionHeader('Skills'));
       let skillText = '';
       if (Array.isArray(skills)) {
           skillText = skills.join(' • ');
       } else if (typeof skills === 'object') {
           const parts = [];
           if (skills.technical) parts.push(`Technical: ${Array.isArray(skills.technical) ? skills.technical.join(', ') : skills.technical}`);
           if (skills.soft) parts.push(`Soft: ${Array.isArray(skills.soft) ? skills.soft.join(', ') : skills.soft}`);
           if (skills.languages) parts.push(`Languages: ${Array.isArray(skills.languages) ? skills.languages.join(', ') : skills.languages}`);
           
            for (const part of parts) {
                docSections.push(new Paragraph({
                    text: part,
                    run: {
                        font: fontFamily,
                        size: fontSize * 2,
                        color: slate700
                    }
                }));
            }
            skillText = ''; 
       }

       if (skillText) {
          docSections.push(new Paragraph({
              text: skillText,
              run: {
                  font: fontFamily,
                  size: fontSize * 2,
                  color: slate700
              }
          }));
       }
    }
    
    // --- PROJECTS ---
    if (sections.projects?.length > 0) {
        docSections.push(createSectionHeader('Projects'));
        for (const proj of sections.projects) {
            docSections.push(new Paragraph({
                text: proj.name,
                run: { font: fontFamily, size: 24, bold: true, color: slate900 },
                spacing: { before: 100 }
            }));
            if (proj.description) {
                docSections.push(new Paragraph({
                    text: proj.description,
                    run: { font: fontFamily, size: fontSize * 2, color: slate700 }
                }));
            }
             if (proj.url) {
                docSections.push(new Paragraph({
                    text: proj.url,
                    run: { font: fontFamily, size: (fontSize - 1) * 2, color: accentColor }
                }));
            }
        }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections
      }]
    });

    return Packer.toBuffer(doc);
  }
}
