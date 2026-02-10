
'use client';

import { useState, useTransition, useEffect } from 'react';
import { MessageSquare, Zap, Clock, ShieldCheck, Send, Loader2, Bot, User, History, Smartphone, AlertCircle, Save, Key, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { simulateIncomingMessage } from './actions';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function WhatsAppBotPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [testMessage, setMessage] = useState('');
  const [testPhone, setPhone] = useState('0241234567');
  const [lastResult, setLastResult] = useState<{ reply: string; category: string; area: string } | null>(null);

  // Real-time logs
  const eventsQuery = useMemoFirebase(() => {
    return query(collection(db, 'whatsapp_events'), orderBy('createdAt', 'desc'), limit(20));
  }, []);
  const { data: events, isLoading: logsLoading } = useCollection(eventsQuery);

  // Config management
  const configRef = useMemoFirebase(() => doc(db, 'system_settings', 'whatsapp'), []);
  const { data: configData, isLoading: configLoading } = useDoc(configRef);
  const [configState, setConfigState] = useState({
    whatsappPhoneId: '',
    whatsappAccessToken: '',
    whatsappWebhookSecret: '',
  });

  useEffect(() => {
    if (configData) {
      setConfigState({
        whatsappPhoneId: configData.whatsappPhoneId || '',
        whatsappAccessToken: configData.whatsappAccessToken || '',
        whatsappWebhookSecret: configData.whatsappWebhookSecret || '',
      });
    }
  }, [configData]);

  async function handleSimulate() {
    if (!testMessage) return;
    
    startTransition(async () => {
      const res = await simulateIncomingMessage(testMessage);
      
      if (res.success && res.aiResult) {
        const aiResult = res.aiResult;
        setLastResult({
            reply: aiResult.reply,
            category: aiResult.category,
            area: aiResult.area
        });
        
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

        // CRITICAL: Non-blocking mutation with contextual error emission
        addDoc(eventsRef, customerEvent)
          .then((docRef) => {
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

        toast({ title: 'Simulation Successful', description: 'AI processed the request. See preview below.' });
        setMessage('');
      } else {
        toast({ title: 'Simulation Failed', description: res.error, variant: 'destructive' });
      }
    });
  }

  async function handleSaveConfig(e: React.FormEvent) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const updateData = {
      ...configState,
      updatedAt: serverTimestamp(),
      updatedBy: user.email,
    };

    // CRITICAL: Non-blocking mutation with contextual error emission
    setDoc(configRef, updateData, { merge: true })
      .then(() => {
        toast({ title: 'Configuration Saved', description: 'Meta API settings have been updated successfully.' });
      })
      .catch(async (err) => {
        const permissionError = new FirestorePermissionError({
          path: configRef.path,
          operation: 'update',
          requestResourceData: updateData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary font-headline tracking-tight">WhatsApp Command Center</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">AI-powered service matching and automated artisan interaction.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-green-50 text-green-700 border border-green-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-bold">Simulator Online</span>
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
              <p className="text-xs text-muted-foreground mt-1 font-medium">Smart Matching Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex items-start gap-4">
            <div className="bg-secondary/10 p-4 rounded-2xl">
              <History className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Simulations</h3>
              <p className="text-2xl font-black">{events?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Internal test logs</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
          <CardContent className="p-8 flex items-start gap-4">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">Mode</h3>
              <p className="text-2xl font-black">Sandboxed</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Internal testing only</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="rounded-[24px] border-primary/20 bg-primary/5">
        <AlertCircle className="h-5 w-5 text-primary" />
        <AlertTitle className="font-bold">WhatsApp API Status</AlertTitle>
        <AlertDescription className="font-medium">
          Messages sent via this dashboard are currently <b>simulations</b>. To connect real devices, provide your Meta Business credentials in the "Configuration" tab.
        </AlertDescription>
      </Alert>

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
              <CardDescription className="text-lg font-medium">Test how the AI categorizes customer messages and identifies neighborhoods.</CardDescription>
            </CardHeader>
            <CardContent className="p-10 pt-0 space-y-8">
              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Customer Phone</Label>
                    <Input 
                      value={testPhone} 
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0241234567" 
                      className="h-14 rounded-2xl border-muted-foreground/20 text-lg font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Message Content</Label>
                    <textarea 
                      value={testMessage}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="e.g. I need a plumber in Biadan right now" 
                      className="w-full min-h-[150px] p-6 rounded-3xl border border-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium resize-none"
                    />
                  </div>
                  <Button 
                    onClick={handleSimulate} 
                    disabled={isPending || !testMessage}
                    className="w-full h-16 rounded-2xl text-xl font-bold shadow-lg shadow-primary/20"
                  >
                    {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Send className="mr-2 h-6 w-6" />}
                    Test AI Matching
                  </Button>
                </div>

                <div className="space-y-6">
                    <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">Visual Preview (What Customer Sees)</label>
                    {lastResult ? (
                        <div className="bg-primary/5 rounded-[32px] p-8 border border-primary/10 relative overflow-hidden group">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="bg-primary p-2 rounded-xl">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <span className="font-bold text-primary">FixAm Smart Bot</span>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[24px] shadow-sm relative z-10">
                                <p className="text-lg font-medium text-foreground leading-relaxed">{lastResult.reply}</p>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                    Parsed Category: {lastResult.category}
                                </span>
                                <span className="bg-secondary/10 text-secondary text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                    Parsed Area: {lastResult.area}
                                </span>
                            </div>
                            
                            <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <Smartphone className="h-40 w-40" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-muted/30 rounded-[32px] p-12 border border-dashed border-muted-foreground/30 flex flex-col items-center justify-center text-center">
                            <Smartphone className="h-16 w-16 text-muted-foreground/20 mb-4" />
                            <p className="text-muted-foreground font-medium italic">Run a test to see the AI response preview here.</p>
                        </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
            <CardHeader className="p-8 border-b">
              <CardTitle className="font-headline">Recent Simulation Logs</CardTitle>
              <CardDescription className="font-medium">Real-time stream of internal test activity.</CardDescription>
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
                          <span className="text-sm font-bold">{event.role === 'bot' ? 'FixAm Bot (Simulated)' : event.phone}</span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            {event.createdAt ? formatDistanceToNow(new Date(event.createdAt.toDate()), { addSuffix: true }) : 'just now'}
                          </span>
                        </div>
                        <p className="text-foreground leading-relaxed font-medium">{event.message}</p>
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
                  <p className="font-bold text-lg">No internal logs yet</p>
                  <p>Run a simulation to see the bot logic in action.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="border-none shadow-xl rounded-[40px] overflow-hidden">
              <div className="h-2 bg-blue-500 w-full" />
              <CardHeader className="p-10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-2xl">
                    <ShieldCheck className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-black font-headline">Meta Business API</CardTitle>
                    <CardDescription className="text-lg font-medium">Connect FixAm to a live WhatsApp Business number.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10 pt-0">
                {configLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveConfig} className="space-y-8">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phoneId" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone Number ID
                        </Label>
                        <Input 
                          id="phoneId"
                          value={configState.whatsappPhoneId}
                          onChange={(e) => setConfigState(prev => ({ ...prev, whatsappPhoneId: e.target.value }))}
                          placeholder="e.g. 106523456789012"
                          className="h-14 rounded-2xl border-muted-foreground/20 text-lg font-medium"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="token" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                          <Key className="h-4 w-4" /> System User Access Token
                        </Label>
                        <Input 
                          id="token"
                          type="password"
                          value={configState.whatsappAccessToken}
                          onChange={(e) => setConfigState(prev => ({ ...prev, whatsappAccessToken: e.target.value }))}
                          placeholder="EAAW..."
                          className="h-14 rounded-2xl border-muted-foreground/20 text-lg font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="secret" className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4" /> Webhook Verification Secret
                        </Label>
                        <Input 
                          id="secret"
                          type="password"
                          value={configState.whatsappWebhookSecret}
                          onChange={(e) => setConfigState(prev => ({ ...prev, whatsappWebhookSecret: e.target.value }))}
                          placeholder="MyCustomSecret123"
                          className="h-14 rounded-2xl border-muted-foreground/20 text-lg font-medium"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-bold shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700">
                      <Save className="mr-2 h-6 w-6" />
                      Save API Credentials
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="bg-muted/30 p-8 rounded-[32px] border border-dashed border-muted-foreground/30 text-center">
              <p className="text-sm text-muted-foreground font-medium italic">
                Status: {configState.whatsappAccessToken ? 'Configuration Loaded' : 'Waiting for API Setup'}
              </p>
              {configData?.updatedAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last updated {formatDistanceToNow(new Date(configData.updatedAt.toDate()), { addSuffix: true })} by {configData.updatedBy}
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
