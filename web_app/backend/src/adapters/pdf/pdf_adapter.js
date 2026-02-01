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
    if (!resume.sections || typeof resume.sections !== 'object') {
      throw new Error('Resume must have sections object');
    }

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a page
    let currentPage = pdfDoc.addPage();
    const { width, height } = currentPage.getSize();

    // Extract styles from resume
    const style = resume.style || {};
    const layout = resume.layout || {};
    
    // Parse accent color
    const parseHexColor = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? rgb(
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
      ) : rgb(0.14, 0.38, 0.92); // Default blue
    };
    
    const accentColor = parseHexColor(style.accentColor || '#2463eb');

    // Font size mapping
    const fontSize = style.fontSize || 11;
    const titleFontSize = Math.max(fontSize + 5, 16);
    const headingFontSize = Math.max(fontSize + 1, 13);
    
    // Page margins
    const margin = 50;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, size = fontSize, maxWidth = width - 2 * margin, color = rgb(0, 0, 0)) => {
      if (!text) return y;
      const words = String(text).split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = testLine.length * (size * 0.6); // Rough estimate

        if (textWidth > maxWidth && line) {
          currentPage.drawText(line, { x, y: currentY, size, color });
          line = word;
          currentY -= size + 5;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, { x, y: currentY, size, color });
        currentY -= size + 5;
      }

      return currentY;
    };

    const sections = resume.sections;

    // Initialize y position for text placement
    let yPosition = height - margin;

    // Add header with personal info
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      yPosition = addText(fullName, margin, yPosition, titleFontSize, width - 2 * margin, accentColor);
    }

    // Add title
    if (sections.title) {
      yPosition = addText(sections.title, margin, yPosition, fontSize + 2, width - 2 * margin, accentColor);
    }

    // Add contact info
    if (sections.email || sections.phone || sections.location) {
      const contactInfo = [sections.email, sections.phone, sections.location].filter(Boolean).join(' • ');
      yPosition = addText(contactInfo, margin, yPosition, fontSize - 1);
    }
    yPosition -= 15; // Extra space after header

    // Add summary
    if (sections.summary) {
      yPosition = addText('Profile', margin, yPosition, headingFontSize, width - 2 * margin, rgb(0.4, 0.4, 0.4));
      yPosition -= 5;
      yPosition = addText(sections.summary, margin + 10, yPosition, fontSize);
      yPosition -= 15;
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage();
        yPosition = height - margin;
      }
    }

    // Add experience
    if (sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
      yPosition = addText('Experience', margin, yPosition, headingFontSize, width - 2 * margin, rgb(0.4, 0.4, 0.4));
      yPosition -= 5;
      for (const job of sections.experience) {
        if (job.title || job.position || job.company) {
          const title = job.title || job.position || '';
          yPosition = addText(`${title} at ${job.company || ''}`, margin + 10, yPosition, fontSize, width - 2 * margin - 10, accentColor);
        }
        if (job.startDate || job.endDate) {
          const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ');
          yPosition = addText(dateRange, margin + 10, yPosition, fontSize - 1);
        } else if (job.duration || job.date) {
          yPosition = addText(`${job.duration || job.date || ''}`, margin + 10, yPosition, fontSize - 1);
        }
        if (job.location) {
          yPosition = addText(`${job.location}`, margin + 10, yPosition, fontSize - 1);
        }
        if (job.description) {
          yPosition = addText(job.description, margin + 20, yPosition, fontSize - 1);
        } else if (job.achievements && Array.isArray(job.achievements)) {
          for (const achievement of job.achievements) {
            yPosition = addText(`• ${achievement}`, margin + 20, yPosition, fontSize - 1);
          }
        }
        yPosition -= 8;
      }
      yPosition -= 10;
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage();
        yPosition = height - margin;
      }
    }

    // Add education
    if (sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
      yPosition = addText('Education', margin, yPosition, headingFontSize, width - 2 * margin, rgb(0.4, 0.4, 0.4));
      yPosition -= 5;
      for (const edu of sections.education) {
        if (edu.school || edu.university) {
          const school = edu.school || edu.university || '';
          yPosition = addText(school, margin + 10, yPosition, fontSize);
        }
        if (edu.degree || edu.field) {
          const degreeText = [edu.degree, edu.field].filter(Boolean).join(', ');
          yPosition = addText(degreeText, margin + 10, yPosition, fontSize, width - 2 * margin - 10, accentColor);
        }
        if (edu.startDate || edu.endDate) {
          const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
          yPosition = addText(dateRange, margin + 10, yPosition, fontSize - 1);
        } else if (edu.years) {
          yPosition = addText(`${edu.years}`, margin + 10, yPosition, fontSize - 1);
        }
        yPosition -= 8;
      }
      yPosition -= 10;
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage();
        yPosition = height - margin;
      }
    }

    // Add certifications
    if (sections.certifications && Array.isArray(sections.certifications) && sections.certifications.length > 0) {
      yPosition = addText('Certifications', margin, yPosition, headingFontSize, width - 2 * margin, rgb(0.4, 0.4, 0.4));
      yPosition -= 5;
      for (const cert of sections.certifications) {
        if (cert.name) {
          let certText = cert.name;
          if (cert.issuer) certText += ` • ${cert.issuer}`;
          if (cert.date) certText += ` • ${cert.date}`;
          yPosition = addText(certText, margin + 10, yPosition, fontSize);
        }
        yPosition -= 8;
      }
      yPosition -= 10;
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage();
        yPosition = height - margin;
      }
    }

    // Add projects
    if (sections.projects && Array.isArray(sections.projects) && sections.projects.length > 0) {
      yPosition = addText('Projects', margin, yPosition, headingFontSize, width - 2 * margin, rgb(0.4, 0.4, 0.4));
      yPosition -= 5;
      for (const project of sections.projects) {
        if (project.name) {
          yPosition = addText(project.name, margin + 10, yPosition, fontSize);
        }
        if (project.description) {
          yPosition = addText(project.description, margin + 20, yPosition, fontSize - 1);
        }
        yPosition -= 8;
      }
      yPosition -= 10;
      if (yPosition < margin + 50) {
        currentPage = pdfDoc.addPage();
        yPosition = height - margin;
      }
    }

    if (sections.skills && (Array.isArray(sections.skills) || typeof sections.skills === 'object')) {
      yPosition = addText('Expertise', margin, yPosition, headingFontSize, width - 2 * margin, rgb(0.4, 0.4, 0.4));
      yPosition -= 5;
      if (Array.isArray(sections.skills)) {
        yPosition = addText(sections.skills.join(', '), margin + 10, yPosition, fontSize);
      } else if (sections.skills.technical) {
        yPosition = addText(`Technical: ${Array.isArray(sections.skills.technical) ? sections.skills.technical.join(', ') : sections.skills.technical}`, margin + 10, yPosition, fontSize);
      }
      yPosition -= 15;
    }

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}