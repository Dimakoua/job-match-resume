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

    // Helper for Section Headers (centered, semibold, matching UI design)
    const createSectionHeader = (text) => {
      const headerText = text.charAt(0).toUpperCase() + text.slice(1); // Capitalize first letter only
      return new Paragraph({
        text: headerText,
        spacing: { before: 50, after: 100 },
        alignment: AlignmentType.CENTER,
        run: {
          font: headingFontFamily,
          size: 24, // 12pt
          bold: true, // semibold in DOCX
          color: textColor // dark text color, not accent
        }
      });
    };

    // Header with centered layout (matching UI)
    const headerParagraphs = [];

    // Name (centered)
    const fullName = `${sections.firstName || resume.firstName || 'Your'} ${sections.lastName || resume.lastName || 'Name'}`;
    headerParagraphs.push(
      new Paragraph({
        text: fullName.toUpperCase(),
        spacing: { after: 50 },
        alignment: AlignmentType.CENTER,
        run: {
          font: headingFontFamily,
          size: 36, // 18pt
          bold: true,
          color: textColor
        }
      })
    );

    // Professional Title (centered)
    const title = sections.title || resume.title;
    if (title) {
      headerParagraphs.push(
        new Paragraph({
          text: title,
          spacing: { after: 100 },
          alignment: AlignmentType.CENTER,
          run: {
            font: fontFamily,
            size: 24, // 12pt
            italics: true,
            color: grayColor
          }
        })
      );
    }

    // Contact Information (centered, single line with separators)
    const location = sections.location || resume.location;
    const phone = sections.phone || resume.phone;
    const email = sections.email || resume.email;
    const github = sections.github || resume.github;
    const linkedin = sections.linkedin || resume.linkedin;
    
    const contactParts = [];
    if (location) contactParts.push(location.toUpperCase());
    if (phone) contactParts.push(phone);
    if (email) contactParts.push(email.toLowerCase());
    if (github) contactParts.push(`GitHub: ${github}`);
    if (linkedin) contactParts.push(`LinkedIn: ${linkedin}`);

    if (contactParts.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          text: contactParts.join(' | '),
          spacing: { after: 200 },
          alignment: AlignmentType.CENTER,
          run: {
            font: fontFamily,
            size: 20, // 10pt
            color: grayColor
          }
        })
      );
    }

    // Single bottom border (gray line)
    headerParagraphs.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
        border: {
          bottom: {
            color: 'CCCCCC',
            space: 1,
            value: BorderStyle.SINGLE,
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
              size: 20 // 10pt
            }
          })
        );
      } else if (sectionKey === 'experience' && Array.isArray(section)) {
        for (const exp of section) {
          // Company name with date on the same line
          const companyName = exp.company || '';
          const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;
          
          // Create a paragraph with company on left and date on right
          const companyRun = new TextRun({
            text: companyName,
            font: fontFamily,
            size: 20,
            bold: true,
            color: textColor
          });
          
          const tabRun = new TextRun({
            text: '\t',
            size: 20
          });
          
          const dateRun = new TextRun({
            text: dateRange,
            font: fontFamily,
            size: 18,
            italics: true,
            color: grayColor
          });
          
          docSections.push(
            new Paragraph({
              children: [companyRun, tabRun, dateRun],
              spacing: { after: 50 },
              tabStops: [
                {
                  type: 'right',
                  position: 9144 // Right edge position
                }
              ]
            })
          );

          // Job title on separate line
          if (exp.title) {
            docSections.push(
              new Paragraph({
                text: exp.title,
                spacing: { after: 100 },
                run: {
                  font: fontFamily,
                  size: 20,
                  italics: true,
                  color: textColor
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
              size: 20
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
                size: 20
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