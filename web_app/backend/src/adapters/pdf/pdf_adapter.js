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

    // Set up fonts and colors
    const fontSize = 12;
    const titleFontSize = 16;
    const margin = 50;
    let yPosition = height - margin;

    // Helper function to add text with word wrapping
    const addText = (text, x, y, size = fontSize, maxWidth = width - 2 * margin) => {
      if (!text) return y;
      const words = String(text).split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = testLine.length * (size * 0.6); // Rough estimate

        if (textWidth > maxWidth && line) {
          currentPage.drawText(line, { x, y: currentY, size, color: rgb(0, 0, 0) });
          line = word;
          currentY -= size + 5;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, { x, y: currentY, size, color: rgb(0, 0, 0) });
        currentY -= size + 5;
      }

      return currentY;
    };

    const sections = resume.sections;

    // Add header with personal info
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      yPosition = addText(fullName, margin, yPosition, titleFontSize);
    }

    // Add contact info
    if (sections.email || sections.phone || sections.location) {
      const contactInfo = [sections.email, sections.phone, sections.location].filter(Boolean).join(' • ');
      yPosition = addText(contactInfo, margin, yPosition, fontSize - 1);
    }
    yPosition -= 15; // Extra space after header

    // Add summary
    if (sections.summary) {
      yPosition = addText('Professional Summary', margin, yPosition, fontSize + 2);
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
      yPosition = addText('Work Experience', margin, yPosition, fontSize + 2);
      yPosition -= 5;
      for (const job of sections.experience) {
        if (job.title || job.position || job.company) {
          const title = job.title || job.position || '';
          yPosition = addText(`${title} at ${job.company || ''}`, margin + 10, yPosition, fontSize);
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
      yPosition = addText('Education', margin, yPosition, fontSize + 2);
      yPosition -= 5;
      for (const edu of sections.education) {
        if (edu.degree || edu.school || edu.university) {
          const school = edu.school || edu.university || '';
          const degreeText = [edu.degree, edu.field].filter(Boolean).join(', ');
          yPosition = addText(`${degreeText} from ${school}`, margin + 10, yPosition, fontSize);
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
      yPosition = addText('Certifications', margin, yPosition, fontSize + 2);
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
      yPosition = addText('Projects', margin, yPosition, fontSize + 2);
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
      yPosition = addText('Skills', margin, yPosition, fontSize + 2);
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