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
  },
  {
    title: "Quotes",
    url: "/quotes",
    icon: FileText,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: ShoppingCart,
  },
  {
    title: "Users",
    url: "/users",
    icon: Users,
  },
  // Add Careers section
  {
    title: "Careers",
    url: "/careers",
    icon: Briefcase,
    items: [
      { title: "Job Postings", url: "/careers" },
      { title: "Applications", url: "/careers/applications" },
    ],
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Newspaper, // Add Insights to sidebar
  },
  {
    title: "Admins",
    url: "/admins",
    icon: UserCog,
  },
];
