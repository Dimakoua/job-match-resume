import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export class AcademicTemplate {
  /**
   * Generates a DOCX buffer from resume data using Academic template style
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

    const fontFamily = 'Times New Roman';
    const fontSize = style.fontSize || 11;

    // Color parsing
    const parseHexColor = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? result[0] : '2463EB';
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = '000000';
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
          color: textColor,
          allCaps: true
        },
        border: {
          bottom: {
            color: '333333',
            space: 1,
            value: BorderStyle.SINGLE,
            size: 2
          }
        }
      });
    };

    // Helper for centered text
    const createCenteredText = (text, options = {}) => {
      const { size = 24, bold = false, italic = false, color = textColor } = options;
      return new Paragraph({
        text: text,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        run: {
          font: fontFamily,
          size: size,
          bold: bold,
          italic: italic,
          color: color
        }
      });
    };

    // Header Section
    const headerChildren = [];

    // Name - Centered, uppercase, large
    const fullName = `${resume.firstName || ''} ${resume.lastName || ''}`.trim().toUpperCase();
    if (fullName) {
      headerChildren.push(createCenteredText(fullName, { size: 50, bold: true }));
    }

    // Contact info - Centered, italic, smaller
    const contactParts = [];
    if (resume.title) contactParts.push(resume.title);
    if (resume.location) contactParts.push(resume.location);

    const contactLine1 = contactParts.join(' • ');
    if (contactLine1) {
      headerChildren.push(createCenteredText(contactLine1, { size: 20, italic: true, color: grayColor }));
    }

    // Contact links - Centered, italic
    const linkParts = [];
    if (resume.email) linkParts.push(resume.email);
    if (resume.phone) linkParts.push(resume.phone);
    if (resume.linkedin) linkParts.push(resume.linkedin);
    if (resume.website) linkParts.push(resume.website);

    const contactLine2 = linkParts.join(' | ');
    if (contactLine2) {
      headerChildren.push(createCenteredText(contactLine2, { size: 20, italic: true, color: grayColor }));
    }

    // Add spacing after header
    headerChildren.push(new Paragraph({ text: '', spacing: { after: 200 } }));

    // Body sections
    const bodyChildren = [];

    // Summary section
    if (sections.summary) {
      bodyChildren.push(createSectionHeader('Summary'));
      bodyChildren.push(
        new Paragraph({
          text: sections.summary,
          spacing: { after: 100 },
          run: {
            font: fontFamily,
            size: 22, // 11pt
            color: textColor
          }
        })
      );
    }

    // Experience section
    if (sections.experience && sections.experience.length > 0) {
      bodyChildren.push(createSectionHeader('Experience'));

      for (const exp of sections.experience) {
        const titleLine = `${exp.jobTitle || ''} at ${exp.companyName || ''}`;

        // Job title and company
        bodyChildren.push(
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

        // Dates (right aligned)
        if (exp.startDate || exp.endDate) {
          const dateText = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
          bodyChildren.push(
            new Paragraph({
              text: dateText,
              alignment: AlignmentType.RIGHT,
              spacing: { before: -200, after: 50 }, // Negative before to overlap with title
              run: {
                font: fontFamily,
                size: 18, // 9pt
                italic: true,
                color: grayColor
              }
            })
          );
        }

        // Description
        if (exp.description) {
          bodyChildren.push(
            new Paragraph({
              text: exp.description,
              spacing: { after: 150 },
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

    // Education section
    if (sections.education && sections.education.length > 0) {
      bodyChildren.push(createSectionHeader('Education'));

      for (const edu of sections.education) {
        const degreeLine = `${edu.degree || ''} in ${edu.fieldOfStudy || ''}`;

        // Degree
        bodyChildren.push(
          new Paragraph({
            text: degreeLine,
            spacing: { after: 50 },
            run: {
              font: fontFamily,
              size: 22,
              italic: true,
              color: textColor
            }
          })
        );

        // Dates (right aligned)
        if (edu.startDate || edu.endDate) {
          const dateText = `${edu.startDate || ''} - ${edu.endDate || 'Present'}`;
          bodyChildren.push(
            new Paragraph({
              text: dateText,
              alignment: AlignmentType.RIGHT,
              spacing: { before: -200, after: 50 },
              run: {
                font: fontFamily,
                size: 18,
                color: grayColor
              }
            })
          );
        }

        // School name
        bodyChildren.push(
          new Paragraph({
            text: edu.schoolName || '',
            spacing: { after: 150 },
            run: {
              font: fontFamily,
              size: 22,
              bold: true,
              color: textColor
            }
          })
        );
      }
    }

    // Skills section
    if (sections.skills && sections.skills.length > 0) {
      bodyChildren.push(createSectionHeader('Skills'));

      const skillText = sections.skills.map(skill => skill.name || skill).join(' • ');
      bodyChildren.push(
        new Paragraph({
          text: skillText,
          spacing: { after: 100 },
          run: {
            font: fontFamily,
            size: 22,
            color: textColor
          }
        })
      );
    }

    // Projects section
    if (sections.projects && sections.projects.length > 0) {
      bodyChildren.push(createSectionHeader('Projects'));

      for (const project of sections.projects) {
        bodyChildren.push(
          new Paragraph({
            text: project.name || '',
            spacing: { after: 50 },
            run: {
              font: fontFamily,
              size: 22,
              bold: true,
              color: textColor
            }
          })
        );

        if (project.description) {
          bodyChildren.push(
            new Paragraph({
              text: project.description,
              spacing: { after: 150 },
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

    // Certifications section
    if (sections.certifications && sections.certifications.length > 0) {
      bodyChildren.push(createSectionHeader('Certifications'));

      for (const cert of sections.certifications) {
        bodyChildren.push(
          new Paragraph({
            text: cert.name || '',
            spacing: { after: 50 },
            run: {
              font: fontFamily,
              size: 22,
              bold: true,
              color: textColor
            }
          })
        );

        bodyChildren.push(
          new Paragraph({
            text: cert.issuer || '',
            spacing: { after: 150 },
            run: {
              font: fontFamily,
              size: 22,
              color: grayColor
            }
          })
        );
      }
    }

    // Combine all children
    const allChildren = [...headerChildren, ...bodyChildren];

    // Create document
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: allChildren
      }]
    });

    // Generate and return buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}