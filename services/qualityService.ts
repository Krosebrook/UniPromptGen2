import { QUALITY_SCORE_WEIGHTS } from '../constants.ts';
import type { PromptTemplate, PromptTemplateMetrics, ExecutionEvent } from '../types.ts';

/**
 * Calculates the overall QualityScore based on a template's metrics.
 * @param metrics - The aggregated metrics for a prompt template.
 * @returns The calculated quality score (0-100).
 */
export const calculateQualityScore = (metrics: PromptTemplateMetrics): number => {
  const { USER_RATING, TASK_SUCCESS_RATE, EFFICIENCY_SCORE, AUTO_GATE_SCORE } = QUALITY_SCORE_WEIGHTS;

  // Normalize user rating from 1-5 scale to 0-1 scale for calculation.
  const normalizedUserRating = (metrics.avgUserRating - 1) / 4;

  const userRatingComponent = normalizedUserRating * USER_RATING;
  const successRateComponent = metrics.taskSuccessRate * TASK_SUCCESS_RATE;
  const efficiencyComponent = metrics.efficiencyScore * EFFICIENCY_SCORE;
  const autoGateComponent = 1.0 * AUTO_GATE_SCORE; // Mocked: assume auto-gates always pass for now

  const totalScore = (userRatingComponent + successRateComponent + efficiencyComponent + autoGateComponent) * 100;

  return Math.max(0, Math.min(100, totalScore));
};

/**
 * Ingests a new execution event and updates the template's metrics and quality score.
 * This simulates the asynchronous QualityMetric Service.
 * @param template - The original prompt template.
 * @param event - The new execution event to process.
 * @returns The updated prompt template with new metrics and score.
 */
export const ingestExecutionEvent = (template: PromptTemplate, event: ExecutionEvent): PromptTemplate => {
  const oldMetrics = template.metrics;
  const newMetrics: PromptTemplateMetrics = { ...oldMetrics };

  // 1. Update aggregated raw data
  newMetrics.totalRuns += 1;
  if (event.success) {
    newMetrics.successfulRuns += 1;
  }
  newMetrics.totalUserRating += event.userRating;

  // 2. Recalculate derived metrics
  newMetrics.avgUserRating = newMetrics.totalUserRating / newMetrics.totalRuns;
  newMetrics.taskSuccessRate = newMetrics.successfulRuns / newMetrics.totalRuns;

  // Mock efficiency score update (in a real system, this would analyze latency/cost trends)
  newMetrics.efficiencyScore = Math.min(0.95, newMetrics.efficiencyScore * 1.001); // Slightly improve efficiency over time

  // 3. Create the updated template
  const updatedTemplate = {
    ...template,
    metrics: newMetrics,
    // 4. Recalculate the final QualityScore
    qualityScore: calculateQualityScore(newMetrics),
  };

  return updatedTemplate;
};
