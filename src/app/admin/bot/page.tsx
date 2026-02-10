'use client';

import { useState, useTransition } from 'react';
import { MessageSquare, Zap, Clock, ShieldCheck, Send, Loader2, Bot, User, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { simulateIncomingMessage } from './actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function WhatsAppBotPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [testMessage, setMessage] = useState('');
  const [testPhone, setPhone] = useState('0241234567');

  // Real-time logs
  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'whatsapp_events'), orderBy('createdAt', 'desc'), limit(20));
  }, []);
  const { data: events, isLoading: logsLoading } = useCollection(eventsQuery);

  async function handleSimulate() {
    if (!testMessage) return;
    
    startTransition(async () => {
      // 1. Get AI result from Server Action
      const res = await simulateIncomingMessage(testMessage);
      
      if (res.success && res.aiResult) {
        const aiResult = res.aiResult;
        
        // 2. Log events to Firestore using Client SDK for session reliability
        const eventsRef = collection(db, 'whatsapp_events');
        
        const customerEvent = {
          phone: testPhone,
          message: testMessage,
          role: 'customer',
          event: 'JOB_REQUEST',
          aiParsed: {
            category: aiResult.category,
            area: aiResult.area,
            confidence: aiResult.confidence,
          },
          createdAt: serverTimestamp(),
        };

        try {
          // CRITICAL: Non-blocking mutation with contextual error emission
          addDoc(eventsRef, customerEvent)
            .then((docRef) => {
              // Log the bot's response
              const botReply = {
                phone: testPhone,
                message: aiResult.reply,
                role: 'bot',
                event: 'REPLY',
                parentId: docRef.id,
                createdAt: serverTimestamp(),
              };
              addDoc(eventsRef, botReply);
            })
            .catch(async (err) => {
              const permissionError = new FirestorePermissionError({
                path: eventsRef.path,
                operation: 'create',
                requestResourceData: customerEvent,
              } satisfies SecurityRuleContext);
              errorEmitter.emit('permission-error', permissionError);
            });

          toast({ title: 'Simulation Successful', description: 'Bot processed the message and replied.' });
          setMessage('');
        } catch (e) {
          // Fallback for general errors
          toast({ title: 'Simulation logged to console', description: 'Permission denied for persistent logging.' });
        }
      } else {
        toast({ title: 'Simulation Failed', description: res.error, variant: 'destructive' });
      }
    });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary font-headline tracking-tight">WhatsApp Command Center</h1>
          <p className="text-muted-foreground text-lg mt-1">AI-powered service matching and automated artisan interaction.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold">System Online</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex items-start gap-4">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Engine</h3>
              <p className="text-2xl font-black">Gemini 2.5</p>
              <p className="text-xs text-muted-foreground mt-1">Smart Matching Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex items-start gap-4">
            <div className="bg-secondary/10 p-4 rounded-2xl">
              <History className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Daily Events</h3>
              <p className="text-2xl font-black">{events?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Requests processed today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex items-start gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Security</h3>
              <p className="text-2xl font-black">Verified Only</p>
              <p className="text-xs text-muted-foreground mt-1">Strict matching mode</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="simulator" className="space-y-8">
        <TabsList className="bg-muted/50 p-1 rounded-2xl border h-14">
          <TabsTrigger value="simulator" className="rounded-xl px-8 font-bold text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">Simulator</TabsTrigger>
          <TabsTrigger value="logs" className="rounded-xl px-8 font-bold text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">Live Logs</TabsTrigger>
          <TabsTrigger value="config" className="rounded-xl px-8 font-bold text-base data-[state=active]:bg-white data-[state=active]:shadow-sm">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <Card className="border-none shadow-xl rounded-[40px] overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="p-10 pb-4">
              <CardTitle className="text-3xl font-black font-headline">Bot Simulator</CardTitle>
              <CardDescription className="text-lg">Test the AI matching logic by simulating a customer message.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Customer Phone</label>
                    <Input 
                      value={testPhone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0241234567" 
                      className="h-14 rounded-2xl border-muted-foreground/20 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Message Content</label>
                    <textarea 
                      value={testMessage}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. I need a plumber in Biadan right now" 
                      className="w-full min-h-[150px] p-4 rounded-3xl border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg resize-none"
                    />
                  </div>
                  <Button 
                    onClick={handleSimulate} 
                    disabled={isPending || !testMessage}
                    className="w-full h-16 rounded-2xl text-xl font-bold shadow-lg shadow-primary/20"
                  >
                    {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Send className="mr-2 h-6 w-6" />}
                    Test AI Logic
                  </Button>
                </div>

                <div className="bg-muted/30 rounded-[32px] p-8 border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center">
                  <div className="bg-white p-6 rounded-[24px] shadow-sm max-w-sm mb-6">
                    <p className="italic text-muted-foreground">"When you run a test, the AI's structured response and the simulated WhatsApp reply will appear in the live logs."</p>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground/60">SIMULATOR PREVIEW MODE</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b">
              <CardTitle className="font-headline">Recent Bot Activity</CardTitle>
              <CardDescription>Real-time stream of incoming messages and automated replies.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {logsLoading ? (
                <div className="p-20 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                </div>
              ) : events && events.length > 0 ? (
                <div className="divide-y">
                  {events.map((event) => (
                    <div key={event.id} className="p-6 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                      <div className={`p-3 rounded-2xl ${event.role === 'bot' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                        {event.role === 'bot' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold">{event.role === 'bot' ? 'FixAm Bot' : event.phone}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            {event.createdAt ? formatDistanceToNow(new Date(event.createdAt.toDate()), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed">{event.message}</p>
                        {event.aiParsed && (
                          <div className="flex gap-2 pt-2">
                            <span className="bg-primary/5 text-primary text-[10px] font-black px-2 py-1 rounded-full border border-primary/10 uppercase">
                              CAT: {event.aiParsed.category}
                            </span>
                            <span className="bg-secondary/5 text-secondary text-[10px] font-black px-2 py-1 rounded-full border border-secondary/10 uppercase">
                              LOC: {event.aiParsed.area}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-20 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-bold text-lg">No activity yet</p>
                  <p>Run a simulation to see the bot in action.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <div className="bg-white p-12 rounded-[40px] border shadow-sm text-center max-w-2xl mx-auto">
            <div className="bg-muted/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-black font-headline mb-4">API Configuration Required</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              To connect to a live WhatsApp number, you must configure your Meta Business API keys in the system settings.
            </p>
            <div className="bg-muted/30 p-6 rounded-3xl text-left font-mono text-xs overflow-x-auto">
              <code className="text-primary/80">
                WHATSAPP_PHONE_ID=pending_configuration<br/>
                WHATSAPP_ACCESS_TOKEN=••••••••••••••••••••<br/>
                WHATSAPP_WEBHOOK_SECRET=••••••••••••••••••••
              </code>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
