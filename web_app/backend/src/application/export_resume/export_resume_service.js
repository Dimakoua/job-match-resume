export class ExportResumeService {
  constructor(resumeRepository, pdfAdapter, docxAdapter) {
    this.resumeRepository = resumeRepository;
    this.pdfAdapter = pdfAdapter;
    this.docxAdapter = docxAdapter;
  }

  async execute(command) {
    // Validate command
    if (!command.resumeId) {
      throw new Error('resumeId is required');
    }
    if (!command.userId) {
      throw new Error('userId is required');
    }
    if (!command.format || !['pdf', 'docx'].includes(command.format)) {
      throw new Error('format must be either "pdf" or "docx"');
    }

    // Find the resume
    const resume = await this.resumeRepository.findById(command.resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // Verify ownership
    if (resume.userId !== command.userId) {
      throw new Error('Access denied: resume does not belong to user');
    }

    const resumeForExport = this._applyVisibleSections(resume);

    // Generate the file based on format
    let buffer;
    if (command.format === 'pdf') {
      buffer = await this.pdfAdapter.generateBuffer(resumeForExport);
    } else if (command.format === 'docx') {
      buffer = await this.docxAdapter.generateBuffer(resumeForExport);
    }

    return {
      buffer,
      format: command.format,
      filename: this._generateFilename(resume, command.format)
    };
  }

  _applyVisibleSections(resume) {
    const sections = resume?.sections;
    if (!sections || typeof sections !== 'object' || Array.isArray(sections)) {
      return resume;
    }

    const visibleSections = Array.isArray(sections.visibleSections)
      ? sections.visibleSections
      : [];

    if (visibleSections.length === 0) {
      return resume;
    }

    const isVisible = (sectionId) => {
      const sectionConfig = visibleSections.find((section) => section?.id === sectionId);
      return sectionConfig ? sectionConfig.visible !== false : true;
    };

    const filteredSections = { ...sections };

    if (!isVisible('personal')) {
      const personalFields = [
        'firstName',
        'lastName',
        'title',
        'email',
        'phone',
        'location',
        'linkedin'
      ];

      for (const field of personalFields) {
        delete filteredSections[field];
      }
    }

    const sectionFieldMap = {
      summary: 'summary',
      experience: 'experience',
      education: 'education',
      skills: 'skills',
      projects: 'projects',
      certifications: 'certifications'
    };

    for (const [sectionId, fieldName] of Object.entries(sectionFieldMap)) {
      if (!isVisible(sectionId)) {
        delete filteredSections[fieldName];
      }
    }

    if (filteredSections.customSections && typeof filteredSections.customSections === 'object') {
      const filteredCustomSections = { ...filteredSections.customSections };

      for (const customSectionId of Object.keys(filteredCustomSections)) {
        if (!isVisible(customSectionId)) {
          delete filteredCustomSections[customSectionId];
        }
      }

      filteredSections.customSections = filteredCustomSections;
    }

    return {
      ...resume,
      sections: filteredSections
    };
  }

  _generateFilename(resume, format) {
    // Sanitize title for filename (remove special characters, limit length)
    const sanitizedTitle = resume.title
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 50); // Limit length

    return `${sanitizedTitle}.${format}`;
  }
}