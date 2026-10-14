export interface NavItem {
  /** Also the id of the matching section on the home page. */
  id: string;
  label: string;
  href: string;
}

export const navigation: NavItem[] = [
  { id: "work", label: "Work", href: "/work" },
  { id: "services", label: "Services", href: "/services" },
  { id: "about", label: "About", href: "/about" },
  { id: "experiments", label: "Experiments", href: "/experiments" },
  { id: "contact", label: "Contact", href: "/contact" },
];
