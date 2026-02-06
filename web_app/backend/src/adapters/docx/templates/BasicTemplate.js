import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

export class BasicTemplate {
  /**
   * Generates a DOCX buffer from resume data using Basic template style
   * Simple, clean layout with minimal styling
   * @param {Resume} resume - The resume entity to convert to DOCX
   * @returns {Promise<Uint8Array>} - DOCX buffer as Uint8Array
   */
  async generate(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    const sections = resume.sections || {};

    const fontFamily = 'Arial';
    const fontSize = 24; // 12pt in half-points

    const docSections = [];

    // Helper for Section Headers
    const createSectionHeader = (text) => {
      return new Paragraph({
        text: text.toUpperCase(),
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        run: {
          font: fontFamily,
          size: fontSize,
          bold: true
        }
      });
    };

    // Helper for regular text
    const createParagraph = (text, options = {}) => {
      return new Paragraph({
        text: text,
        spacing: { before: 0, after: 100 },
        run: {
          font: fontFamily,
          size: fontSize,
          ...options
        }
      });
    };

    // --- HEADER ---
    const headerParagraphs = [];

    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      headerParagraphs.push(
        new Paragraph({
          text: fullName,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          run: {
            font: fontFamily,
            size: 36, // 18pt
            bold: true
          }
        })
      );
    }

    if (sections.title) {
      headerParagraphs.push(
        new Paragraph({
          text: sections.title,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          run: {
            font: fontFamily,
            size: 28, // 14pt
            bold: true
          }
        })
      );
    }

    // Contact Info
    const contactParts = [
      sections.email,
      sections.phone,
      sections.location
    ].filter(Boolean);

    if (contactParts.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          text: contactParts.join(' | '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          run: {
            font: fontFamily,
            size: 20 // 10pt
          }
        })
      );
    }

    docSections.push(...headerParagraphs);

    // --- SECTIONS ---

    // SUMMARY
    if (sections.summary) {
      docSections.push(createSectionHeader('Summary'));
      docSections.push(createParagraph(sections.summary));
    }

    // EXPERIENCE
    if (sections.experience?.length > 0) {
      docSections.push(createSectionHeader('Experience'));

      for (const job of sections.experience) {
        const company = job.company || '';
        const title = job.title || '';
        const header = [title, company].filter(Boolean).join(' at ');

        docSections.push(createParagraph(header, { bold: true }));

        const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ') || job.date;
        const location = job.location;
        const meta = [dateRange, location].filter(Boolean).join(' | ');

        if (meta) {
          docSections.push(createParagraph(meta, { size: 20 }));
        }

        if (job.description) {
          docSections.push(createParagraph(job.description));
        }

        if (job.achievements?.length > 0) {
          for (const ach of job.achievements) {
            docSections.push(createParagraph(`• ${ach}`, { indent: { left: 360 } })); // 0.25 inch indent
          }
        }
      }
    }

    // EDUCATION
    if (sections.education?.length > 0) {
      docSections.push(createSectionHeader('Education'));
      for (const edu of sections.education) {
        const school = edu.school || '';
        docSections.push(createParagraph(school, { bold: true }));

        const degree = [edu.degree, edu.field].filter(Boolean).join(', ');
        if (degree) {
          docSections.push(createParagraph(degree));
        }

        const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ') || edu.year;
        if (dateRange) {
          docSections.push(createParagraph(dateRange, { size: 20 }));
        }
      }
    }

    // SKILLS
    const skills = sections.skills;
    if (skills) {
      docSections.push(createSectionHeader('Skills'));
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
        docSections.push(createParagraph(skillText));
      }
    }

    // PROJECTS
    if (sections.projects?.length > 0) {
      docSections.push(createSectionHeader('Projects'));
      for (const proj of sections.projects) {
        docSections.push(createParagraph(proj.name, { bold: true }));
        if (proj.description) {
          docSections.push(createParagraph(proj.description));
        }
        if (proj.url) {
          docSections.push(createParagraph(proj.url, { size: 20 }));
        }
      }
    }

    // CERTIFICATIONS
    if (sections.certifications?.length > 0) {
      docSections.push(createSectionHeader('Certifications'));
      for (const cert of sections.certifications) {
        const text = cert.name + (cert.issuer ? ` - ${cert.issuer}` : '') + (cert.date ? ` (${cert.date})` : '');
        docSections.push(createParagraph(text));
      }
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    return buffer;
  }
}