/**
 * ListResumesUseCase
 *
 * Orchestrates listing user resumes.
 * Per technical_design.md §3.2B: "Use Cases are stateless orchestrators."
 */
export class ListResumesUseCase {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  /**
   * Execute the list operation
   * @returns {Promise<Array>} - Array of resume summaries
   */
  async execute() {
    return await this.resumeRepository.list();
  }
}