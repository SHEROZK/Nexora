"use client";

import { useReducer } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import {
  ACTIONS,
  STATUS_LABEL,
  STATUS_TRACK,
  createOrder,
  isLegal,
  paymentLabel,
  transition,
  type OrderAction,
  type OrderState,
  type PaymentMethod,
} from "@/lib/orderMachine";
import { cn } from "@/lib/cn";

type Message = { type: "act"; action: OrderAction } | { type: "reset"; method: PaymentMethod };

function reducer(state: OrderState, message: Message): OrderState {
  return message.type === "reset" ? createOrder(message.method) : transition(state, message.action);
}

const actors = ["Restaurant", "Customer", "Driver"] as const;

/**
 * A working model of the order rules. Every button is live, including the ones that
 * are not legal right now: pressing one shows why the server would refuse it.
 */
export function OrderMachine() {
  const [order, dispatch] = useReducer(reducer, "online", createOrder);
  const last = order.events.at(-1);
  const reached = STATUS_TRACK.indexOf(order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="border-2 border-fg bg-surface">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between md:p-7">
        <div role="group" aria-label="Start a new order" className="flex gap-2">
          {(["online", "cash"] as const).map((method) => (
            <button
              key={method}
              type="button"
              aria-pressed={order.method === method}
              onClick={() => dispatch({ type: "reset", method })}
              className={cn(
                "min-h-11 border px-4 text-[0.9375rem] transition-colors",
                order.method === method ? "border-fg bg-fg text-surface" : "border-line text-fg-2 hover:border-line-strong hover:text-fg",
              )}
            >
              {method === "online" ? "Online payment" : "Cash on delivery"}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "reset", method: order.method })}
          className="t-data flex min-h-11 items-center gap-2 self-start text-fg-2 transition-colors hover:text-fg sm:self-auto"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          New order
        </button>
      </div>

      <div className="grid lg:grid-cols-12">
        <div className="p-5 md:p-7 lg:col-span-7 lg:border-r lg:border-line">
          {/* Where the order is */}
          <ol className="grid grid-cols-1 gap-y-1 sm:grid-cols-7 sm:gap-x-1" aria-label="Order progress">
            {STATUS_TRACK.map((status, i) => {
              const done = !cancelled && i < reached;
              const current = !cancelled && i === reached;
              return (
                <li key={status} aria-current={current ? "step" : undefined} className="flex items-center gap-3 sm:block">
                  <span
                    className={cn(
                      "block h-px w-8 shrink-0 transition-colors duration-500 sm:h-0.5 sm:w-full",
                      current ? "bg-accent" : done ? "bg-fg" : "bg-line-strong",
                    )}
                  />
                  <span
                    className={cn(
                      "t-data block transition-colors duration-500 sm:mt-3",
                      current ? "text-accent" : done ? "text-fg" : "text-fg-3",
                    )}
                  >
                    {STATUS_LABEL[status]}
                  </span>
                </li>
              );
            })}
          </ol>

          <dl className="mt-7 grid grid-cols-2 gap-px border border-line bg-line">
            {[
              ["Order", cancelled ? "Cancelled" : STATUS_LABEL[order.status]],
              ["Payment", paymentLabel(order)],
              ["Method", order.method === "online" ? "Online" : "Cash"],
              ["Customer PIN", order.pinVerified ? "Verified" : "Not entered"],
            ].map(([term, value]) => (
              <div key={term} className="bg-surface-2 p-4">
                <dt className="text-[0.8125rem] text-fg-3">{term}</dt>
                <dd className="mt-1 text-[1.0625rem]">{value}</dd>
              </div>
            ))}
          </dl>

          {/* What anyone can try */}
          <div className="mt-7 space-y-5">
            {actors.map((actor) => (
              <div key={actor} role="group" aria-label={`${actor} actions`}>
                <p className="text-[0.8125rem] text-fg-3">{actor}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ACTIONS.filter((action) => action.actor === actor).map((action) => {
                    const legal = isLegal(order, action.id);
                    return (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => dispatch({ type: "act", action: action.id })}
                        data-legal={legal}
                        className={cn(
                          "min-h-11 border px-3.5 text-[0.9375rem] transition-colors",
                          legal
                            ? "border-line-strong text-fg hover:border-accent hover:text-accent"
                            : "border-dashed border-line text-fg-3 hover:border-refuse/60 hover:text-refuse",
                        )}
                      >
                        {action.label}
                        <span className="sr-only">{legal ? " (allowed now)" : " (will be refused)"}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[0.8125rem] text-fg-3">
            Solid buttons are legal now. Dashed ones are not, and you can press them to see the refusal.
          </p>
        </div>

        {/* What happened */}
        <div className="flex flex-col border-t border-line p-5 md:p-7 lg:col-span-5 lg:border-t-0">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-[1.0625rem] font-medium">Event timeline</h3>
            <span className="t-data text-fg-3">Append only · {order.events.length}</span>
          </div>

          <p
            role="status"
            aria-live="polite"
            className={cn(
              "mt-4 min-h-[4.5rem] border-l-0 border-t pt-3 text-[1.0625rem] leading-snug",
              !last ? "border-line text-fg-2" : last.ok ? "border-accent text-fg" : "border-refuse text-refuse",
            )}
          >
            {last ? last.message : "A new order is waiting for the restaurant. Try to pay for it before it is accepted."}
          </p>

          <ol className="mt-4 max-h-72 flex-1 space-y-px overflow-y-auto overscroll-contain" data-lenis-prevent aria-label="All events, newest first">
            {[...order.events].reverse().map((event) => (
              <li key={event.id} className="flex items-start gap-3 border-t border-line py-2.5 text-[0.875rem]">
                <span className="t-data mt-0.5 w-6 shrink-0 text-fg-3">{String(event.id).padStart(2, "0")}</span>
                <span className={cn("mt-0.5 shrink-0", event.ok ? "text-accent" : "text-refuse")}>
                  {event.ok ? <Check className="size-3.5" aria-hidden="true" /> : <X className="size-3.5" aria-hidden="true" />}
                  <span className="sr-only">{event.ok ? "Done:" : "Refused:"}</span>
                </span>
                <span className={event.ok ? "text-fg-2" : "text-fg-3"}>
                  <span className="text-fg">{ACTIONS.find((a) => a.id === event.action)?.label}.</span> {event.message}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
