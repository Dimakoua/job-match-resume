import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class AcademicTemplate {
  /**
   * Generates a PDF buffer from resume data using the Academic template style
   * Matches Vue component: ResumeTemplateAcademic.vue
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
    const fontRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const fontBold = await pdfDoc.embedFont(StandardFonts.TimesBold);
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesItalic);

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
    const textColor = rgb(0, 0, 0); // Black text
    const grayColor = rgb(0.4, 0.4, 0.4); // Gray for secondary text

    // Font size mapping
    const baseSize = style.fontSize || 11;
    const sizes = {
      name: baseSize + 14, // 25pt
      contact: baseSize - 1, // 10pt
      section: baseSize + 2, // 13pt
      body: baseSize, // 11pt
      small: baseSize - 2 // 9pt
    };

    // Margins and layout
    const marginLeft = 72; // 1 inch
    const marginRight = 72;
    const marginTop = 72;
    const marginBottom = 72;
    const contentWidth = width - marginLeft - marginRight;
    let yPosition = height - marginTop;

    // Helper functions
    const checkNewPage = (neededHeight) => {
      if (yPosition - neededHeight < marginBottom) {
        currentPage = pdfDoc.addPage();
        yPosition = height - marginTop;
        return true;
      }
      return false;
    };

    const wrapText = (text, maxWidth, font, size) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }

      return lines;
    };

    // Header - Centered
    const fullName = `${resume.firstName || ''} ${resume.lastName || ''}`.trim().toUpperCase();
    if (fullName) {
      const nameWidth = fontBold.widthOfTextAtSize(fullName, sizes.name);
      const nameX = (width - nameWidth) / 2;

      currentPage.drawText(fullName, {
        x: nameX,
        y: yPosition,
        size: sizes.name,
        font: fontBold,
        color: textColor
      });

      yPosition -= 30; // Space after name
    }

    // Contact info - Centered, italic
    const contactParts = [];
    if (resume.title) contactParts.push(resume.title);
    if (resume.location) contactParts.push(resume.location);

    const contactLine1 = contactParts.join(' • ');
    if (contactLine1) {
      const contactWidth = fontItalic.widthOfTextAtSize(contactLine1, sizes.contact);
      const contactX = (width - contactWidth) / 2;

      currentPage.drawText(contactLine1, {
        x: contactX,
        y: yPosition,
        size: sizes.contact,
        font: fontItalic,
        color: grayColor
      });

      yPosition -= 20;
    }

    // Contact links - Centered, italic
    const linkParts = [];
    if (resume.email) linkParts.push(resume.email);
    if (resume.phone) linkParts.push(resume.phone);
    if (resume.linkedin) linkParts.push(resume.linkedin);
    if (resume.website) linkParts.push(resume.website);

    const contactLine2 = linkParts.join(' | ');
    if (contactLine2) {
      const contactWidth = fontItalic.widthOfTextAtSize(contactLine2, sizes.contact);
      const contactX = (width - contactWidth) / 2;

      currentPage.drawText(contactLine2, {
        x: contactX,
        y: yPosition,
        size: sizes.contact,
        font: fontItalic,
        color: grayColor
      });

      yPosition -= 40; // Space after header
    }

    // Section rendering functions
    const addSectionHeader = (title) => {
      checkNewPage(60);

      // Uppercase section header
      const headerText = title.toUpperCase();
      currentPage.drawText(headerText, {
        x: marginLeft,
        y: yPosition,
        size: sizes.section,
        font: fontBold,
        color: textColor,
        letterSpacing: 2 // tracking-widest effect
      });

      yPosition -= 25;

      // Thin line under header
      currentPage.drawLine({
        start: { x: marginLeft, y: yPosition },
        end: { x: marginLeft + contentWidth, y: yPosition },
        thickness: 0.5,
        color: rgb(0.33, 0.33, 0.33) // Dark gray line
      });

      yPosition -= 20;
    };

    const addExperienceSection = (experiences) => {
      if (!experiences || experiences.length === 0) return;

      addSectionHeader('Experience');

      for (const exp of experiences) {
        checkNewPage(80);

        // Job title and company
        const titleLine = `${exp.jobTitle || ''} at ${exp.companyName || ''}`;
        const titleLines = wrapText(titleLine, contentWidth, fontBold, sizes.body);

        for (const line of titleLines) {
          currentPage.drawText(line, {
            x: marginLeft,
            y: yPosition,
            size: sizes.body,
            font: fontBold,
            color: textColor
          });
          yPosition -= 15;
        }

        // Dates
        if (exp.startDate || exp.endDate) {
          const dateText = `${exp.startDate || ''} - ${exp.endDate || 'Present'}`;
          const dateWidth = fontItalic.widthOfTextAtSize(dateText, sizes.small);
          const dateX = width - marginRight - dateWidth;

          currentPage.drawText(dateText, {
            x: dateX,
            y: yPosition + 15, // Align with title
            size: sizes.small,
            font: fontItalic,
            color: grayColor
          });
        }

        yPosition -= 10;

        // Description
        if (exp.description) {
          const descLines = wrapText(exp.description, contentWidth, fontRegular, sizes.body);
          for (const line of descLines) {
            currentPage.drawText(line, {
              x: marginLeft,
              y: yPosition,
              size: sizes.body,
              font: fontRegular,
              color: textColor
            });
            yPosition -= 15;
          }
        }

        yPosition -= 15; // Space between experiences
      }
    };

    const addEducationSection = (educations) => {
      if (!educations || educations.length === 0) return;

      addSectionHeader('Education');

      for (const edu of educations) {
        checkNewPage(60);

        // Degree and school
        const degreeLine = `${edu.degree || ''} in ${edu.fieldOfStudy || ''}`;
        const schoolLine = edu.schoolName || '';

        currentPage.drawText(degreeLine, {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontItalic,
          color: textColor
        });

        // Dates on the right
        if (edu.startDate || edu.endDate) {
          const dateText = `${edu.startDate || ''} - ${edu.endDate || 'Present'}`;
          const dateWidth = fontRegular.widthOfTextAtSize(dateText, sizes.small);
          const dateX = width - marginRight - dateWidth;

          currentPage.drawText(dateText, {
            x: dateX,
            y: yPosition,
            size: sizes.small,
            font: fontRegular,
            color: grayColor
          });
        }

        yPosition -= 15;

        currentPage.drawText(schoolLine, {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontBold,
          color: textColor
        });

        yPosition -= 20;
      }
    };

    const addSkillsSection = (skills) => {
      if (!skills || skills.length === 0) return;

      addSectionHeader('Skills');

      const skillText = skills.map(skill => skill.name || skill).join(' • ');
      const skillLines = wrapText(skillText, contentWidth, fontRegular, sizes.body);

      for (const line of skillLines) {
        currentPage.drawText(line, {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontRegular,
          color: textColor
        });
        yPosition -= 15;
      }

      yPosition -= 10;
    };

    const addGenericSection = (title, items, itemRenderer) => {
      if (!items || items.length === 0) return;

      addSectionHeader(title);

      for (const item of items) {
        checkNewPage(40);
        itemRenderer(item);
        yPosition -= 15;
      }
    };

    // Render sections in order
    if (sections.summary) {
      addSectionHeader('Summary');
      const summaryLines = wrapText(sections.summary, contentWidth, fontRegular, sizes.body);
      for (const line of summaryLines) {
        currentPage.drawText(line, {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontRegular,
          color: textColor
        });
        yPosition -= 15;
      }
      yPosition -= 10;
    }

    addExperienceSection(sections.experience);
    addEducationSection(sections.education);
    addSkillsSection(sections.skills);

    if (sections.projects) {
      addGenericSection('Projects', sections.projects, (project) => {
        currentPage.drawText(project.name || '', {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontBold,
          color: textColor
        });
        yPosition -= 15;

        if (project.description) {
          const descLines = wrapText(project.description, contentWidth, fontRegular, sizes.body);
          for (const line of descLines) {
            currentPage.drawText(line, {
              x: marginLeft,
              y: yPosition,
              size: sizes.body,
              font: fontRegular,
              color: textColor
            });
            yPosition -= 15;
          }
        }
      });
    }

    if (sections.certifications) {
      addGenericSection('Certifications', sections.certifications, (cert) => {
        currentPage.drawText(cert.name || '', {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontBold,
          color: textColor
        });
        yPosition -= 15;

        currentPage.drawText(cert.issuer || '', {
          x: marginLeft,
          y: yPosition,
          size: sizes.body,
          font: fontRegular,
          color: grayColor
        });
      });
    }

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}