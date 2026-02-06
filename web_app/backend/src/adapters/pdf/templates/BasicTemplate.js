import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class BasicTemplate {
  /**
   * Generates a PDF buffer from resume data using the Basic template style
   * Simple, clean layout with minimal styling
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

    // Add a page
    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();

    const margin = 50; // Standard margins
    const lineHeight = 14;
    const fontSize = 12;

    // Helper: Add text with wrapping
    const addText = (text, x, y, options = {}) => {
      if (!text) return y;
      const size = options.size || fontSize;
      const font = options.font || fontRegular;
      const maxWidth = options.maxWidth || (width - 2 * margin);

      const words = String(text).split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && line) {
          currentPage.drawText(line, { x, y: currentY, size, font });
          line = word;
          currentY -= lineHeight;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, { x, y: currentY, size, font });
        currentY -= lineHeight;
      }

      return currentY;
    };

    // Helper: Check Page Break
    const checkPageBreak = (y) => {
      if (y < margin + 50) {
        currentPage = pdfDoc.addPage();
        return height - margin;
      }
      return y;
    };

    let y = height - margin;

    // --- HEADER ---
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      y = addText(fullName, margin, y, { size: 18, font: fontBold });
      y -= 10;
    }

    if (sections.title) {
      y = addText(sections.title, margin, y, { size: 14, font: fontBold });
      y -= 15;
    }

    // Contact Info
    const contactParts = [
      sections.email,
      sections.phone,
      sections.location
    ].filter(Boolean);

    if (contactParts.length > 0) {
      y = addText(contactParts.join(' | '), margin, y, { size: 10 });
      y -= 20;
    }

    // --- SECTIONS ---

    const drawSectionHeader = (title) => {
      y = checkPageBreak(y);
      y = addText(title.toUpperCase(), margin, y, { size: 14, font: fontBold });
      y -= 10;
    };

    // SUMMARY
    if (sections.summary) {
      drawSectionHeader('Summary');
      y = addText(sections.summary, margin, y);
      y -= 15;
    }

    // EXPERIENCE
    if (sections.experience?.length > 0) {
      drawSectionHeader('Experience');

      for (const job of sections.experience) {
        y = checkPageBreak(y);

        const company = job.company || '';
        const title = job.title || '';
        const header = [title, company].filter(Boolean).join(' at ');
        y = addText(header, margin, y, { font: fontBold });

        const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ') || job.date;
        if (dateRange) {
          y = addText(dateRange, margin, y, { size: 10 });
        }

        if (job.location) {
          y = addText(job.location, margin, y, { size: 10 });
        }

        y -= 5;

        if (job.description) {
          y = addText(job.description, margin, y);
        }

        if (job.achievements?.length > 0) {
          y -= 5;
          for (const ach of job.achievements) {
            y = checkPageBreak(y);
            y = addText(`• ${ach}`, margin + 15, y);
          }
        }
        y -= 10;
      }
    }

    // EDUCATION
    if (sections.education?.length > 0) {
      drawSectionHeader('Education');
      for (const edu of sections.education) {
        y = checkPageBreak(y);
        const school = edu.school || '';
        y = addText(school, margin, y, { font: fontBold });

        const degree = [edu.degree, edu.field].filter(Boolean).join(', ');
        if (degree) {
          y = addText(degree, margin, y);
        }

        const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ') || edu.year;
        if (dateRange) {
          y = addText(dateRange, margin, y, { size: 10 });
        }
        y -= 10;
      }
    }

    // SKILLS
    const skills = sections.skills;
    if (skills) {
      drawSectionHeader('Skills');
      let skillText = '';
      if (Array.isArray(skills)) {
        skillText = skills.join(', ');
      } else if (typeof skills === 'object') {
        const parts = [];
        if (skills.technical) parts.push(`Technical: ${Array.isArray(skills.technical) ? skills.technical.join(', ') : skills.technical}`);
        if (skills.soft) parts.push(`Soft: ${Array.isArray(skills.soft) ? skills.soft.join(', ') : skills.soft}`);
        if (skills.languages) parts.push(`Languages: ${Array.isArray(skills.languages) ? skills.languages.join(', ') : skills.languages}`);
        skillText = parts.join('; ');
      }

      if (skillText) {
        y = addText(skillText, margin, y);
      }
      y -= 15;
    }

    // PROJECTS
    if (sections.projects?.length > 0) {
      drawSectionHeader('Projects');
      for (const proj of sections.projects) {
        y = checkPageBreak(y);
        y = addText(proj.name, margin, y, { font: fontBold });
        if (proj.description) {
          y = addText(proj.description, margin, y);
        }
        if (proj.url) {
          y = addText(proj.url, margin, y, { size: 10 });
        }
        y -= 10;
      }
    }

    // CERTIFICATIONS
    if (sections.certifications?.length > 0) {
      drawSectionHeader('Certifications');
      for (const cert of sections.certifications) {
        y = checkPageBreak(y);
        const text = cert.name + (cert.issuer ? ` - ${cert.issuer}` : '') + (cert.date ? ` (${cert.date})` : '');
        y = addText(text, margin, y);
        y -= 5;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}