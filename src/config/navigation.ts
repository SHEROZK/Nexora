export interface NavItem {
  /** Also the id of the matching section on the home page, when it has one. */
  id: string;
  /** True when the home page has a section with this id, so the link scrolls there instead of leaving. */
  onHome?: boolean;
  label: string;
  href: string;
}

export const navigation: NavItem[] = [
  { id: "work", label: "Work", href: "/work", onHome: true },
  { id: "services", label: "Services", href: "/services", onHome: true },
  { id: "about", label: "About", href: "/about" },
  { id: "experiments", label: "Experiments", href: "/experiments" },
  { id: "contact", label: "Contact", href: "/contact", onHome: true },
];
