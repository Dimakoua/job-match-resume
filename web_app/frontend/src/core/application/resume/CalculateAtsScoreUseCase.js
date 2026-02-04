/**
 * CalculateAtsScoreUseCase
 *
 * Use case for calculating ATS score between resume text and job description.
 * Per technical_design.md §3.2A: "Use Cases are pure business logic orchestrators."
 */
export class CalculateAtsScoreUseCase {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  async execute({ resumeText, jobDescription }) {
    if (!resumeText || !jobDescription) {
      throw new Error('Resume text and job description are required');
    }

    return await this.resumeRepository.calculateAtsScore(resumeText, jobDescription);
  }
}