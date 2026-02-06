import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class ProfessionalTemplate {
  /**
   * Generates a PDF buffer from resume data using the Professional template style
   * Matches Vue component: ResumeTemplateProfessional.vue
   * @param {Resume} resume - The resume entity to convert to PDF
   * @returns {Promise<Uint8Array>} - PDF buffer as Uint8Array
   */
  async generate(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    const sections = resume.sections || {};

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Embed standard fonts
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Add a page
    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();

    // Extract styles from resume
    const style = resume.style || {};

    // Parse accent color
    const parseHexColor = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      ) : rgb(0.14, 0.39, 0.92); // Default blue (#2463eb)
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = rgb(0.22, 0.22, 0.22); // #383838
    const grayColor = rgb(0.5, 0.5, 0.5); // #808080

    // Font size mapping
    const baseSize = style.fontSize || 11;
    const sizes = {
      name: baseSize + 14, // 25pt
      title: baseSize + 4, // 15pt
      section: baseSize + 2, // 13pt
      body: baseSize, // 11pt
      contact: baseSize - 1 // 10pt
    };

    const margin = 50;
    let currentY = height - margin;

    // Helper: Add text with wrapping
    const addText = (text, x, y, options = {}) => {
      if (!text) return y;
      const size = options.size || sizes.body;
      const font = options.font || fontRegular;
      const color = options.color || textColor;
      const maxWidth = options.maxWidth || (width - 2 * margin);

      const words = String(text).split(' ');
      let line = '';
      let currentYPos = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && line) {
          currentPage.drawText(line, { x, y: currentYPos, size, font, color });
          line = word;
          currentYPos -= size * 1.2;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, { x, y: currentYPos, size, font, color });
        currentYPos -= size * 1.2;
      }

      return currentYPos;
    };

    // Helper: Add section header
    const addSectionHeader = (text, y) => {
      // Draw accent line above section
      currentPage.drawRectangle({
        x: margin,
        y: y + 8,
        width: width - 2 * margin,
        height: 2,
        color: accentColor
      });

      currentPage.drawText(text.toUpperCase(), {
        x: margin,
        y: y,
        size: sizes.section,
        font: fontBold,
        color: accentColor
      });

      return y - sizes.section * 2;
    };

    // Helper: Check if we need a new page
    const checkNewPage = (requiredSpace) => {
      if (currentY - requiredSpace < margin) {
        currentPage = pdfDoc.addPage();
        currentY = height - margin;
        return true;
      }
      return false;
    };

    // Header with accent border
    currentPage.drawRectangle({
      x: margin,
      y: currentY + 10,
      width: width - 2 * margin,
      height: 3,
      color: accentColor
    });
    currentY -= 20;

    // Name
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    currentPage.drawText(fullName, {
      x: margin,
      y: currentY,
      size: sizes.name,
      font: fontBold,
      color: accentColor
    });
    currentY -= sizes.name * 1.5;

    // Professional Title
    if (resume.title) {
      currentPage.drawText(resume.title, {
        x: margin,
        y: currentY,
        size: sizes.title,
        font: fontBold,
        color: textColor
      });
      currentY -= sizes.title * 1.8;
    }

    // Contact Information
    const contactParts = [];
    if (resume.email) contactParts.push(resume.email);
    if (resume.phone) contactParts.push(resume.phone);
    if (resume.location) contactParts.push(resume.location);

    if (contactParts.length > 0) {
      const contactText = contactParts.join(' • ');
      currentPage.drawText(contactText, {
        x: margin,
        y: currentY,
        size: sizes.contact,
        font: fontRegular,
        color: grayColor
      });
      currentY -= sizes.contact * 2.5;
    }

    // Add bottom border for header
    currentPage.drawRectangle({
      x: margin,
      y: currentY + 5,
      width: width - 2 * margin,
      height: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    currentY -= 30;

    // Sections
    const sectionOrder = ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'];

    for (const sectionKey of sectionOrder) {
      const section = sections[sectionKey];
      if (!section || (Array.isArray(section) && section.length === 0)) continue;

      checkNewPage(100);

      // Section header
      currentY = addSectionHeader(sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1), currentY);

      // Section content
      if (sectionKey === 'summary' && section) {
        currentY = addText(section, margin, currentY);
        currentY -= 15;
      } else if (sectionKey === 'experience' && Array.isArray(section)) {
        for (const exp of section) {
          checkNewPage(80);

          // Job title and company
          const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
          if (titleLine.trim()) {
            currentPage.drawText(titleLine, {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontBold,
              color: textColor
            });
            currentY -= sizes.body * 1.3;
          }

          // Date range
          if (exp.startDate || exp.endDate) {
            const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' - ' : ''}${exp.endDate || 'Present'}`;
            currentPage.drawText(dateRange, {
              x: margin,
              y: currentY,
              size: sizes.contact,
              font: fontItalic,
              color: grayColor
            });
            currentY -= sizes.contact * 1.5;
          }

          // Description
          if (exp.description) {
            currentY = addText(exp.description, margin + 10, currentY, { maxWidth: width - 2 * margin - 10 });
            currentY -= 10;
          }

          currentY -= 10; // Space between experiences
        }
      } else if (sectionKey === 'education' && Array.isArray(section)) {
        for (const edu of section) {
          checkNewPage(60);

          const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
          if (degreeLine.trim()) {
            currentPage.drawText(degreeLine, {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontBold,
              color: textColor
            });
            currentY -= sizes.body * 1.3;
          }

          const schoolLine = `${edu.school || ''}${edu.school && (edu.city || edu.country) ? ', ' : ''}${(edu.city || edu.country) ? `${edu.city || ''}${edu.city && edu.country ? ', ' : ''}${edu.country || ''}` : ''}`;
          if (schoolLine.trim()) {
            currentPage.drawText(schoolLine, {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontRegular,
              color: textColor
            });
            currentY -= sizes.body * 1.3;
          }

          if (edu.graduationDate) {
            currentPage.drawText(edu.graduationDate, {
              x: margin,
              y: currentY,
              size: sizes.contact,
              font: fontItalic,
              color: grayColor
            });
            currentY -= sizes.contact * 1.5;
          }

          currentY -= 8;
        }
      } else if (sectionKey === 'skills' && Array.isArray(section)) {
        const skillsText = section.join(' • ');
        currentY = addText(skillsText, margin, currentY);
        currentY -= 15;
      } else if (Array.isArray(section)) {
        for (const item of section) {
          checkNewPage(40);
          const itemText = typeof item === 'string' ? item : (item.title || item.name || JSON.stringify(item));
          currentY = addText(`• ${itemText}`, margin, currentY);
          currentY -= 5;
        }
        currentY -= 10;
      }

      currentY -= 20; // Space between sections
    }

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}