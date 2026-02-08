import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="py-12 border-t bg-white text-center">
      <div className="container px-4 mx-auto">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} FixAm. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
        </div>
      </div>
    </footer>
  );
}
