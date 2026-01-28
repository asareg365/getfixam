import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-foreground/60 mb-4 md:mb-0">
            &copy; {currentYear} FixAm Ghana. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/provider/login" className="text-foreground/60 hover:text-primary transition-colors">
              Provider Login
            </Link>
            <Link href="/admin/login" className="text-foreground/60 hover:text-primary transition-colors">
              Admin Login
            </Link>
            <Link href="/terms" className="text-foreground/60 hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-foreground/60 hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
