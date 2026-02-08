'use client';

import { MessageSquare, Zap, Clock, ShieldCheck } from 'lucide-react';

export default function WhatsAppBotScaffold() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary font-headline">WhatsApp Bot</h1>
        <p className="text-muted-foreground">Manage automated interactions and service matching.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
          <div className="bg-green-100 p-3 rounded-full">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold">Bot Status</h3>
            <p className="text-sm text-green-600 font-medium">Online & Running</p>
            <p className="text-xs text-muted-foreground mt-1">Uptime: 14 days, 6 hours</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-bold">Queue Size</h3>
            <p className="text-sm font-medium">12 Pending</p>
            <p className="text-xs text-muted-foreground mt-1">Avg processing time: 4s</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-start gap-4">
          <div className="bg-secondary/10 p-3 rounded-full">
            <ShieldCheck className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold">Matching Security</h3>
            <p className="text-sm font-medium">Verification Enabled</p>
            <p className="text-xs text-muted-foreground mt-1">Strict matching mode</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border shadow-sm text-center space-y-4 max-w-2xl mx-auto py-20 mt-12">
        <div className="bg-muted/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold font-headline">Bot API Integration Placeholder</h2>
        <p className="text-muted-foreground">
          The WhatsApp Bot configuration and real-time logs will appear here once the API keys are configured in your environment variables.
        </p>
        <div className="bg-muted/30 p-4 rounded-lg text-left font-mono text-xs overflow-x-auto max-w-sm mx-auto">
          <code>
            WHATSAPP_API_ENDPOINT=https://api.whatsapp.com/v1/...<br/>
            BOT_WEBHOOK_SECRET=hidden_secret_key_placeholder
          </code>
        </div>
      </div>
    </div>
  );
}
