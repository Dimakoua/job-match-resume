import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';

export class MinimalTemplate {
  /**
   * Generates a DOCX buffer from resume data using the Minimal template style
   * Matches Vue component: ResumeTemplateMinimal.vue
   * Features: Clean, minimal typography with centered header and simple sections
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
    const lightGrayColor = 'E5E5E5';

    const docSections = [];

    // Header section - centered
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    docSections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: fullName,
            font: headingFontFamily,
            size: 36, // 18pt
            bold: true,
            color: textColor
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 }
      })
    );

    if (resume.title) {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: resume.title,
              font: fontFamily,
              size: 28, // 14pt
              color: grayColor
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 }
        })
      );
    }

    // Contact info - centered
    const contactItems = [];
    if (resume.email) contactItems.push(resume.email.toLowerCase());
    if (resume.phone) contactItems.push(resume.phone);
    if (resume.location) contactItems.push(resume.location);

    if (contactItems.length > 0) {
      const contactText = contactItems.join(' • ');
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactText,
              font: fontFamily,
              size: 20, // 10pt
              color: grayColor
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    }

    // Section helper function
    const addSection = (title, content) => {
      docSections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: title.toUpperCase(),
              font: headingFontFamily,
              size: 20, // 10pt
              bold: true,
              color: textColor
            })
          ],
          spacing: { after: 100 }
        }),
        new Paragraph({
          border: {
            bottom: {
              color: lightGrayColor,
              space: 1,
              size: 1,
              value: BorderStyle.SINGLE
            }
          },
          spacing: { after: 200 }
        })
      );

      content.forEach(paragraph => docSections.push(paragraph));
    };

    // Profile/Summary section
    const summary = sections.summary;
    if (summary) {
      addSection('Profile', [
        new Paragraph({
          children: [
            new TextRun({
              text: summary,
              font: 'Times New Roman',
              size: 22, // 11pt
              italics: true,
              color: grayColor
            })
          ],
          spacing: { after: 300 }
        })
      ]);
    }

    // Experience section
    const experience = sections.experience || [];
    if (experience.length > 0) {
      const expContent = [];

      for (const exp of experience) {
        const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
        const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;

        expContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: titleLine,
                font: fontFamily,
                size: 24, // 12pt
                bold: true,
                color: textColor
              }),
              new TextRun({
                text: ` ${dateRange}`,
                font: 'Times New Roman',
                size: 20, // 10pt
                italics: true,
                color: grayColor
              })
            ],
            spacing: { after: 100 }
          })
        );

        if (exp.description) {
          expContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: exp.description,
                  font: fontFamily,
                  size: 22, // 11pt
                  color: grayColor
                })
              ],
              spacing: { after: 200 }
            })
          );
        }
      }

      addSection('Experience', expContent);
    }

    // Education section
    const education = sections.education || [];
    if (education.length > 0) {
      const eduContent = [];

      for (const edu of education) {
        const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
        const dateRange = `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' — ' : ''}${edu.endDate || ''}`;

        eduContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: degreeLine,
                font: fontFamily,
                size: 24, // 12pt
                bold: true,
                color: textColor
              }),
              new TextRun({
                text: ` ${dateRange}`,
                font: 'Times New Roman',
                size: 20, // 10pt
                italics: true,
                color: grayColor
              })
            ],
            spacing: { after: 50 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: edu.school || '',
                font: fontFamily,
                size: 22, // 11pt
                color: grayColor
              })
            ],
            spacing: { after: 200 }
          })
        );
      }

      addSection('Education', eduContent);
    }

    // Skills section
    const skills = sections.skills || [];
    if (skills.length > 0) {
      const skillText = skills.map(skill => skill.name || skill).join(' • ');
      addSection('Skills', [
        new Paragraph({
          children: [
            new TextRun({
              text: skillText,
              font: fontFamily,
              size: 22, // 11pt
              color: grayColor
            })
          ],
          spacing: { after: 300 }
        })
      ]);
    }

    // Projects section
    const projects = sections.projects || [];
    if (projects.length > 0) {
      const projectContent = [];

      for (const project of projects) {
        projectContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.name || '',
                font: fontFamily,
                size: 24, // 12pt
                bold: true,
                color: textColor
              })
            ],
            spacing: { after: 100 }
          })
        );

        if (project.description) {
          projectContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: project.description,
                  font: fontFamily,
                  size: 22, // 11pt
                  color: grayColor
                })
              ],
              spacing: { after: 200 }
            })
          );
        }
      }

      addSection('Projects', projectContent);
    }

    // Certifications section
    const certifications = sections.certifications || [];
    if (certifications.length > 0) {
      const certContent = [];

      for (const cert of certifications) {
        certContent.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.name || '',
                font: fontFamily,
                size: 22, // 11pt
                bold: true,
                color: textColor
              })
            ],
            spacing: { after: 50 }
          })
        );

        if (cert.issuer) {
          certContent.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: cert.issuer,
                  font: fontFamily,
                  size: 20, // 10pt
                  color: grayColor
                })
              ],
              spacing: { after: 150 }
            })
          );
        }
      }

      addSection('Certifications', certContent);
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