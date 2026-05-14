'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  phone: z.string().min(9, { message: 'Please enter a valid phone number.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
  type: z.enum(['COMPLAINT', 'FOLLOW_UP'], { required_error: 'Please select a type.' }),
});

export function ContactForm() {
  const params = useParams();
  const city = params.city as string;
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      message: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('/api/engage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, city }),
      });

      if (!response.ok) {
        throw new Error('Something went wrong');
      }

      form.reset();
      toast({ title: 'Message sent!', description: 'Our local team will get back to you shortly.' });
    } catch (error) {
      toast({ title: 'Error sending message.', description: 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Reason for Contact</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20">
                    <SelectValue placeholder="How can we help you?" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FOLLOW_UP">Request an Artisan</SelectItem>
                  <SelectItem value="COMPLAINT">Report an Issue</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. John Doe" {...field} className="h-12 rounded-xl border-muted-foreground/20" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. 024 123 4567" {...field} className="h-12 rounded-xl border-muted-foreground/20" />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Please provide details about your request..." {...field} rows={6} className="rounded-xl border-muted-foreground/20 resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg shadow-xl shadow-primary/20" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
          {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </Form>
  );
}
