'use server';

/**
 * @fileOverview An AI agent that generates a weekly performance review for a user.
 *
 * - getWeeklyPerformanceReview - A function that returns a detailed weekly report and suggestions.
 * - WeeklyPerformanceReviewInput - The input type for the getWeeklyPerformanceReview function.
 * - WeeklyPerformanceReviewOutput - The return type for the getWeeklyPerformanceReview function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ProgressEntrySchema = z.object({
    date: z.string(),
    progress: z.number(),
    activity: z.string(),
    subject: z.string(),
});

const WeeklyPerformanceReviewInputSchema = z.object({
  previousWeekProgress: z.array(ProgressEntrySchema).describe("The user's progress entries for the previous week."),
  currentWeekProgress: z.array(ProgressEntrySchema).describe("The user's progress entries for the current week."),
});
export type WeeklyPerformanceReviewInput = z.infer<typeof WeeklyPerformanceReviewInputSchema>;

const WeeklyPerformanceReviewOutputSchema = z.object({
  reportSummary: z.string().describe('A markdown-formatted summary of the weekly performance, including total hours, comparison to the previous week, and subject breakdown.'),
  nextWeekSuggestions: z.array(z.string()).describe('A list of actionable suggestions for the next week to improve or maintain performance.'),
});
export type WeeklyPerformanceReviewOutput = z.infer<typeof WeeklyPerformanceReviewOutputSchema>;

export async function getWeeklyPerformanceReview(input: WeeklyPerformanceReviewInput): Promise<WeeklyPerformanceReviewOutput> {
  return weeklyPerformanceReviewFlow(input);
}

const reviewPrompt = ai.definePrompt({
  name: 'weeklyPerformanceReviewPrompt',
  input: { schema: WeeklyPerformanceReviewInputSchema },
  output: { schema: WeeklyPerformanceReviewOutputSchema },
  prompt: `You are an AI coach that provides weekly performance reviews for students.
  Your task is to analyze the provided progress data for the current and previous weeks and generate a comprehensive report.

  The report should include:
  1. A summary of the current week's performance: total hours, and a list of subjects studied.
  2. A comparison to the previous week's performance.
  3. A list of 3-4 actionable and encouraging suggestions for the next week based on the analysis.

  Format the summary in markdown.

  Current Week Progress:
  {{#each currentWeekProgress}}
  - {{date}}: {{progress}} hrs on {{subject}} ({{activity}})
  {{/each}}

  Previous Week Progress:
  {{#each previousWeekProgress}}
  - {{date}}: {{progress}} hrs on {{subject}} ({{activity}})
  {{/each}}

  Generate a report and suggestions based on this data.
  Example output:
  {
    "reportSummary": "### Weekly Report\\n**Total Hours**: 25\\n**Comparison**: Great job! You've increased your study time by 5 hours from last week.\\n**Subjects**: React, Next.js, Algorithms.",
    "nextWeekSuggestions": [
      "You've built a strong momentum in React. Try starting a new mini-project to apply what you've learned.",
      "To diversify your learning, consider dedicating a session to CSS fundamentals.",
      "Plan your study sessions at the beginning of the week to ensure you hit your goals."
    ]
  }
  `,
});

const weeklyPerformanceReviewFlow = ai.defineFlow(
  {
    name: 'weeklyPerformanceReviewFlow',
    inputSchema: WeeklyPerformanceReviewInputSchema,
    outputSchema: WeeklyPerformanceReviewOutputSchema,
  },
  async (input) => {
    const { output } = await reviewPrompt(input);
    return output!;
  }
);
