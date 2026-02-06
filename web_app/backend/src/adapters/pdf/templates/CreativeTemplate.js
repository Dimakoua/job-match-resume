import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class CreativeTemplate {
  /**
   * Generates a PDF buffer from resume data using the Creative template style
   * Matches Vue component: ResumeTemplateCreative.vue
   * Features: Two-column layout with sidebar, rotated photo, skill bars, timeline
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
    const fontItalic = await pdfDoc.embedFont(StandardFonts.TimesItalic);

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
    const lightGrayColor = rgb(0.9, 0.9, 0.9); // #e5e5e5

    // Font size mapping
    const baseSize = style.fontSize || 11;
    const sizes = {
      name: baseSize + 16, // 27pt
      title: baseSize + 2, // 13pt
      section: baseSize + 4, // 15pt
      body: baseSize, // 11pt
      contact: baseSize - 1, // 10pt
      small: baseSize - 2 // 9pt
    };

    const margin = 50;
    const sidebarWidth = (width - 2 * margin) / 3;
    const mainWidth = (width - 2 * margin) * 2 / 3;
    let currentY = height - margin;

    // Helper: Add text with wrapping
    const addText = (text, x, y, options = {}) => {
      if (!text) return y;
      const size = options.size || sizes.body;
      const font = options.font || fontRegular;
      const color = options.color || textColor;
      const maxWidth = options.maxWidth || mainWidth;

      const words = String(text).split(' ');
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

    // Helper: Check if we need a new page
    const checkNewPage = (requiredSpace) => {
      if (currentY - requiredSpace < margin) {
        currentPage = pdfDoc.addPage();
        currentY = height - margin;
        return true;
      }
      return false;
    };

    // Sidebar background
    currentPage.drawRectangle({
      x: margin,
      y: margin,
      width: sidebarWidth,
      height: height - 2 * margin,
      color: rgb(0.96, 0.96, 0.96) // Light gray background
    });

    // Profile section in sidebar
    let sidebarY = height - margin - 60;

    // Profile photo placeholder (rotated)
    currentPage.drawRectangle({
      x: margin + sidebarWidth / 2 - 40,
      y: sidebarY - 80,
      width: 80,
      height: 80,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: rgb(1, 1, 1),
      borderWidth: 2
    });

    sidebarY -= 120;

    // Name
    const fullName = `${resume.firstName || 'Your'} ${resume.lastName || 'Name'}`;
    currentPage.drawText(fullName, {
      x: margin + sidebarWidth / 2 - fontBold.widthOfTextAtSize(fullName, sizes.name) / 2,
      y: sidebarY,
      size: sizes.name,
      font: fontBold,
      color: textColor
    });
    sidebarY -= sizes.name * 1.2;

    // Title
    if (resume.title) {
      currentPage.drawText(resume.title.toUpperCase(), {
        x: margin + sidebarWidth / 2 - fontBold.widthOfTextAtSize(resume.title.toUpperCase(), sizes.title) / 2,
        y: sidebarY,
        size: sizes.title,
        font: fontBold,
        color: accentColor
      });
      sidebarY -= sizes.title * 2;
    }

    // Contact section
    sidebarY -= 20;
    currentPage.drawText('CONTACT', {
      x: margin + 10,
      y: sidebarY,
      size: sizes.contact,
      font: fontBold,
      color: textColor
    });
    currentPage.drawRectangle({
      x: margin + 10,
      y: sidebarY - 2,
      width: sidebarWidth - 20,
      height: 1,
      color: accentColor
    });
    sidebarY -= sizes.contact * 2;

    const contactItems = [];
    if (resume.email) contactItems.push(resume.email.toLowerCase());
    if (resume.phone) contactItems.push(resume.phone);
    if (resume.location) contactItems.push(resume.location);

    for (const contact of contactItems) {
      currentPage.drawText('•', {
        x: margin + 15,
        y: sidebarY,
        size: sizes.contact,
        font: fontRegular,
        color: accentColor
      });
      currentPage.drawText(contact, {
        x: margin + 25,
        y: sidebarY,
        size: sizes.contact,
        font: fontRegular,
        color: grayColor
      });
      sidebarY -= sizes.contact * 1.5;
    }

    // Skills section
    sidebarY -= 20;
    currentPage.drawText('CORE SKILLS', {
      x: margin + 10,
      y: sidebarY,
      size: sizes.contact,
      font: fontBold,
      color: textColor
    });
    currentPage.drawRectangle({
      x: margin + 10,
      y: sidebarY - 2,
      width: sidebarWidth - 20,
      height: 1,
      color: accentColor
    });
    sidebarY -= sizes.contact * 2.5;

    const skills = sections.skills || [];
    const topSkills = skills.slice(0, 3);

    for (const skill of topSkills) {
      const skillName = skill.name || skill;
      const skillLevel = skill.level || '85%';

      currentPage.drawText(skillName, {
        x: margin + 15,
        y: sidebarY,
        size: sizes.small,
        font: fontBold,
        color: textColor
      });

      const levelValue = parseInt(skillLevel.replace('%', '')) || 85;
      currentPage.drawText(`${levelValue}%`, {
        x: margin + sidebarWidth - 30,
        y: sidebarY,
        size: sizes.small,
        font: fontBold,
        color: accentColor
      });

      sidebarY -= sizes.small * 1.5;

      // Progress bar background
      currentPage.drawRectangle({
        x: margin + 15,
        y: sidebarY - 2,
        width: sidebarWidth - 30,
        height: 4,
        color: lightGrayColor
      });

      // Progress bar fill
      currentPage.drawRectangle({
        x: margin + 15,
        y: sidebarY - 2,
        width: (sidebarWidth - 30) * (levelValue / 100),
        height: 4,
        color: accentColor
      });

      sidebarY -= 12;
    }

    // Additional skills as tags
    const remainingSkills = skills.slice(3);
    if (remainingSkills.length > 0) {
      sidebarY -= 10;
      let tagX = margin + 15;
      const tagY = sidebarY;

      for (const skill of remainingSkills) {
        const skillName = skill.name || skill;
        const tagWidth = fontBold.widthOfTextAtSize(skillName, sizes.small) + 8;

        if (tagX + tagWidth > margin + sidebarWidth - 15) {
          sidebarY -= 8;
          tagX = margin + 15;
        }

        currentPage.drawRectangle({
          x: tagX,
          y: sidebarY - 6,
          width: tagWidth,
          height: 12,
          color: accentColor
        });

        currentPage.drawText(skillName, {
          x: tagX + 4,
          y: sidebarY - 2,
          size: sizes.small,
          font: fontBold,
          color: rgb(1, 1, 1)
        });

        tagX += tagWidth + 4;
      }
    }

    // Main content area
    let mainY = height - margin - 40;

    // Profile summary
    const summary = sections.summary;
    if (summary) {
      // Section header with dot
      currentPage.drawCircle({
        x: margin + sidebarWidth + 15,
        y: mainY + 5,
        size: 3,
        color: accentColor
      });

      currentPage.drawText('Profile', {
        x: margin + sidebarWidth + 25,
        y: mainY,
        size: sizes.section,
        font: fontBold,
        color: textColor
      });

      mainY -= sizes.section * 1.5;

      mainY = addText(summary, margin + sidebarWidth + 15, mainY, {
        font: fontItalic,
        size: sizes.body,
        maxWidth: mainWidth - 15,
        color: grayColor
      });

      mainY -= 30;
    }

    // Experience section
    const experience = sections.experience || [];
    if (experience.length > 0) {
      checkNewPage(100);

      // Section header with dot
      currentPage.drawCircle({
        x: margin + sidebarWidth + 15,
        y: mainY + 5,
        size: 3,
        color: accentColor
      });

      currentPage.drawText('Experience', {
        x: margin + sidebarWidth + 25,
        y: mainY,
        size: sizes.section,
        font: fontBold,
        color: textColor
      });

      mainY -= sizes.section * 2;

      for (const exp of experience) {
        checkNewPage(80);

        // Timeline dot
        currentPage.drawCircle({
          x: margin + sidebarWidth + 15,
          y: mainY + 5,
          size: 4,
          color: accentColor
        });

        currentPage.drawRectangle({
          x: margin + sidebarWidth + 11,
          y: mainY - 60,
          width: 1,
          height: 70,
          color: lightGrayColor
        });

        const titleLine = `${exp.position || ''}${exp.position && exp.company ? ' at ' : ''}${exp.company || ''}`;
        if (titleLine.trim()) {
          currentPage.drawText(titleLine, {
            x: margin + sidebarWidth + 30,
            y: mainY,
            size: sizes.body,
            font: fontBold,
            color: textColor
          });
          mainY -= sizes.body * 1.3;
        }

        // Date range
        if (exp.startDate || exp.endDate) {
          const dateRange = `${exp.startDate || ''}${exp.startDate && exp.endDate ? ' — ' : ''}${exp.endDate || 'Present'}`;
          currentPage.drawText(dateRange, {
            x: margin + sidebarWidth + mainWidth - 100,
            y: mainY + sizes.body * 1.3,
            size: sizes.small,
            font: fontBold,
            color: grayColor
          });
        }

        // Description
        if (exp.description) {
          mainY = addText(exp.description, margin + sidebarWidth + 30, mainY, {
            size: sizes.contact,
            maxWidth: mainWidth - 45,
            color: grayColor
          });
        }

        mainY -= 25;
      }

      mainY -= 20;
    }

    // Projects section
    const projects = sections.projects || [];
    if (projects.length > 0) {
      checkNewPage(100);

      // Section header with dot
      currentPage.drawCircle({
        x: margin + sidebarWidth + 15,
        y: mainY + 5,
        size: 3,
        color: accentColor
      });

      currentPage.drawText('Recent Projects', {
        x: margin + sidebarWidth + 25,
        y: mainY,
        size: sizes.section,
        font: fontBold,
        color: textColor
      });

      mainY -= sizes.section * 2;

      let projectX = margin + sidebarWidth + 15;
      let projectY = mainY;

      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];

        if (i > 0 && i % 2 === 0) {
          projectX = margin + sidebarWidth + 15;
          projectY -= 80;
        }

        // Project box
        currentPage.drawRectangle({
          x: projectX,
          y: projectY - 60,
          width: (mainWidth - 30) / 2,
          height: 70,
          color: rgb(1, 1, 1),
          borderColor: lightGrayColor,
          borderWidth: 1
        });

        let boxY = projectY - 5;

        if (project.name) {
          currentPage.drawText(project.name, {
            x: projectX + 8,
            y: boxY,
            size: sizes.contact,
            font: fontBold,
            color: textColor
          });
          boxY -= sizes.contact * 1.3;
        }

        currentPage.drawText('Project', {
          x: projectX + 8,
          y: boxY,
          size: sizes.small,
          font: fontItalic,
          color: grayColor
        });
        boxY -= sizes.small * 1.5;

        if (project.description) {
          const descWords = project.description.split(' ').slice(0, 10).join(' ');
          currentPage.drawText(descWords + (project.description.split(' ').length > 10 ? '...' : ''), {
            x: projectX + 8,
            y: boxY,
            size: sizes.small,
            font: fontRegular,
            color: grayColor
          });
        }

        projectX += (mainWidth - 30) / 2 + 10;
      }

      mainY = projectY - 90;
    }

    // Education section
    const education = sections.education || [];
    if (education.length > 0) {
      checkNewPage(80);

      // Section header with dot
      currentPage.drawCircle({
        x: margin + sidebarWidth + 15,
        y: mainY + 5,
        size: 3,
        color: accentColor
      });

      currentPage.drawText('Education', {
        x: margin + sidebarWidth + 25,
        y: mainY,
        size: sizes.section,
        font: fontBold,
        color: textColor
      });

      mainY -= sizes.section * 2;

      for (const edu of education) {
        const degreeLine = `${edu.degree || ''}${edu.degree && edu.field ? ' in ' : ''}${edu.field || ''}`;

        if (degreeLine.trim()) {
          currentPage.drawText(degreeLine, {
            x: margin + sidebarWidth + 15,
            y: mainY,
            size: sizes.body,
            font: fontBold,
            color: textColor
          });
          mainY -= sizes.body * 1.3;
        }

        if (edu.school) {
          currentPage.drawText(edu.school, {
            x: margin + sidebarWidth + 15,
            y: mainY,
            size: sizes.contact,
            font: fontRegular,
            color: grayColor
          });
          mainY -= sizes.contact * 1.3;
        }

        if (edu.startDate || edu.endDate) {
          const dateRange = `${edu.startDate || ''}${edu.startDate && edu.endDate ? ' — ' : ''}${edu.endDate || ''}`;
          currentPage.drawText(dateRange, {
            x: margin + sidebarWidth + mainWidth - 80,
            y: mainY + sizes.contact * 1.3,
            size: sizes.small,
            font: fontItalic,
            color: accentColor
          });
        }

        mainY -= 15;
      }
    }

    // Save and return PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}