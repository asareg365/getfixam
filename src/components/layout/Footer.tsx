import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 border-t bg-white text-center">
      <div className="container px-4 mx-auto">
        <div className="flex justify-center mb-8">
            <Link href="/">
                <Image src="/logo.png" alt="GetFixam Logo" width={180} height={80} />
            </Link>
        </div>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} GetFixam. All rights reserved.</p>
        
        {/* Social Media Links */}
        <div className="flex justify-center gap-6 mt-6 mb-8">
          <a href="https://facebook.com/getfixam" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted/20 rounded-full" aria-label="Facebook">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="https://instagram.com/getfixam" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted/20 rounded-full" aria-label="Instagram">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="https://tiktok.com/@getfixam" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted/20 rounded-full" aria-label="TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
              <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>
            </svg>
          </a>
          <a href="https://wa.me/233240000000" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-muted/20 rounded-full" aria-label="WhatsApp">
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>

        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground flex-wrap font-bold">
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
        </div>
      </div>
    </footer>
  );
}
