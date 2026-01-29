import { PDFDocument, rgb } from 'pdf-lib';

export class PdfAdapter {
  /**
   * Generates a PDF buffer from resume data
   * @param {Resume} resume - The resume entity to convert to PDF
   * @returns {Promise<Uint8Array>} - PDF buffer as Uint8Array
   */
  async generateBuffer(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    if (!resume.sections || !Array.isArray(resume.sections)) {
      throw new Error('Resume must have sections array');
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Set up fonts and colors
    const fontSize = 12;
    const titleFontSize = 16;
    const margin = 50;
    let yPosition = height - margin;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, size = fontSize, maxWidth = width - 2 * margin) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = testLine.length * (size * 0.6); // Rough estimate

        if (textWidth > maxWidth && line) {
          page.drawText(line, { x, y: currentY, size, color: rgb(0, 0, 0) });
          line = word;
          currentY -= size + 5;
        } else {
          line = testLine;
        }
      }

      if (line) {
        page.drawText(line, { x, y: currentY, size, color: rgb(0, 0, 0) });
        currentY -= size + 5;
      }

      return currentY;
    };

    // Add title
    yPosition = addText(resume.title, margin, yPosition, titleFontSize);
    yPosition -= 20; // Extra space after title

    // Process each section
    for (const section of resume.sections) {
      if (!section.type || !section.data) continue;

      // Add section header
      const sectionTitle = this._formatSectionTitle(section.type);
      yPosition = addText(sectionTitle, margin, yPosition, fontSize + 2);
      yPosition -= 10;

      // Add section content based on type
      yPosition = this._addSectionContent(page, section, margin, yPosition, addText);

      // Add space between sections
      yPosition -= 15;

      // Check if we need a new page
      if (yPosition < margin + 100) {
        // For now, we'll just continue on the same page
        // In a full implementation, you'd add a new page here
      }
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  _formatSectionTitle(type) {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  _addSectionContent(page, section, margin, yPosition, addText) {
    const { type, data } = section;

    switch (type) {
      case 'personal_info':
      case 'contact':
        if (data.name) yPosition = addText(`Name: ${data.name}`, margin + 20, yPosition);
        if (data.email) yPosition = addText(`Email: ${data.email}`, margin + 20, yPosition);
        if (data.phone) yPosition = addText(`Phone: ${data.phone}`, margin + 20, yPosition);
        if (data.location || data.address) yPosition = addText(`Location: ${data.location || data.address}`, margin + 20, yPosition);
        break;

      case 'summary':
      case 'professional_summary':
        if (data.text) yPosition = addText(data.text, margin + 20, yPosition);
        break;

      case 'experience':
      case 'work_experience':
        if (Array.isArray(data)) {
          for (const exp of data) {
            if (exp.position && exp.company) {
              yPosition = addText(`${exp.position} at ${exp.company}`, margin + 20, yPosition);
            }
            if (exp.startDate && exp.endDate) {
              yPosition = addText(`${exp.startDate} - ${exp.endDate}`, margin + 40, yPosition);
            }
            if (exp.description) {
              yPosition = addText(exp.description, margin + 40, yPosition);
            }
            yPosition -= 10;
          }
        } else {
          // Single experience object
          if (data.position && data.company) {
            yPosition = addText(`${data.position} at ${data.company}`, margin + 20, yPosition);
          }
          if (data.startDate && data.endDate) {
            yPosition = addText(`${data.startDate} - ${data.endDate}`, margin + 20, yPosition);
          }
          if (data.description) {
            yPosition = addText(data.description, margin + 20, yPosition);
          }
        }
        break;

      case 'education':
        if (Array.isArray(data)) {
          for (const edu of data) {
            if (edu.degree && edu.institution) {
              yPosition = addText(`${edu.degree} from ${edu.institution}`, margin + 20, yPosition);
            }
            if (edu.graduationDate) {
              yPosition = addText(`Graduated: ${edu.graduationDate}`, margin + 40, yPosition);
            }
            yPosition -= 10;
          }
        } else {
          if (data.degree && data.institution) {
            yPosition = addText(`${data.degree} from ${data.institution}`, margin + 20, yPosition);
          }
          if (data.graduationDate) {
            yPosition = addText(`Graduated: ${data.graduationDate}`, margin + 20, yPosition);
          }
        }
        break;

      case 'skills':
        if (data.skills && Array.isArray(data.skills)) {
          yPosition = addText(data.skills.join(', '), margin + 20, yPosition);
        }
        break;

      default:
        // Generic handling for unknown section types
        const content = JSON.stringify(data, null, 2);
        yPosition = addText(content, margin + 20, yPosition);
    }

    return yPosition;
  }
}