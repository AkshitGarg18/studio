'use server';

/**
 * @fileOverview An AI agent that provides tips to improve user performance.
 *
 * - getPerformanceTips - A function that returns personalized tips to match or beat previous week's performance.
 * - PerformanceTipsInput - The input type for the getPerformanceTips function.
 * - PerformanceTipsOutput - The return type for the getPerformanceTips function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PerformanceTipsInputSchema = z.object({
  currentWeekProgress: z.number().describe("The user's total progress for the current week in hours."),
  previousWeekProgress: z.number().describe("The user's total progress for the previous week in hours."),
  recentActivities: z.array(z.object({
    subject: z.string(),
    activity: z.string(),
  })).describe('A list of recent learning activities.'),
});
export type PerformanceTipsInput = z.infer<typeof PerformanceTipsInputSchema>;

const PerformanceTipsOutputSchema = z.object({
  tips: z.array(z.string()).describe('A list of personalized, actionable tips for the user to improve their performance.'),
});
export type PerformanceTipsOutput = z.infer<typeof PerformanceTipsOutputSchema>;

export async function getPerformanceTips(input: PerformanceTipsInput): Promise<PerformanceTipsOutput> {
  return performanceTipsFlow(input);
}

const tipsPrompt = ai.definePrompt({
  name: 'performanceTipsPrompt',
  input: { schema: PerformanceTipsInputSchema },
  output: { schema: PerformanceTipsOutputSchema },
  prompt: `You are a motivational AI coach. A user wants to improve their study performance to match or beat their previous week.

  Current situation:
  - Previous Week's Hours: {{{previousWeekProgress}}}
  - Current Week's Hours so far: {{{currentWeekProgress}}}

  Their recent activities include:
  {{#each recentActivities}}
  - Subject: {{{subject}}}, Activity: {{{activity}}}
  {{/each}}

  Based on this, provide 3-4 short, actionable, and encouraging tips to help them close the gap. The advice should be specific and reference their recent activities if possible. Frame the advice positively.

  Example Output:
  {
    "tips": [
      "You're doing great with React! Try building a small project this weekend to solidify your skills and add a few more hours.",
      "Consider breaking up your study sessions into smaller, 30-minute chunks to stay focused and energized.",
      "You haven't studied Algorithms recently. A quick review session could be a great way to add an extra hour."
    ]
  }`,
});

const performanceTipsFlow = ai.defineFlow(
  {
    name: 'performanceTipsFlow',
    inputSchema: PerformanceTipsInputSchema,
    outputSchema: PerformanceTipsOutputSchema,
  },
  async (input) => {
    const { output } = await tipsPrompt(input);
    return output!;
  }
);
