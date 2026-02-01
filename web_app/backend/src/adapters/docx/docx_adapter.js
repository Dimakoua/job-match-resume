import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

export class DocxAdapter {
  /**
   * Generates a DOCX buffer from resume data
   * @param {Resume} resume - The resume entity to convert to DOCX
   * @returns {Promise<Uint8Array>} - DOCX buffer as Uint8Array
   */
  async generateBuffer(resume) {
    if (!resume || typeof resume !== 'object') {
      throw new Error('Resume data is required');
    }
    if (!resume.sections || typeof resume.sections !== 'object') {
      throw new Error('Resume must have sections object');
    }

    const sections = resume.sections;
    const docSections = [];

    // Add header with personal info
    if (sections.firstName || sections.lastName) {
      const fullName = `${sections.firstName || ''} ${sections.lastName || ''}`.trim();
      docSections.push(
        new Paragraph({
          text: fullName,
          heading: HeadingLevel.TITLE,
        })
      );
    }

    // Add contact info
    if (sections.email || sections.phone || sections.location) {
      const contactInfo = [sections.email, sections.phone, sections.location].filter(Boolean).join(' • ');
      docSections.push(new Paragraph(contactInfo));
    }

    docSections.push(new Paragraph('')); // Spacing

    // Add summary
    if (sections.summary) {
      docSections.push(
        new Paragraph({
          text: 'Professional Summary',
          heading: HeadingLevel.HEADING_2,
        })
      );
      docSections.push(new Paragraph(sections.summary));
      docSections.push(new Paragraph('')); // Spacing
    }

    // Add experience
    if (sections.experience && Array.isArray(sections.experience) && sections.experience.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Work Experience',
          heading: HeadingLevel.HEADING_2,
        })
      );
      for (const job of sections.experience) {
        if (job.title || job.position || job.company) {
          const title = job.title || job.position || '';
          docSections.push(new Paragraph({
            children: [
              new TextRun({ text: `${title} at ${job.company || ''}`, bold: true }),
            ],
          }));
        }
        if (job.startDate || job.endDate) {
          const dateRange = [job.startDate, job.endDate].filter(Boolean).join(' - ');
          docSections.push(new Paragraph(dateRange));
        } else if (job.duration || job.date) {
          docSections.push(new Paragraph(job.duration || job.date || ''));
        }
        if (job.location) {
          docSections.push(new Paragraph(job.location));
        }
        if (job.description) {
          docSections.push(new Paragraph(job.description));
        } else if (job.achievements && Array.isArray(job.achievements)) {
          for (const achievement of job.achievements) {
            docSections.push(new Paragraph(`• ${achievement}`));
          }
        }
        docSections.push(new Paragraph('')); // Spacing
      }
    }

    // Add education
    if (sections.education && Array.isArray(sections.education) && sections.education.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Education',
          heading: HeadingLevel.HEADING_2,
        })
      );
      for (const edu of sections.education) {
        if (edu.degree || edu.school || edu.university) {
          const school = edu.school || edu.university || '';
          const degreeText = [edu.degree, edu.field].filter(Boolean).join(', ');
          docSections.push(new Paragraph({
            children: [
              new TextRun({ text: `${degreeText} from ${school}`, bold: true }),
            ],
          }));
        }
        if (edu.startDate || edu.endDate) {
          const dateRange = [edu.startDate, edu.endDate].filter(Boolean).join(' - ');
          docSections.push(new Paragraph(dateRange));
        } else if (edu.years) {
          docSections.push(new Paragraph(edu.years));
        }
        docSections.push(new Paragraph('')); // Spacing
      }
    }

    // Add certifications
    if (sections.certifications && Array.isArray(sections.certifications) && sections.certifications.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Certifications',
          heading: HeadingLevel.HEADING_2,
        })
      );
      for (const cert of sections.certifications) {
        if (cert.name) {
          let certText = cert.name;
          if (cert.issuer) certText += ` • ${cert.issuer}`;
          if (cert.date) certText += ` • ${cert.date}`;
          docSections.push(new Paragraph(certText));
        }
      }
      docSections.push(new Paragraph('')); // Spacing
    }

    // Add projects
    if (sections.projects && Array.isArray(sections.projects) && sections.projects.length > 0) {
      docSections.push(
        new Paragraph({
          text: 'Projects',
          heading: HeadingLevel.HEADING_2,
        })
      );
      for (const project of sections.projects) {
        if (project.name) {
          docSections.push(new Paragraph({
            children: [
              new TextRun({ text: project.name, bold: true }),
            ],
          }));
        }
        if (project.description) {
          docSections.push(new Paragraph(project.description));
        }
        docSections.push(new Paragraph('')); // Spacing
      }
    }

    // Add skills
    if (sections.skills && (Array.isArray(sections.skills) || typeof sections.skills === 'object')) {
      docSections.push(
        new Paragraph({
          text: 'Skills',
          heading: HeadingLevel.HEADING_2,
        })
      );
      if (Array.isArray(sections.skills)) {
        docSections.push(new Paragraph(sections.skills.join(', ')));
      } else if (sections.skills.technical) {
        const skillText = Array.isArray(sections.skills.technical)
          ? sections.skills.technical.join(', ')
          : sections.skills.technical;
        docSections.push(new Paragraph(`Technical: ${skillText}`));
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: docSections,
      }],
    });

    // Serialize the DOCX to bytes
    const buffer = await Packer.toBuffer(doc);
    return new Uint8Array(buffer);
  }
}