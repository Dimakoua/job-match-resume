import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export class ProfessionalTemplate {
  /**
   * Generates a DOCX buffer from resume data using Professional template style
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

    const fontFamily = 'Inter';
    const fontSize = style.fontSize || 11;

    // Color parsing
    const parseHexColor = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? result[0] : '2463EB';
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = '222222';
    const grayColor = '666666';

    const docSections = [];

    // Helper for Section Headers
    const createSectionHeader = (text) => {
      return new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        run: {
          font: fontFamily,
          size: 26, // 13pt
          bold: true,
          color: accentColor,
          allCaps: true
        },
        border: {
          bottom: {
            color: accentColor,
            space: 1,
            value: BorderStyle.SINGLE,
            size: 6
          }
        }
      });
    };

    // Header with accent border
    const headerParagraphs = [];

    // Top accent border
    headerParagraphs.push(
      new Paragraph({
        text: '',
        spacing: { after: 100 },
        border: {
          top: {
            color: accentColor,
            space: 1,
            value: BorderStyle.SINGLE,
            size: 12
          }
        }
      })
    );

    // Name
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    headerParagraphs.push(
      new Paragraph({
        text: fullName,
        spacing: { after: 50 },
        run: {
          font: fontFamily,
          size: 50, // 25pt
          bold: true,
          color: accentColor
        }
      })
    );

    // Professional Title
    if (resume.title) {
      headerParagraphs.push(
        new Paragraph({
          text: resume.title,
          spacing: { after: 100 },
          run: {
            font: fontFamily,
            size: 30, // 15pt
            bold: true,
            color: textColor
          }
        })
      );
    }

    // Contact Information
    const contactParts = [];
    if (resume.email) contactParts.push(resume.email);
    if (resume.phone) contactParts.push(`• ${resume.phone}`);
    if (resume.location) contactParts.push(`• ${resume.location}`);

    if (contactParts.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          text: contactParts.join(' '),
          spacing: { after: 150 },
          run: {
            font: fontFamily,
            size: 20, // 10pt
            color: grayColor
          }
        })
      );
    }

    // Bottom border
    headerParagraphs.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
        border: {
          bottom: {
            color: 'CCCCCC',
            space: 1,
            value: BorderStyle.SINGLE,
            size: 1
          }
        }
      })
    );

    // Add header to sections
    docSections.push(...headerParagraphs);

    // Sections
    const sectionOrder = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

    for (const sectionKey of sectionOrder) {
      const section = sections[sectionKey];
      if (!section || (Array.isArray(section) && section.length === 0)) continue;

      // Section header
      docSections.push(createSectionHeader(sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)));

      // Section content
      if (sectionKey === 'summary' && section) {
        docSections.push(
          new Paragraph({
            text: section,
            spacing: { after: 200 },
            run: {
              font: fontFamily,
              size: 22, // 11pt
              color: textColor
            }
          })
        );
      } else if (sectionKey === 'experience' && Array.isArray(section)) {
        for (const exp of section) {
          // Job title and company
          const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
          if (titleLine.trim()) {
            docSections.push(
              new Paragraph({
                text: titleLine,
                spacing: { after: 50 },
                run: {
                  font: fontFamily,
                  size: 22,
                  bold: true,
                  color: textColor
                }
              })
            );
          }

          // Date range
          if (exp.startDate || exp.endDate) {
            const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || 'Present'}`;
            docSections.push(
              new Paragraph({
                text: dateRange,
                spacing: { after: 100 },
                run: {
                  font: fontFamily,
                  size: 20,
                  italics: true,
                  color: grayColor
                }
              })
            );
          }

          // Description
          if (exp.description) {
            docSections.push(
              new Paragraph({
                text: exp.description,
                spacing: { after: 150 },
                run: {
                  font: fontFamily,
                  size: 22,
                  color: textColor
                },
                indent: { left: 360 } // 0.25 inch indent
              })
            );
          }
        }
      } else if (sectionKey === 'education' && Array.isArray(section)) {
        for (const edu of section) {
          const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
          if (degreeLine.trim()) {
            docSections.push(
              new Paragraph({
                text: degreeLine,
                spacing: { after: 50 },
                run: {
                  font: fontFamily,
                  size: 22,
                  bold: true,
                  color: textColor
                }
              })
            );
          }

          const schoolLine = `${edu.school || ''}${edu.school && (edu.city || edu.country) ? ', ' : ''}${(edu.city || edu.country) ? `${edu.city || ''}${edu.city && edu.country ? ', ' : ''}${edu.country || ''}` : ''}`;
          if (schoolLine.trim()) {
            docSections.push(
              new Paragraph({
                text: schoolLine,
                spacing: { after: 50 },
                run: {
                  font: fontFamily,
                  size: 22,
                  color: textColor
                }
              })
            );
          }

          if (edu.graduationDate) {
            docSections.push(
              new Paragraph({
                text: edu.graduationDate,
                spacing: { after: 150 },
                run: {
                  font: fontFamily,
                  size: 20,
                  italics: true,
                  color: grayColor
                }
              })
            );
          }
        }
      } else if (sectionKey === 'skills' && Array.isArray(section)) {
        const skillsText = section.join(' • ');
        docSections.push(
          new Paragraph({
            text: skillsText,
            spacing: { after: 200 },
            run: {
              font: fontFamily,
              size: 22,
              color: textColor
            }
          })
        );
      } else if (Array.isArray(section)) {
        for (const item of section) {
          const itemText = typeof item === 'string' ? item : (item.title || item.name || JSON.stringify(item));
          docSections.push(
            new Paragraph({
              text: `• ${itemText}`,
              spacing: { after: 100 },
              run: {
                font: fontFamily,
                size: 22,
                color: textColor
              }
            })
          );
        }
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections
      }]
    });

    // Generate and return buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}