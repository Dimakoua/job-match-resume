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
    if (!resume.sections || !Array.isArray(resume.sections)) {
      throw new Error('Resume must have sections array');
    }

    const docSections = [];

    // Add title
    docSections.push(
      new Paragraph({
        text: resume.title,
        heading: HeadingLevel.TITLE,
      })
    );

    // Process each section
    for (const section of resume.sections) {
      if (!section.type || !section.data) continue;

      // Add section header
      const sectionTitle = this._formatSectionTitle(section.type);
      docSections.push(
        new Paragraph({
          text: sectionTitle,
          heading: HeadingLevel.HEADING_2,
        })
      );

      // Add section content based on type
      const contentParagraphs = this._addSectionContent(section);
      docSections.push(...contentParagraphs);
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

  _formatSectionTitle(type) {
    return type.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  _addSectionContent(section) {
    const { type, data } = section;
    const paragraphs = [];

    switch (type) {
      case 'personal_info':
      case 'contact':
        if (data.name) paragraphs.push(new Paragraph(`Name: ${data.name}`));
        if (data.email) paragraphs.push(new Paragraph(`Email: ${data.email}`));
        if (data.phone) paragraphs.push(new Paragraph(`Phone: ${data.phone}`));
        if (data.location || data.address) paragraphs.push(new Paragraph(`Location: ${data.location || data.address}`));
        break;

      case 'summary':
      case 'professional_summary':
        if (data.text) paragraphs.push(new Paragraph(data.text));
        break;

      case 'experience':
      case 'work_experience':
        if (Array.isArray(data)) {
          for (const exp of data) {
            if (exp.position && exp.company) {
              paragraphs.push(new Paragraph({
                children: [
                  new TextRun({ text: exp.position, bold: true }),
                  new TextRun(` at ${exp.company}`),
                ],
              }));
            }
            if (exp.startDate && exp.endDate) {
              paragraphs.push(new Paragraph(`${exp.startDate} - ${exp.endDate}`));
            }
            if (exp.description) {
              paragraphs.push(new Paragraph(exp.description));
            }
            paragraphs.push(new Paragraph('')); // Empty line
          }
        } else {
          // Single experience object
          if (data.position && data.company) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({ text: data.position, bold: true }),
                new TextRun(` at ${data.company}`),
              ],
            }));
          }
          if (data.startDate && data.endDate) {
            paragraphs.push(new Paragraph(`${data.startDate} - ${data.endDate}`));
          }
          if (data.description) {
            paragraphs.push(new Paragraph(data.description));
          }
        }
        break;

      case 'education':
        if (Array.isArray(data)) {
          for (const edu of data) {
            if (edu.degree && edu.institution) {
              paragraphs.push(new Paragraph({
                children: [
                  new TextRun({ text: edu.degree, bold: true }),
                  new TextRun(` from ${edu.institution}`),
                ],
              }));
            }
            if (edu.graduationDate) {
              paragraphs.push(new Paragraph(`Graduated: ${edu.graduationDate}`));
            }
            paragraphs.push(new Paragraph('')); // Empty line
          }
        } else {
          if (data.degree && data.institution) {
            paragraphs.push(new Paragraph({
              children: [
                new TextRun({ text: data.degree, bold: true }),
                new TextRun(` from ${data.institution}`),
              ],
            }));
          }
          if (data.graduationDate) {
            paragraphs.push(new Paragraph(`Graduated: ${data.graduationDate}`));
          }
        }
        break;

      case 'skills':
        if (data.skills && Array.isArray(data.skills)) {
          paragraphs.push(new Paragraph(data.skills.join(', ')));
        }
        break;

      default:
        // Generic handling for unknown section types
        const content = JSON.stringify(data, null, 2);
        paragraphs.push(new Paragraph(content));
    }

    return paragraphs;
  }
}