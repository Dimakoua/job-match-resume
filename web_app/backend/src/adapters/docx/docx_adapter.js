import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export class DocxAdapter {
  /**
   * Generates a DOCX buffer from resume data
   * @param {Resume} resume - The resume entity to convert to DOCX
   * @returns {Promise<Uint8Array>} - DOCX buffer as Uint8Array
   */
  async generateBuffer(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    if (!resume.sections || typeof resume.sections !== 'object') {
      throw new Error('Resume must have sections object');
    }

    // Extract styles from resume
    const style = resume.style || {};
    const layout = resume.layout || {};
    
    // Font size mapping
    const fontSize = style.fontSize || 11;
    const titleFontSize = Math.max(fontSize + 5, 16);
    const headingFontSize = Math.max(fontSize + 1, 13);
    
    // Font family mapping
    const fontFamilyMap = {
      'inter': 'Inter',
      'playfair': 'Playfair Display',
      'roboto': 'Roboto',
      'lora': 'Lora',
      'open-sans': 'Open Sans',
      'roboto-mono': 'Roboto Mono'
    };
    
    const bodyFont = fontFamilyMap[style.bodyFont] || 'Inter';
    const headingFont = fontFamilyMap[style.headingFont] || 'Inter';
    
    // Color parsing
    const parseHexColor = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? result[0] : '2463EB'; // Default blue
    };
    
    const accentColor = parseHexColor(style.accentColor || '#2463eb');

    const sections = resume.sections;
    const docSections = [];

    // Add header with personal info
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      docSections.push(
        new Paragraph({
          text: fullName,
          heading: HeadingLevel.TITLE,
          run: {
            font: headingFont,
            size: titleFontSize * 2, // DOCX uses half-points
            color: accentColor
          }
        })
      );
    }

    // Add title
    if (sections.title) {
      docSections.push(new Paragraph({
        text: sections.title,
        run: {
          font: bodyFont,
          size: (fontSize + 2) * 2,
          color: accentColor
        }
      }));
    }

    // Add contact info
    if (sections.email || sections.phone || sections.location) {
      const contactInfo = [sections.email, sections.phone, sections.location].filter(Boolean).join(' • ');
      docSections.push(new Paragraph(contactInfo));
    }

    docSections.push(new Paragraph('')); // Spacing

    // Add summary
    if (sections.summary) {
      docSections.push(
        new Paragraph({
          text: 'Profile',
          heading: HeadingLevel.HEADING_2,
          run: {
            font: headingFont,
            size: headingFontSize * 2,
            color: '666666'
          }
        })
      );
      docSections.push(new Paragraph({
        text: sections.summary,
        run: {
          font: bodyFont,
          size: fontSize * 2
        }
      }));
      docSections.push(new Paragraph('')); // Spacing
    }

    // Add experience
    if (sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Experience',
          heading: HeadingLevel.HEADING_2,
          run: {
            font: headingFont,
            size: headingFontSize * 2,
            color: '666666'
          }
        })
      );
      for (const job of sections.experience) {
        if (job.title || job.position || job.company) {
          const title = job.title || job.position || '';
          docSections.push(new Paragraph({
            children: [
              new TextRun({ 
                text: `${title} at ${job.company || ''}`, 
                bold: true,
                font: bodyFont,
                size: fontSize * 2,
                color: accentColor
              }),
            ],
          }));
        }
        if (job.startDate || job.endDate) {
          const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ');
          docSections.push(new Paragraph({
            text: dateRange,
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        } else if (job.duration || job.date) {
          docSections.push(new Paragraph({
            text: job.duration || job.date || '',
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        }
        if (job.location) {
          docSections.push(new Paragraph({
            text: job.location,
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        }
        if (job.description) {
          docSections.push(new Paragraph({
            text: job.description,
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        } else if (job.achievements && Array.isArray(job.achievements)) {
          for (const achievement of job.achievements) {
            docSections.push(new Paragraph({
              text: `• ${achievement}`,
              run: {
                font: bodyFont,
                size: (fontSize - 1) * 2
              }
            }));
          }
        }
        docSections.push(new Paragraph('')); // Spacing
      }
    }

    // Add education
    if (sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Education',
          heading: HeadingLevel.HEADING_2,
          run: {
            font: headingFont,
            size: headingFontSize * 2,
            color: '666666'
          }
        })
      );
      for (const edu of sections.education) {
        if (edu.school || edu.university) {
          const school = edu.school || edu.university || '';
          docSections.push(new Paragraph({
            text: school,
            run: {
              font: bodyFont,
              size: fontSize * 2
            }
          }));
        }
        if (edu.degree || edu.field) {
          const degreeText = [edu.degree, edu.field].filter(Boolean).join(', ');
          docSections.push(new Paragraph({
            text: degreeText,
            run: {
              font: bodyFont,
              size: fontSize * 2,
              color: accentColor
            }
          }));
        }
        if (edu.startDate || edu.endDate) {
          const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
          docSections.push(new Paragraph({
            text: dateRange,
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        } else if (edu.years) {
          docSections.push(new Paragraph({
            text: edu.years,
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        }
        docSections.push(new Paragraph('')); // Spacing
      }
    }

    // Add certifications
    if (sections.certifications && Array.isArray(sections.certifications) && sections.certifications.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Certifications',
          heading: HeadingLevel.HEADING_2,
          run: {
            font: headingFont,
            size: headingFontSize * 2,
            color: '666666'
          }
        })
      );
      for (const cert of sections.certifications) {
        if (cert.name) {
          let certText = cert.name;
          if (cert.issuer) certText += ` • ${cert.issuer}`;
          if (cert.date) certText += ` • ${cert.date}`;
          docSections.push(new Paragraph({
            text: certText,
            run: {
              font: bodyFont,
              size: fontSize * 2
            }
          }));
        }
      }
      docSections.push(new Paragraph('')); // Spacing
    }

    // Add projects
    if (sections.projects && Array.isArray(sections.projects) && sections.projects.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Projects',
          heading: HeadingLevel.HEADING_2,
          run: {
            font: headingFont,
            size: headingFontSize * 2,
            color: '666666'
          }
        })
      );
      for (const project of sections.projects) {
        if (project.name) {
          docSections.push(new Paragraph({
            children: [
              new TextRun({ 
                text: project.name, 
                bold: true,
                font: bodyFont,
                size: fontSize * 2
              }),
            ],
          }));
        }
        if (project.description) {
          docSections.push(new Paragraph({
            text: project.description,
            run: {
              font: bodyFont,
              size: (fontSize - 1) * 2
            }
          }));
        }
        docSections.push(new Paragraph('')); // Spacing
      }
    }

    // Add skills
    if (sections.skills && (Array.isArray(sections.skills) || typeof sections.skills === 'object')) {
      docSections.push(
        new Paragraph({
          text: 'Skills',
          heading: HeadingLevel.HEADING_2,
          run: {
            font: headingFont,
            size: headingFontSize * 2,
            color: '666666'
          }
        })
      );
      if (Array.isArray(sections.skills)) {
        docSections.push(new Paragraph({
          text: sections.skills.join(', '),
          run: {
            font: bodyFont,
            size: fontSize * 2
          }
        }));
      } else if (sections.skills.technical) {
        const skillText = Array.isArray(sections.skills.technical)
          ? sections.skills.technical.join(', ')
          : sections.skills.technical;
        docSections.push(new Paragraph({
          text: `Technical: ${skillText}`,
          run: {
            font: bodyFont,
            size: fontSize * 2
          }
        }));
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections,
      }],
    });

    // Serialize the DOCX to bytes
    const buffer = await Packer.toBuffer(doc);
    return new Uint8Array(buffer);
  }
}