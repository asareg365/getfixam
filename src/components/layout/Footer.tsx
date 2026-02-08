import Link from 'next/link';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t bg-white text-center">
      <div className="container px-4 mx-auto">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FixAm. All rights reserved.</p>
        
        {/* Social Media Links */}
        <div className="flex justify-center gap-6 mt-6 mb-8">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
              <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="WhatsApp">
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>

        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
        </div>
      </div>
    </footer>
  );
}
