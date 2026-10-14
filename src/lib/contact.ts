/** Contact form rules, shared by the browser and the route handler so they cannot drift. */

export const PROJECT_TYPES = [
  "Product build",
  "AI feature or integration",
  "Backend or API work",
  "Automation or generative workflow",
  "Interface or creative frontend",
  "Architecture or integration review",
  "A role or something else",
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

export interface ContactInput {
  name: string;
  email: string;
  company: string;
  type: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput, string>>;

export const LIMITS = { name: 80, email: 160, company: 120, messageMin: 20, messageMax: 4000 } as const;

/** Minimum time a person plausibly needs to fill the form in. */
export const MIN_FILL_MS = 2500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalise(raw: Partial<Record<keyof ContactInput, unknown>>): ContactInput {
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");
  return {
    name: text(raw.name),
    email: text(raw.email),
    company: text(raw.company),
    type: text(raw.type),
    message: text(raw.message),
  };
}

export function validate(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};

  if (!input.name) errors.name = "Tell me who is writing.";
  else if (input.name.length > LIMITS.name) errors.name = `Keep the name under ${LIMITS.name} characters.`;

  if (!input.email) errors.email = "I need an address to reply to.";
  else if (input.email.length > LIMITS.email || !EMAIL.test(input.email))
    errors.email = "That does not look like an email address. Check for a typo.";

  if (input.company.length > LIMITS.company) errors.company = `Keep this under ${LIMITS.company} characters.`;

  if (!PROJECT_TYPES.includes(input.type as ProjectType)) errors.type = "Pick the closest option.";

  if (input.message.length < LIMITS.messageMin)
    errors.message = `A few sentences help me reply usefully. At least ${LIMITS.messageMin} characters.`;
  else if (input.message.length > LIMITS.messageMax)
    errors.message = `Keep the message under ${LIMITS.messageMax} characters. Details can follow by email.`;

  return errors;
}

export function hasErrors(errors: ContactErrors) {
  return Object.keys(errors).length > 0;
}

export function emailSubject(input: ContactInput) {
  return `${input.type} — ${input.name}${input.company ? `, ${input.company}` : ""}`;
}

export function emailBody(input: ContactInput) {
  return [
    input.message,
    "",
    "—",
    input.name,
    input.company || null,
    input.email,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** True when the server has what it needs to send mail. Server-side only. */
export function formBackendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL && process.env.CONTACT_FROM_EMAIL);
}
