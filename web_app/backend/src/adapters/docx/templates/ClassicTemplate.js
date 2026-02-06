import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export class ClassicTemplate {
  /**
   * Generates a DOCX buffer from resume data using Classic template style
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
    const headingFontFamily = 'Inter';
    const fontSize = style.fontSize || 11;

    // Color parsing
    const parseHexColor = (hex) => {
      if (!hex || typeof hex !== 'string') return '2463EB';
      const cleanHex = hex.replace('#', '');
      return cleanHex.length === 6 ? cleanHex.toUpperCase() : '2463EB';
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = '222222';
    const grayColor = '666666';

    const docSections = [];

    // Helper for Section Headers
    const createSectionHeader = (text) => {
      return new Paragraph({
        text: text.toUpperCase(),
        spacing: { before: 200, after: 100 },
        run: {
          font: headingFontFamily,
          size: 26, // 13pt
          bold: true,
          color: accentColor,
          allCaps: true
        },
        indent: { left: 360 }, // 0.25 inch indent for left border effect
        border: {
          left: {
            color: accentColor,
            space: 1,
            value: BorderStyle.SINGLE,
            size: 24
          }
        }
      });
    };

    // Header with double bottom border
    const headerParagraphs = [];

    // Name (left side)
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    headerParagraphs.push(
      new Paragraph({
        text: fullName.toUpperCase(),
        spacing: { after: 50 },
        run: {
          font: headingFontFamily,
          size: 62, // 31pt
          bold: true,
          color: textColor
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
            italics: true,
            color: grayColor
          }
        })
      );
    }

    // Contact Information (right side, but we'll put it after name for simplicity)
    const contactParts = [];
    if (resume.location) contactParts.push(resume.location.toUpperCase());
    if (resume.phone) contactParts.push(resume.phone);
    if (resume.email) contactParts.push(resume.email.toLowerCase());
    if (resume.linkedin) contactParts.push(resume.linkedin);

    if (contactParts.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          text: contactParts.join('\n'),
          spacing: { after: 200 },
          run: {
            font: fontFamily,
            size: 20, // 10pt
            color: grayColor
          },
          alignment: AlignmentType.RIGHT
        })
      );
    }

    // Double bottom border
    headerParagraphs.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
        border: {
          bottom: {
            color: 'CCCCCC',
            space: 1,
            value: BorderStyle.DOUBLE,
            size: 4
          }
        }
      })
    );

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
              size: 22 // 11pt
            }
          })
        );
      } else if (sectionKey === 'experience' && Array.isArray(section)) {
        for (const exp of section) {
          // Job title and company
          const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
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

          // Date range
          if (exp.startDate || exp.endDate) {
            const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;
            docSections.push(
              new Paragraph({
                text: dateRange,
                spacing: { after: 100 },
                run: {
                  font: fontFamily,
                  size: 18,
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
                spacing: { after: 200 },
                run: {
                  font: fontFamily,
                  size: 20
                }
              })
            );
          }
        }
      } else if (sectionKey === 'education' && Array.isArray(section)) {
        for (const edu of section) {
          // Degree and field
          const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
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

          // School
          if (edu.school) {
            docSections.push(
              new Paragraph({
                text: edu.school,
                spacing: { after: 50 },
                run: {
                  font: fontFamily,
                  size: 20,
                  color: textColor
                }
              })
            );
          }

          // Date range
          if (edu.startDate || edu.endDate) {
            const dateRange = `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' — ' : ''}${edu.endDate || ''}`;
            docSections.push(
              new Paragraph({
                text: dateRange,
                spacing: { after: 200 },
                run: {
                  font: fontFamily,
                  size: 18,
                  italics: true,
                  color: grayColor
                }
              })
            );
          }
        }
      } else if (sectionKey === 'skills' && Array.isArray(section)) {
        docSections.push(
          new Paragraph({
            text: section.join(' • '),
            spacing: { after: 200 },
            run: {
              font: fontFamily,
              size: 22
            }
          })
        );
      } else if (sectionKey === 'projects' && Array.isArray(section)) {
        for (const project of section) {
          // Project name
          if (project.name) {
            docSections.push(
              new Paragraph({
                text: project.name,
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

          // Project description
          if (project.description) {
            docSections.push(
              new Paragraph({
                text: project.description,
                spacing: { after: 200 },
                run: {
                  font: fontFamily,
                  size: 20
                }
              })
            );
          }
        }
      } else if (Array.isArray(section)) {
        for (const item of section) {
          const itemText = typeof item === 'string' ? item : (item.title || item.name || JSON.stringify(item));
          docSections.push(
            new Paragraph({
              text: `• ${itemText}`,
              spacing: { after: 100 },
              run: {
                font: fontFamily,
                size: 22
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