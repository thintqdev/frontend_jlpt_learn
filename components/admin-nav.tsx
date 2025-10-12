import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ListChecks,
  FileText,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  FileTextIcon,
} from "lucide-react";

const navItems = [
  {
    href: "/admin/exercise",
    label: "Exercise",
    icon: ListChecks,
  },
  {
    href: "/admin/grammar",
    label: "Grammar",
    icon: FileText,
  },
  {
    href: "/admin/vocabulary",
    label: "Vocabulary",
    icon: BookOpen,
  },
  {
    href: "/admin/reading",
    label: "Reading",
    icon: FileTextIcon,
  },
  {
    href: "/admin/kaiwa",
    label: "Kaiwa",
    icon: MessageSquare,
  },
];

export default function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2 mb-6 items-center justify-center">
      {navItems.map((item) => (
        <Link href={item.href} key={item.href} passHref legacyBehavior>
          <Button
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 text-base"
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
