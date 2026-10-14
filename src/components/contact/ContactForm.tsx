"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { mailto, site } from "@/config/site";
import {
  LIMITS,
  PROJECT_TYPES,
  emailBody,
  emailSubject,
  hasErrors,
  normalise,
  validate,
  type ContactErrors,
  type ContactInput,
} from "@/lib/contact";
import { cn } from "@/lib/cn";

/** Service ids from the services page, mapped to the closest enquiry type. */
const TOPICS: Record<string, string> = {
  product: PROJECT_TYPES[0],
  ai: PROJECT_TYPES[1],
  backend: PROJECT_TYPES[2],
  automation: PROJECT_TYPES[3],
  frontend: PROJECT_TYPES[4],
  architecture: PROJECT_TYPES[5],
};

type Phase =
  | { name: "idle" }
  | { name: "sending" }
  | { name: "sent" }
  | { name: "handed-off" }
  | { name: "failed"; message: string };

const empty: ContactInput = { name: "", email: "", company: "", type: "", message: "" };

/**
 * Two honest modes, chosen on the server:
 *  - `serverDelivery` true: the message is posted to /api/contact, validated again there, and emailed.
 *  - `serverDelivery` false: nothing is sent from the site. The form composes the message
 *    in the visitor's own email app, and says so before they start typing.
 */
export function ContactForm({ serverDelivery }: { serverDelivery: boolean }) {
  const params = useSearchParams();
  const id = useId();
  const startedAt = useRef(0);
  const summary = useRef<HTMLDivElement>(null);
  // A link from the services page can preselect the enquiry type.
  const [values, setValues] = useState<ContactInput>(() => ({ ...empty, type: TOPICS[params.get("topic") ?? ""] ?? "" }));
  const [errors, setErrors] = useState<ContactErrors>({});
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [trap, setTrap] = useState("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const set = (field: keyof ContactInput) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const input = normalise(values);
    const found = validate(input);
    setErrors(found);
    if (hasErrors(found)) {
      setPhase({ name: "idle" });
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }

    if (!serverDelivery) {
      window.location.href = mailto(emailSubject(input), emailBody(input));
      setPhase({ name: "handed-off" });
      return;
    }

    setPhase({ name: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...input, website: trap, elapsed: Date.now() - startedAt.current }),
      });
      const result = (await response.json().catch(() => ({}))) as { ok?: boolean; errors?: ContactErrors; message?: string };

      if (response.ok && result.ok) {
        setPhase({ name: "sent" });
        setValues(empty);
        return;
      }
      if (response.status === 422 && result.errors) {
        setErrors(result.errors);
        setPhase({ name: "idle" });
        requestAnimationFrame(() => summary.current?.focus());
        return;
      }
      setPhase({
        name: "failed",
        message: result.message ?? "The message could not be sent. Nothing was lost: your text is still in the form.",
      });
    } catch {
      setPhase({ name: "failed", message: "The connection dropped before the message was sent. Your text is still in the form." });
    }
  };

  if (phase.name === "sent") {
    return (
      <div role="status" className="border border-accent p-7 md:p-10">
        <h2 className="t-title">Message sent.</h2>
        <p className="mt-4 max-w-[46ch] text-fg-2">
          It is in my inbox now. I reply to project enquiries myself, usually within two working days.
        </p>
        <button type="button" onClick={() => setPhase({ name: "idle" })} className="btn btn-ghost mt-7">
          Write another message
        </button>
      </div>
    );
  }

  const errorList = (Object.entries(errors) as [keyof ContactInput, string | undefined][]).filter(([, message]) => message);
  const field = "mt-2 w-full border bg-transparent px-4 text-[1.0625rem] text-fg outline-none transition-colors placeholder:text-fg-3 focus:border-fg";
  const border = (name: keyof ContactInput) => (errors[name] ? "border-refuse" : "border-line-strong");
  const describe = (name: keyof ContactInput) => (errors[name] ? `${id}-${name}-error` : undefined);
  const fault = (name: keyof ContactInput) =>
    errors[name] ? (
      <p id={`${id}-${name}-error`} className="mt-2 text-[0.875rem] text-refuse">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate aria-describedby={`${id}-mode`}>
      <p id={`${id}-mode`} className="border-l border-line-strong pl-4 text-[0.9375rem] text-fg-2">
        {serverDelivery
          ? "This form sends your message straight to my inbox."
          : "This form does not send anything from the site. It opens your own email app with the message written out, ready for you to send."}
      </p>

      {errorList.length > 0 ? (
        <div ref={summary} tabIndex={-1} role="alert" className="mt-6 border border-refuse p-5 outline-none">
          <p className="font-medium text-refuse">
            {errorList.length === 1 ? "One field needs attention." : `${errorList.length} fields need attention.`}
          </p>
          <ul className="mt-2 space-y-1 text-[0.9375rem]">
            {errorList.map(([name, message]) => (
              <li key={name}>
                <a href={`#${id}-${name}`} className="link">
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="text-[0.9375rem]">
            Your name
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            required
            maxLength={LIMITS.name}
            value={values.name}
            onChange={set("name")}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describe("name")}
            className={cn(field, "h-13", border("name"))}
          />
          {fault("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="text-[0.9375rem]">
            Email address
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={values.email}
            onChange={set("email")}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describe("email")}
            className={cn(field, "h-13", border("email"))}
          />
          {fault("email")}
        </div>
        <div>
          <label htmlFor={`${id}-company`} className="text-[0.9375rem]">
            Company <span className="text-fg-3">(optional)</span>
          </label>
          <input
            id={`${id}-company`}
            name="company"
            autoComplete="organization"
            maxLength={LIMITS.company}
            value={values.company}
            onChange={set("company")}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describe("company")}
            className={cn(field, "h-13", border("company"))}
          />
          {fault("company")}
        </div>
        <div>
          <label htmlFor={`${id}-type`} className="text-[0.9375rem]">
            What do you need?
          </label>
          <select
            id={`${id}-type`}
            name="type"
            required
            value={values.type}
            onChange={set("type")}
            aria-invalid={Boolean(errors.type)}
            aria-describedby={describe("type")}
            className={cn(field, "h-13 appearance-none bg-surface pr-10", border("type"), !values.type && "text-fg-3")}
          >
            <option value="" disabled>
              Choose the closest
            </option>
            {PROJECT_TYPES.map((type) => (
              <option key={type} value={type} className="text-fg">
                {type}
              </option>
            ))}
          </select>
          {fault("type")}
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor={`${id}-message`} className="text-[0.9375rem]">
              What are you building, and where is it stuck?
            </label>
            <span className="t-data text-fg-3" aria-hidden="true">
              {values.message.trim().length} / {LIMITS.messageMax}
            </span>
          </div>
          <textarea
            id={`${id}-message`}
            name="message"
            required
            rows={7}
            maxLength={LIMITS.messageMax}
            value={values.message}
            onChange={set("message")}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={describe("message")}
            placeholder="The product, who it is for, what exists today, and when you need it."
            className={cn(field, "resize-y py-3.5 leading-relaxed", border("message"))}
          />
          {fault("message")}
        </div>

        {/* Honeypot: hidden from people and assistive technology, tempting to bots. */}
        <div className="absolute -left-[200vw] h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={`${id}-website`}>Leave this field empty</label>
          <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" disabled={phase.name === "sending"} className="btn btn-primary">
          {phase.name === "sending" ? (
            <>
              <LoaderCircle className="animate-spin" aria-hidden="true" />
              Sending
            </>
          ) : (
            <>
              Submit
              <ArrowRight aria-hidden="true" />
            </>
          )}
        </button>
        <p className="text-[0.875rem] text-fg-3">
          Or write directly to{" "}
          <a href={mailto()} className="link text-fg-2">
            {site.email}
          </a>
        </p>
      </div>

      <div role="status" aria-live="polite" className="mt-6">
        {phase.name === "failed" ? (
          <p className="border border-refuse p-5 text-refuse">
            {phase.message} You can also{" "}
            <a href={mailto(emailSubject(normalise(values)), emailBody(normalise(values)))} className="link">
              send it from your email app
            </a>
            .
          </p>
        ) : null}
        {phase.name === "handed-off" ? (
          <p className="border border-line-strong p-5 text-fg-2">
            Your email app should have opened with the message filled in. It is not sent until you send it there. If nothing
            opened, write to{" "}
            <a href={mailto()} className="link text-fg">
              {site.email}
            </a>
            .
          </p>
        ) : null}
      </div>
    </form>
  );
}
