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

    // Generate the file based on format
    let buffer;
    if (command.format === 'pdf') {
      buffer = await this.pdfAdapter.generateBuffer(resume);
    } else if (command.format === 'docx') {
      buffer = await this.docxAdapter.generateBuffer(resume);
    }

    return {
      buffer,
      format: command.format,
      filename: this._generateFilename(resume, command.format)
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