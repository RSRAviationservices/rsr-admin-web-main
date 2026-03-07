import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Users,
  UserCog,
  FileText,
  Briefcase,
  Newspaper, // Add this
  // KeyRound
} from "lucide-react";
import { AdminRole } from "@/types/admin";

export const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Boxes,
    requiredResource: "inventory",
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: FileText,
    requiredResource: "quotes",
  },
  {
    title: "Leads",
    url: "/leads",
    icon: ShoppingCart,
    requiredResource: "leads",
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
    requiredResource: "users",
  },
  // Add Careers section
  {
    title: "Careers",
    url: "/careers",
    icon: Briefcase,
    requiredResource: "careers",
    items: [
      { title: "Job Postings", url: "/careers" },
      { title: "Applications", url: "/careers/applications" },
    ],
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Newspaper, // Add Insights to sidebar
    requiredResource: "insights",
  },
  {
    title: "Admins",
    url: "/admins",
    icon: UserCog,
    requiredRole: AdminRole.SUPER_ADMIN,
  },
];
