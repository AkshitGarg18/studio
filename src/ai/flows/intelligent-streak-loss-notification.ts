'use server';

/**
 * @fileOverview An AI agent that sends personalized streak loss notifications to students.
 *
 * - intelligentStreakLossNotification - A function that sends a tailored notification to the student at risk of losing streak.
 * - NotificationInput - The input type for the intelligentStreakLossNotification function.
 * - NotificationOutput - The return type for the intelligentStreakLossNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NotificationInputSchema = z.object({
  studentId: z.string().describe('The unique identifier of the student.'),
  streakLength: z.number().describe('The current streak length of the student.'),
  lastActivity: z.string().describe('The date of the student\'s last activity (YYYY-MM-DD).'),
  notificationHistory: z
    .array(z.object({
      timestamp: z.string(),
      message: z.string(),
      response: z.string().optional(),
    }))
    .describe('A history of previous notifications and student responses.'),
});
export type NotificationInput = z.infer<typeof NotificationInputSchema>;

const NotificationOutputSchema = z.object({
  notificationMessage: z.string().describe('The personalized notification message to send to the student.'),
  deliveryMethod: z.enum(['email', 'push', 'sms']).describe('The optimal delivery method for the notification.'),
  scheduledTime: z.string().describe('The optimal time to send the notification (ISO 8601 format).'),
});
export type NotificationOutput = z.infer<typeof NotificationOutputSchema>;

export async function intelligentStreakLossNotification(input: NotificationInput): Promise<NotificationOutput> {
  return intelligentStreakLossNotificationFlow(input);
}

const notificationPrompt = ai.definePrompt({
  name: 'notificationPrompt',
  input: {schema: NotificationInputSchema},
  output: {schema: NotificationOutputSchema},
  prompt: `You are an AI assistant designed to help students maintain their learning streaks.
  A student is at risk of losing their streak. Your task is to craft a personalized notification message to encourage them to continue learning.
  Consider the student's past activity, current streak length, and their responses to previous notifications when creating the message.
  Choose the most appropriate delivery method (email, push, or sms) and an optimal time to send the notification, aiming to maximize the likelihood of a positive response.

  Student ID: {{{studentId}}}
  Current Streak Length: {{{streakLength}}} days
  Last Activity Date: {{{lastActivity}}}
  Notification History:
  {{#each notificationHistory}}
  - Timestamp: {{{timestamp}}}, Message: {{{message}}}, Response: {{{response}}}
  {{/each}}

  Based on this information, generate a personalized notification message, choose a delivery method, and schedule a delivery time.
  Ensure that the scheduled time is in ISO 8601 format.
  Keep the notification concise and actionable, focusing on encouraging the student to maintain their streak.
  Example of a good notification message: "Hey there! Your streak is at risk. Complete your daily goal to keep it going!"
  Delivery methods include email, push or sms. Use the one you think is most likely to get a positive response.
  Schedule the notification at time that is likely to get a positive response, based on notification history and student activity.

  {
    "notificationMessage": "[Your personalized notification message here]",
    "deliveryMethod": "[email, push, or sms]",
    "scheduledTime": "[The optimal time to send the notification (ISO 8601 format)]"
  }`,
});

const intelligentStreakLossNotificationFlow = ai.defineFlow(
  {
    name: 'intelligentStreakLossNotificationFlow',
    inputSchema: NotificationInputSchema,
    outputSchema: NotificationOutputSchema,
  },
  async input => {
    const {output} = await notificationPrompt(input);
    return output!;
  }
);
