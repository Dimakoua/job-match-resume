/**
 * useAtsScore
 *
 * Composable for calculating and managing ATS score for a job application.
 * Returns reactive atsScore that updates asynchronously on mount.
 */
import { ref, onMounted } from 'vue';
import { HttpResumeRepository } from '../../infrastructure/api/HttpResumeRepository.js';
import { CalculateAtsScoreUseCase } from '../../core/application/resume/CalculateAtsScoreUseCase.js';

export function useAtsScore(application) {
  const atsScore = ref(null);

  const resumeRepository = new HttpResumeRepository();
  const calculateAtsUseCase = new CalculateAtsScoreUseCase(resumeRepository);

  onMounted(async () => {
    if (application.resumeId && application.jobDescription) {
      try {
        const resume = await resumeRepository.get(application.resumeId);
        const resumeText = resume.sections.map(section => section.content || '').join(' ');
        const result = await calculateAtsUseCase.execute({
          resumeText,
          jobDescription: application.jobDescription
        });
        atsScore.value = result.score;
      } catch (err) {
        console.error('Error calculating ATS score:', err);
        atsScore.value = null;
      }
    }
  });

  return { atsScore };
}