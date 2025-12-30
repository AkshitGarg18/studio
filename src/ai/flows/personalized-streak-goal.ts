'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a personalized streak goal to a student based on their historical progress data.
 *
 * - personalizedStreakGoal - An async function that suggests a personalized streak goal.
 * - PersonalizedStreakGoalInput - The input type for the personalizedStreakGoal function.
 * - PersonalizedStreakGoalOutput - The output type for the personalizedStreakGoal function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedStreakGoalInputSchema = z.object({
  studentId: z.string().describe('The unique identifier of the student.'),
  historicalProgressData: z.array(z.object({
    date: z.string().describe('The date of the progress entry (YYYY-MM-DD).'),
    progress: z.number().describe('The amount of progress made on that date.'),
  })).describe('An array of historical progress data for the student.'),
});
export type PersonalizedStreakGoalInput = z.infer<typeof PersonalizedStreakGoalInputSchema>;

const PersonalizedStreakGoalOutputSchema = z.object({
  suggestedStreakGoal: z.number().describe('The suggested streak goal for the student.'),
  reasoning: z.string().describe('The reasoning behind the suggested streak goal.'),
});
export type PersonalizedStreakGoalOutput = z.infer<typeof PersonalizedStreakGoalOutputSchema>;

export async function personalizedStreakGoal(input: PersonalizedStreakGoalInput): Promise<PersonalizedStreakGoalOutput> {
  return personalizedStreakGoalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedStreakGoalPrompt',
  input: {schema: PersonalizedStreakGoalInputSchema},
  output: {schema: PersonalizedStreakGoalOutputSchema},
  prompt: `You are an AI assistant designed to help students achieve their learning goals by suggesting personalized streak goals.

  Analyze the student's historical progress data to understand their typical progress rate and consistency.
  Consider factors such as the average progress per day, the variability in progress, and any trends over time.

  Based on this analysis, suggest a streak goal that is challenging but achievable for the student.
  Explain your reasoning for suggesting this particular streak goal.

  Student ID: {{{studentId}}}
  Historical Progress Data:
  {{#each historicalProgressData}}
  - Date: {{{date}}}, Progress: {{{progress}}}
  {{/each}}

  Suggested Streak Goal:`,
});

const personalizedStreakGoalFlow = ai.defineFlow(
  {
    name: 'personalizedStreakGoalFlow',
    inputSchema: PersonalizedStreakGoalInputSchema,
    outputSchema: PersonalizedStreakGoalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
