import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./components/sidebar-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const sidebarNavItems = [
        {
            title: "General",
            href: "/admin/settings/general",
        },
        {
            title: "Security",
            href: "/admin/settings/security",
        },
        {
            title: "Appearance",
            href: "/admin/settings/appearance",
        },
        ];
  return (
    <>
      <div className="space-y-6 p-10 pb-16 md:block">
        <div className="space-y-0.5">
            <Heading title="Settings" description="Manage your account settings and set e-mail preferences." />
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className="flex-1 lg:max-w-2xl">{children}</div>
        </div>
      </div>
    </>
  );
}