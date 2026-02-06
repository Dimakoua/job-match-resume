import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class MinimalTemplate {
  /**
   * Generates a PDF buffer from resume data using the Minimal template style
   * Matches Vue component: ResumeTemplateMinimal.vue
   * Features: Clean, minimal typography with centered header and simple sections
   * @param {Resume} resume - The resume entity to convert to PDF
   * @returns {Promise<Uint8Array>} - PDF buffer as Uint8Array
   */
  async generate(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    const sections = resume.sections || {};

    // Extract styles
    const style = resume.style || {};

    const fontSize = style.fontSize || 11;
    const headingFontSize = 18; // 3xl equivalent
    const titleFontSize = 14; // lg equivalent
    const contactFontSize = fontSize - 1;

    // Color parsing
    const parseHexColor = (hex) => {
      if (!hex || typeof hex !== 'string') return rgb(0.141, 0.141, 0.141); // #222
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
      const b = parseInt(cleanHex.substr(4, 2), 16) / 255;
      return rgb(r, g, b);
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = rgb(0.141, 0.141, 0.141); // #222
    const grayColor = rgb(0.4, 0.4, 0.4); // #666
    const lightGrayColor = rgb(0.902, 0.902, 0.902); // #e6e6e6

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size

    // Load fonts
    const fontFamily = style.bodyFont || 'inter';
    const headingFontFamily = style.headingFont || 'inter';

    let regularFont, boldFont;
    try {
      // Try to load Inter fonts, fallback to standard fonts
      if (fontFamily === 'inter' || headingFontFamily === 'inter') {
        regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      } else {
        regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        boldFont = await pdfDoc.embedFont(StandardFonts.TimesBold);
      }
    } catch (error) {
      regularFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      boldFont = await pdfDoc.embedFont(StandardFonts.TimesBold);
    }

    const { width, height } = page.getSize();
    const margin = 48; // 48px margins
    const contentWidth = width - (margin * 2);
    let yPosition = height - margin;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, options = {}) => {
      const { font = regularFont, size = fontSize, color = textColor, maxWidth = contentWidth, align = 'left' } = options;

      if (!text) return y;

      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && line) {
          // Draw current line
          let xPos = x;
          if (align === 'center') {
            xPos = x + (maxWidth - font.widthOfTextAtSize(line, size)) / 2;
          }
          page.drawText(line, { x: xPos, y: currentY, font, size, color });
          line = word;
          currentY -= size * 1.5;
        } else {
          line = testLine;
        }
      }

      // Draw remaining line
      if (line) {
        let xPos = x;
        if (align === 'center') {
          xPos = x + (maxWidth - font.widthOfTextAtSize(line, size)) / 2;
        }
        page.drawText(line, { x: xPos, y: currentY, font, size, color });
        currentY -= size * 1.5;
      }

      return currentY;
    };

    // Header section - centered
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    yPosition = addText(fullName, margin, yPosition, {
      font: boldFont,
      size: headingFontSize,
      align: 'center'
    });

    if (resume.title) {
      yPosition = addText(resume.title, margin, yPosition - 8, {
        size: titleFontSize,
        color: grayColor,
        align: 'center'
      });
    }

    // Contact info - centered
    const contactItems = [];
    if (resume.email) contactItems.push(resume.email.toLowerCase());
    if (resume.phone) contactItems.push(resume.phone);
    if (resume.location) contactItems.push(resume.location);

    if (contactItems.length > 0) {
      const contactText = contactItems.join(' • ');
      yPosition = addText(contactText, margin, yPosition - 16, {
        size: contactFontSize,
        color: grayColor,
        align: 'center'
      });
    }

    yPosition -= 24; // Space after header

    // Section helper function
    const addSection = (title, contentCallback) => {
      if (yPosition < margin + 100) {
        // Add new page if needed
        const newPage = pdfDoc.addPage([612, 792]);
        yPosition = height - margin;
        // Reassign page reference for new page
        Object.assign(page, newPage);
      }

      // Section header
      yPosition = addText(title.toUpperCase(), margin, yPosition, {
        font: boldFont,
        size: 10, // xs equivalent
        color: textColor
      });

      // Underline
      page.drawLine({
        start: { x: margin, y: yPosition + 4 },
        end: { x: margin + contentWidth, y: yPosition + 4 },
        thickness: 0.5,
        color: lightGrayColor
      });

      yPosition -= 16;

      // Section content
      yPosition = contentCallback(yPosition);
      yPosition -= 24; // Space between sections
    };

    // Profile/Summary section
    const summary = sections.summary;
    if (summary) {
      addSection('Profile', (startY) => {
        return addText(summary, margin, startY, {
          color: grayColor,
          maxWidth: contentWidth
        });
      });
    }

    // Experience section
    const experience = sections.experience || [];
    if (experience.length > 0) {
      addSection('Experience', (startY) => {
        let currentY = startY;

        for (const exp of experience) {
          if (currentY < margin + 50) break;

          const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
          const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;

          // Job title and company
          currentY = addText(titleLine, margin, currentY, {
            font: boldFont,
            size: fontSize + 1,
            color: textColor
          });

          // Date range
          currentY = addText(dateRange, margin, currentY - 2, {
            size: contactFontSize,
            color: grayColor
          });

          // Description
          if (exp.description) {
            currentY = addText(exp.description, margin, currentY - 8, {
              color: grayColor,
              maxWidth: contentWidth
            });
          }

          currentY -= 16; // Space between experience items
        }

        return currentY;
      });
    }

    // Education section
    const education = sections.education || [];
    if (education.length > 0) {
      addSection('Education', (startY) => {
        let currentY = startY;

        for (const edu of education) {
          if (currentY < margin + 50) break;

          const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
          const dateRange = `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' — ' : ''}${edu.endDate || ''}`;

          // Degree and field
          currentY = addText(degreeLine, margin, currentY, {
            font: boldFont,
            size: fontSize + 1,
            color: textColor
          });

          // School name
          if (edu.school) {
            currentY = addText(edu.school, margin, currentY - 2, {
              size: fontSize,
              color: grayColor
            });
          }

          // Date range
          currentY = addText(dateRange, margin, currentY - 2, {
            size: contactFontSize,
            color: grayColor
          });

          currentY -= 16; // Space between education items
        }

        return currentY;
      });
    }

    // Skills section
    const skills = sections.skills || [];
    if (skills.length > 0) {
      addSection('Skills', (startY) => {
        const skillText = skills.map(skill => skill.name || skill).join(' • ');
        return addText(skillText, margin, startY, {
          color: grayColor,
          maxWidth: contentWidth
        });
      });
    }

    // Projects section
    const projects = sections.projects || [];
    if (projects.length > 0) {
      addSection('Projects', (startY) => {
        let currentY = startY;

        for (const project of projects) {
          if (currentY < margin + 50) break;

          // Project name
          currentY = addText(project.name || '', margin, currentY, {
            font: boldFont,
            size: fontSize + 1,
            color: textColor
          });

          // Project description
          if (project.description) {
            currentY = addText(project.description, margin, currentY - 4, {
              color: grayColor,
              maxWidth: contentWidth
            });
          }

          currentY -= 16; // Space between projects
        }

        return currentY;
      });
    }

    // Certifications section
    const certifications = sections.certifications || [];
    if (certifications.length > 0) {
      addSection('Certifications', (startY) => {
        let currentY = startY;

        for (const cert of certifications) {
          if (currentY < margin + 50) break;

          // Certification name
          currentY = addText(cert.name || '', margin, currentY, {
            font: boldFont,
            size: fontSize,
            color: textColor
          });

          // Issuer
          if (cert.issuer) {
            currentY = addText(cert.issuer, margin, currentY - 2, {
              size: contactFontSize,
              color: grayColor
            });
          }

          currentY -= 12; // Space between certifications
        }

        return currentY;
      });
    }

    // Generate and return buffer
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}