import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { buildBasicTemplateModel } from '../../../../../shared/templates/basicTemplateModel.js';

const sanitizePdfText = (value) => {
  if (value === null || value === undefined) return '';

  return String(value)
    .normalize('NFKC')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\u2190\u2192\u21D0\u21D2]/g, '->')
    .replace(/[\u2191\u2193\u21D1\u21D3]/g, '^')
    .replace(/[\u25A0-\u25FF]/g, '-')
    .replace(/[\u2022\u2043]/g, '-')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u00A0/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

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
    const model = buildBasicTemplateModel(resume);

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
      const safeText = sanitizePdfText(text);
      if (!safeText) return y;

      const size = options.size || fontSize;
      const font = options.font || fontRegular;
      const maxWidth = options.maxWidth || (width - 2 * margin);
      const align = options.align || 'left';

      const words = safeText.split(' ');
      let line = '';
      let currentY = y;

      const drawLine = (lineText) => {
        const textWidth = font.widthOfTextAtSize(lineText, size);
        const drawX = align === 'center' ? x + (maxWidth - textWidth) / 2 : x;
        currentPage.drawText(lineText, { x: drawX, y: currentY, size, font });
      };

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && line) {
          drawLine(line);
          line = word;
          currentY -= lineHeight;
        } else {
          line = testLine;
        }
      }

      if (line) {
        drawLine(line);
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
    if (model.header.fullName) {
      y = addText(model.header.fullName, margin, y, { size: 18, font: fontBold, align: 'center' });
      y -= 10;
    }

    if (model.header.title) {
      y = addText(model.header.title, margin, y, { size: 14, font: fontBold, align: 'center' });
      y -= 15;
    }

    if (model.header.contactLine) {
      y = addText(model.header.contactLine, margin, y, { size: 10, align: 'center' });
      y -= 20;
    }

    // --- SECTIONS ---

    const drawSectionHeader = (title) => {
      y = checkPageBreak(y);
      y = addText(title.toUpperCase(), margin, y, { size: 14, font: fontBold });
      currentPage.drawLine({
        start: { x: margin, y: y + 4 },
        end: { x: width - margin, y: y + 4 },
        thickness: 1,
        color: rgb(0, 0, 0)
      });
      y -= 10;
    };

    // SUMMARY
    if (model.summary) {
      drawSectionHeader('Summary');
      y = addText(model.summary, margin, y);
      y -= 15;
    }

    // EXPERIENCE
    if (model.experience.length > 0) {
      drawSectionHeader('Experience');

      for (const job of model.experience) {
        y = checkPageBreak(y);

        if (job.company) {
          y = addText(job.company, margin, y, { font: fontBold });
        }

        if (job.title) {
          y = addText(job.title, margin, y);
        }

        if (job.dateLine) {
          y = addText(job.dateLine, margin, y, { size: 10 });
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
            y = addText(`- ${ach}`, margin + 15, y);
          }
        }
        y -= 10;
      }
    }

    // EDUCATION
    if (model.education.length > 0) {
      drawSectionHeader('Education');
      for (const edu of model.education) {
        y = checkPageBreak(y);
        const school = edu.school || '';
        y = addText(school, margin, y, { font: fontBold });

        if (edu.degreeLine) {
          y = addText(edu.degreeLine, margin, y);
        }

        if (edu.dateLine) {
          y = addText(edu.dateLine, margin, y, { size: 10 });
        }
        y -= 10;
      }
    }

    // SKILLS
    if (model.skills.text) {
      drawSectionHeader('Skills');
      y = addText(model.skills.text, margin, y);
      y -= 15;
    }

    // PROJECTS
    if (model.projects.length > 0) {
      drawSectionHeader('Projects');
      for (const proj of model.projects) {
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
    if (model.certifications.length > 0) {
      drawSectionHeader('Certifications');
      for (const cert of model.certifications) {
        y = checkPageBreak(y);
        y = addText(cert.textLine, margin, y);
        y -= 5;
      }
    }

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}