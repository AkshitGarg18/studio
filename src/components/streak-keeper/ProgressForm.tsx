'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  progress: z.coerce.number().min(0.1, 'Progress must be at least 0.1 hours.').max(24, 'You cannot study more than 24 hours in a day.'),
  activity: z.string().min(3, 'Describe your activity in at least 3 characters.').max(150, 'Description is too long.'),
});

type ProgressFormProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
};

export function ProgressForm({ onSubmit }: ProgressFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      progress: 1,
      activity: '',
    },
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    form.reset({ ...form.getValues(), activity: '' });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Progress</CardTitle>
        <CardDescription>What did you learn today? Keep the fire burning!</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Studied</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Today's Activity</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., I completed a project on..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Briefly describe your learning activity.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              <PlusCircle />
              Add to Streak
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
