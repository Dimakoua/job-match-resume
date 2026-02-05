import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class ModernTemplate {
  /**
   * Generates a PDF buffer from resume data using the Modern template style
   * Matches Vue component: ResumeTemplateModern.vue
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
    const fontBoldItalic = await pdfDoc.embedFont(StandardFonts.HelveticaBoldOblique);

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
    
    // Colors matching Tailwind Slate
    const accentColor = parseHexColor(style.accentColor || '#2463eb');
    const slate900 = rgb(0.06, 0.09, 0.16); // #0f172a
    const slate700 = rgb(0.2, 0.25, 0.33); // #334155
    const slate500 = rgb(0.4, 0.45, 0.5);  // #64748b - approximate

    // Font size mapping
    const baseSize = style.fontSize || 11;
    const sizes = {
      name: Math.max(baseSize + 14, 24), // text-3xl approx
      title: Math.max(baseSize + 4, 14),
      header: Math.max(baseSize + 2, 12),
      body: baseSize,
      small: baseSize - 1.5
    };
    
    const margin = 48; // Matches layout.margins default 48px

    // Helper: Add text with wrapping
    // Returns new Y position
    const addText = (text, x, y, options = {}) => {
      if (!text) return y;
      const size = options.size || sizes.body;
      const font = options.font || fontRegular;
      const color = options.color || slate700;
      const maxWidth = options.maxWidth || (width - 2 * margin);
      const lineHeight = size * (options.lineHeight || 1.4);

      const words = String(text).split(' ');
      let line = '';
      let currentY = y;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const textWidth = font.widthOfTextAtSize(testLine, size);

        if (textWidth > maxWidth && line) {
          currentPage.drawText(line, { x, y: currentY, size, font, color });
          line = word;
          currentY -= lineHeight;
        } else {
          line = testLine;
        }
      }

      if (line) {
        currentPage.drawText(line, { x, y: currentY, size, font, color });
        currentY -= lineHeight;
      }

      return currentY;
    };

    // Helper: Check Page Break
    const checkPageBreak = (y, buffer = 50) => {
      if (y < margin + buffer) {
        currentPage = pdfDoc.addPage();
        return height - margin;
      }
      return y;
    };

    let y = height - margin;

    // --- HEADER ---
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      y = addText(fullName, margin, y, { size: sizes.name, font: fontBold, color: slate900 });
      y -= 5;
    }

    if (sections.title) {
      y = addText(sections.title, margin, y, { size: sizes.title, font: fontBoldItalic, color: accentColor });
      y -= 10;
    }

    // Contact Info (One line if possible)
    const contactParts = [
      sections.email,
      sections.phone,
      sections.location,
      ...(sections.socials || []).map(s => s.url || s.username)
    ].filter(Boolean);

    if (contactParts.length > 0) {
      y = addText(contactParts.join(' • '), margin, y, { size: sizes.small, font: fontRegular, color: slate500 });
      y -= 25; // Spacing after header
    }

    // --- SECTIONS ---
    
    const drawSectionHeader = (title) => {
      y = checkPageBreak(y);
      // Uppercase, spacing, accent color
      const headerText = title.toUpperCase();
      y = addText(headerText, margin, y, { 
        size: sizes.header, 
        font: fontBold, 
        color: accentColor,
        // pdf-lib doesn't support tracking natively easily without loop, avoiding for performance/simplicity
      }); 
      y -= 10;
    };

    // SUMMARY
    if (sections.summary) {
      drawSectionHeader('Profile');
      y = addText(sections.summary, margin, y, { size: sizes.body, font: fontRegular, color: slate700 });
      y -= 20;
    }

    // EXPERIENCE
    if (sections.experience?.length > 0) {
      drawSectionHeader('Experience');
      
      for (const job of sections.experience) {
        y = checkPageBreak(y);
        
        // Company Name (Left) & Date (Right potentially, but simplified to stacked for robust layout)
        // Modern template often has simplified headers. 
        // Let's do: Company Name (Bold Slate900)
        
        // Single line logic for "Company" ... "Date"
        const company = job.company || '';
        const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ') || job.date || '';
        
        y = addText(company, margin, y, { size: sizes.header, font: fontBold, color: slate900 });
        
        // If date exists, draw it nicely? or just append?
        // Let's put Title on next line
        const title = job.title || job.position || '';
        if (title) {
            y = checkPageBreak(y, 20);
            y = addText(title, margin, y + 2, { size: sizes.body, font: fontBoldItalic, color: accentColor });
        }

        if (dateRange || job.location) {
             const meta = [dateRange, job.location].filter(Boolean).join(' | ');
             y = addText(meta, margin, y + 2, { size: sizes.small, font: fontRegular, color: slate500 });
        }

        y -= 5;
        
        if (job.description) {
            y = addText(job.description, margin, y, { size: sizes.body, font: fontRegular, color: slate700 });
        }
        
        // Achievements
        if (job.achievements?.length > 0) {
            y -= 5;
            for (const ach of job.achievements) {
                y = checkPageBreak(y);
                y = addText(`• ${ach}`, margin + 10, y, { size: sizes.body, font: fontRegular, color: slate700, maxWidth: width - 2 * margin - 10 });
            }
        }
        y -= 15;
      }
    }

    // EDUCATION
    if (sections.education?.length > 0) {
      drawSectionHeader('Education');
      for (const edu of sections.education) {
        y = checkPageBreak(y);
        const school = edu.school || edu.university || '';
        y = addText(school, margin, y, { size: sizes.header, font: fontBold, color: slate900 });
        
        const degree = [edu.degree, edu.field].filter(Boolean).join(', ');
        if (degree) {
             y = addText(degree, margin, y + 2, { size: sizes.body, font: fontRegular, color: slate700 }); // Not accent, usually just text
        }
        
        const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ') || edu.year;
        if (dateRange) {
             y = addText(dateRange, margin, y + 2, { size: sizes.small, font: fontRegular, color: slate500 });
        }
        y -= 10;
      }
      y -= 10;
    }

    // SKILLS
    const skills = sections.skills;
    if (skills) {
       drawSectionHeader('Skills');
       let skillText = '';
       if (Array.isArray(skills)) {
           skillText = skills.join(' • ');
       } else if (typeof skills === 'object') {
           // Handle structured skills (technical, soft, etc)
           const parts = [];
           if (skills.technical) parts.push(`Technical: ${Array.isArray(skills.technical) ? skills.technical.join(', ') : skills.technical}`);
           if (skills.soft) parts.push(`Soft: ${Array.isArray(skills.soft) ? skills.soft.join(', ') : skills.soft}`);
           if (skills.languages) parts.push(`Languages: ${Array.isArray(skills.languages) ? skills.languages.join(', ') : skills.languages}`);
           skillText = parts.join('\n'); // addText handles basic wrapping but not newlines cleanly in my helper loop? 
           // My helper splits by space. Arrays of strings with newlines might behave oddly.
           // Better to iterate.
           for(const part of parts) {
               y = addText(part, margin, y);
           }
           skillText = ''; // handled
       }
       
       if (skillText) {
           y = addText(skillText, margin, y, { size: sizes.body, font: fontRegular, color: slate700 });
       }
       y -= 20;
    }

    // PROJECTS
    if (sections.projects?.length > 0) {
      drawSectionHeader('Projects');
      for (const proj of sections.projects) {
          y = checkPageBreak(y);
          y = addText(proj.name, margin, y, { size: sizes.header, font: fontBold, color: slate900 });
          if(proj.description) {
              y = addText(proj.description, margin, y + 2, { size: sizes.body, font: fontRegular, color: slate700 });
          }
          if(proj.url) {
             y = addText(proj.url, margin, y + 2, { size: sizes.small, font: fontRegular, color: accentColor });
          }
          y -= 10;
      }
    }

    // CERTIFICATIONS (Added matching logic)
    if (sections.certifications?.length > 0) {
        drawSectionHeader('Certifications');
        for (const cert of sections.certifications) {
            y = checkPageBreak(y);
            const text = cert.name + (cert.issuer ? ` • ${cert.issuer}` : '') + (cert.date ? ` • ${cert.date}` : '');
             y = addText(text, margin, y, { size: sizes.body, font: fontRegular, color: slate700 });
             y -= 5;
        }
    }


    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }
}
