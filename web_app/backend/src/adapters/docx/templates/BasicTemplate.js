import { BorderStyle, Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { buildBasicTemplateModel } from '../../../../../shared/templates/basicTemplateModel.js';

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
    const model = buildBasicTemplateModel(resume);

    const fontFamily = 'Arial';
    const fontSize = 24; // 12pt in half-points

    const docSections = [];

    // Helper for Section Headers
    const createSectionHeader = (text) => {
      return new Paragraph({
        children: [
          new TextRun({
            text: text.toUpperCase(),
            font: fontFamily,
            size: fontSize,
            bold: true,
            color: '000000'
          })
        ],
        spacing: { before: 200, after: 120 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        },
        alignment: AlignmentType.LEFT,
      });
    };

    // Helper for regular text
    const createParagraph = (text, options = {}) => {
      return new Paragraph({
        children: [
          new TextRun({
            text,
            font: fontFamily,
            size: fontSize,
            color: '000000',
            ...options
          })
        ],
        spacing: { before: 0, after: 100 },
        alignment: AlignmentType.LEFT,
      });
    };

    // --- HEADER ---
    const headerParagraphs = [];

    if (model.header.fullName) {
      headerParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: model.header.fullName,
              font: fontFamily,
              size: 36,
              bold: true,
              color: '000000'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }

    if (model.header.title) {
      headerParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: model.header.title,
              font: fontFamily,
              size: 28,
              bold: true,
              color: '000000'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    if (model.header.contactLine) {
      headerParagraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: model.header.contactLine,
              font: fontFamily,
              size: 20,
              color: '000000'
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        })
      );
    }

    docSections.push(...headerParagraphs);

    // --- SECTIONS ---

    // SUMMARY
    if (model.summary) {
      docSections.push(createSectionHeader('Summary'));
      docSections.push(createParagraph(model.summary));
    }

    // EXPERIENCE
    if (model.experience.length > 0) {
      docSections.push(createSectionHeader('Experience'));

      for (const job of model.experience) {
        if (job.company) {
          docSections.push(createParagraph(job.company, { bold: true }));
        }

        if (job.title) {
          docSections.push(createParagraph(job.title));
        }

        const meta = [job.dateLine, job.location].filter(Boolean).join(' | ');

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
    if (model.education.length > 0) {
      docSections.push(createSectionHeader('Education'));
      for (const edu of model.education) {
        const school = edu.school || '';
        docSections.push(createParagraph(school, { bold: true }));

        if (edu.degreeLine) {
          docSections.push(createParagraph(edu.degreeLine));
        }

        if (edu.dateLine) {
          docSections.push(createParagraph(edu.dateLine, { size: 20 }));
        }
      }
    }

    // SKILLS
    if (model.skills.text) {
      docSections.push(createSectionHeader('Skills'));
      docSections.push(createParagraph(model.skills.text));
    }

    // PROJECTS
    if (model.projects.length > 0) {
      docSections.push(createSectionHeader('Projects'));
      for (const proj of model.projects) {
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
    if (model.certifications.length > 0) {
      docSections.push(createSectionHeader('Certifications'));
      for (const cert of model.certifications) {
        docSections.push(createParagraph(cert.textLine));
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