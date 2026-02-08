import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class ClassicTemplate {
  /**
   * Generates a PDF buffer from resume data using the Classic template style
   * Matches Vue component: ResumeTemplateClassic.vue
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
      if (!hex || typeof hex !== 'string') return rgb(0.14, 0.39, 0.92);
      const cleanHex = hex.replace('#', '');
      if (cleanHex.length !== 6) return rgb(0.14, 0.39, 0.92);
      try {
        const r = parseInt(cleanHex.substr(0, 2), 16) / 255;
        const g = parseInt(cleanHex.substr(2, 2), 16) / 255;
        const b = parseInt(cleanHex.substr(4, 2), 16) / 255;
        return rgb(r, g, b);
      } catch {
        return rgb(0.14, 0.39, 0.92);
      }
    };

    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const textColor = rgb(0.22, 0.22, 0.22); // #383838
    const grayColor = rgb(0.5, 0.5, 0.5); // #808080

    // Font size mapping
    const baseSize = style.fontSize || 11;
    const sizes = {
      name: 18, // 18pt
      title: 12, // 12pt
      section: 12, // 12pt
      body: 10, // 10pt
      contact: 10, // 10pt
      small: 9 // 9pt
    };

    const margin = 50;
    let currentY = height - margin;

    // Helper: Sanitize text for WinAnsi encoding
    const sanitizeText = (text) => {
      if (!text) return text;
      return String(text).replace(/●/g, '-').replace(/•/g, '-').replace(/\n/g, ' ');
    };

    // Helper: Add text with wrapping
    const addText = (text, x, y, options = {}) => {
      if (!text) return y;
      const sanitizedText = sanitizeText(text);
      const size = options.size || sizes.body;
      const font = options.font || fontRegular;
      const color = options.color || textColor;
      const maxWidth = options.maxWidth || (width - 2 * margin);

      const words = sanitizedText.split(' ');
      let line = '';
      let currentYPos = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && line) {
          currentPage.drawText(line, { x, y: currentYPos, size, font, color });
          line = word;
          currentYPos -= size * 1.4;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, { x, y: currentYPos, size, font, color });
        currentYPos -= size * 1.4;
      }

      return currentYPos;
    };

    // Helper: Add section header (centered, semibold, matching UI design)
    const addSectionHeader = (text, y) => {
      const headerText = text.charAt(0).toUpperCase() + text.slice(1); // Capitalize first letter only
      const headerWidth = fontRegular.widthOfTextAtSize(sanitizeText(headerText), sizes.section);
      
      currentPage.drawText(sanitizeText(headerText), {
        x: (width - headerWidth) / 2,
        y: y,
        size: sizes.section,
        font: fontBold, // semibold equivalent in pdf-lib
        color: textColor // Use dark text color, not accent
      });

      return y - sizes.section * 1.8;
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

    // Header with centered layout (matching UI)
    // Name (centered)
    const fullName = `${sections.firstName || resume.firstName || 'Your'} ${sections.lastName || resume.lastName || 'Name'}`;
    const nameWidth = fontBold.widthOfTextAtSize(sanitizeText(fullName.toUpperCase()), sizes.name);
    currentPage.drawText(sanitizeText(fullName.toUpperCase()), {
      x: (width - nameWidth) / 2,
      y: currentY,
      size: sizes.name,
      font: fontBold,
      color: textColor
    });
    currentY -= sizes.name * 1.3;

    // Professional Title (centered)
    const title = sections.title || resume.title;
    if (title) {
      const titleWidth = fontItalic.widthOfTextAtSize(sanitizeText(title), sizes.title);
      currentPage.drawText(sanitizeText(title), {
        x: (width - titleWidth) / 2,
        y: currentY,
        size: sizes.title,
        font: fontItalic,
        color: grayColor
      });
      currentY -= sizes.title * 1.5;
    }

    // Contact Information (centered, single line)
    const contactParts = [];
    const location = sections.location || resume.location;
    const phone = sections.phone || resume.phone;
    const email = sections.email || resume.email;
    const github = sections.github || resume.github;
    const linkedin = sections.linkedin || resume.linkedin;
    
    if (location) contactParts.push(location.toUpperCase());
    if (phone) contactParts.push(phone);
    if (email) contactParts.push(email.toLowerCase());
    if (github) contactParts.push(`GitHub: ${github}`);
    if (linkedin) contactParts.push(`LinkedIn: ${linkedin}`);

    if (contactParts.length > 0) {
      const contactText = contactParts.join(' | ');
      const contactWidth = fontRegular.widthOfTextAtSize(sanitizeText(contactText), sizes.contact);
      currentPage.drawText(sanitizeText(contactText), {
        x: (width - contactWidth) / 2,
        y: currentY,
        size: sizes.contact,
        font: fontRegular,
        color: grayColor
      });
      currentY -= sizes.contact * 1.8;
    }

    // Single bottom border (gray line)
    currentPage.drawRectangle({
      x: margin,
      y: currentY + 10,
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
          checkNewPage(60);

          // Company name with date on same line
          const companyName = exp.company || '';
          const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;
          
          if (companyName.trim()) {
            const companyWidth = fontBold.widthOfTextAtSize(sanitizeText(companyName), sizes.body);
            const dateWidth = fontItalic.widthOfTextAtSize(sanitizeText(dateRange), sizes.small);
            
            // Draw company on the left
            currentPage.drawText(sanitizeText(companyName), {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontBold,
              color: textColor
            });
            
            // Draw date on the right
            currentPage.drawText(sanitizeText(dateRange), {
              x: width - margin - dateWidth,
              y: currentY,
              size: sizes.small,
              font: fontItalic,
              color: grayColor
            });
            
            currentY -= sizes.body * 1.3;
          }

          // Job title on separate line
          if (exp.title) {
            currentPage.drawText(sanitizeText(exp.title), {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontItalic,
              color: textColor
            });
            currentY -= sizes.body * 1.3;
          }

          // Description
          if (exp.description) {
            currentY = addText(exp.description, margin, currentY, { size: sizes.contact, maxWidth: width - 2 * margin });
            currentY -= 10;
          }

          currentY -= 10; // Space between experiences
        }
      } else if (sectionKey === 'education' && Array.isArray(section)) {
        for (const edu of section) {
          checkNewPage(50);

          const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;
          if (degreeLine.trim()) {
            currentPage.drawText(sanitizeText(degreeLine), {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontBold,
              color: textColor
            });
            currentY -= sizes.body * 1.3;
          }

          const schoolLine = `${edu.school || ''}`;
          if (schoolLine.trim()) {
            currentPage.drawText(sanitizeText(schoolLine), {
              x: margin,
              y: currentY,
              size: sizes.contact,
              font: fontRegular,
              color: textColor
            });
            currentY -= sizes.contact * 1.3;
          }

          if (edu.startDate || edu.endDate) {
            const dateRange = `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' — ' : ''}${edu.endDate || ''}`;
            currentPage.drawText(sanitizeText(dateRange), {
              x: margin,
              y: currentY,
              size: sizes.small,
              font: fontItalic,
              color: grayColor
            });
            currentY -= sizes.small * 1.5;
          }

          currentY -= 8;
        }
      } else if (sectionKey === 'skills' && Array.isArray(section)) {
        const skillsText = section.join(' | ');
        currentY = addText(skillsText, margin, currentY, { size: sizes.small });
        currentY -= 15;
      } else if (sectionKey === 'projects' && Array.isArray(section)) {
        for (const project of section) {
          checkNewPage(50);

          if (project.name) {
            currentPage.drawText(sanitizeText(project.name), {
              x: margin,
              y: currentY,
              size: sizes.body,
              font: fontBold,
              color: textColor
            });
            currentY -= sizes.body * 1.3;
          }

          if (project.description) {
            currentY = addText(project.description, margin, currentY, { size: sizes.contact, maxWidth: width - 2 * margin });
            currentY -= 10;
          }

          currentY -= 5;
        }
      } else if (Array.isArray(section)) {
        for (const item of section) {
          checkNewPage(40);
          const itemText = typeof item === 'string' ? item : (item.title || item.name || JSON.stringify(item));
          currentY = addText(`- ${itemText}`, margin, currentY);
          currentY -= 5;
        }
        currentY -= 10;
      }

      currentY -= 5; // Space between sections
    }

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}