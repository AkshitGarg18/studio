'use server';

/**
 * @fileOverview An AI agent that provides a motivational quote of the day.
 *
 * - getMotivationOfTheDay - A function that returns a motivational quote.
 * - MotivationOfTheDayOutput - The return type for the getMotivationOfTheDay function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MotivationOfTheDayOutputSchema = z.object({
  quote: z.string().describe('The motivational quote.'),
  author: z.string().describe('The author of the quote. If unknown, should be "Anonymous".'),
});
export type MotivationOfTheDayOutput = z.infer<typeof MotivationOfTheDayOutputSchema>;

export async function getMotivationOfTheDay(): Promise<MotivationOfTheDayOutput> {
  return motivationOfTheDayFlow();
}

const motivationPrompt = ai.definePrompt({
  name: 'motivationOfTheDayPrompt',
  output: { schema: MotivationOfTheDayOutputSchema },
  prompt: `You are an AI assistant that provides daily motivation.
  Generate a random, inspiring motivational quote. The quote should be suitable for someone learning new skills or trying to maintain a study streak.
  Also provide the author of the quote. If the author is unknown, use "Anonymous".

  Example Output:
  {
    "quote": "The secret of getting ahead is getting started.",
    "author": "Mark Twain"
  }`,
});

const motivationOfTheDayFlow = ai.defineFlow(
  {
    name: 'motivationOfTheDayFlow',
    outputSchema: MotivationOfTheDayOutputSchema,
  },
  async () => {
    const { output } = await motivationPrompt();
    return output!;
  }
);
