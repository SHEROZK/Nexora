/**
 * A small, pure model of the order and payment rules described in the Food For Less
 * case study. It is a teaching reduction written for this site: it shares the rules,
 * not the code, of the production system and talks to nothing.
 */

export type OrderStatus =
  | "NEW"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "cash" | "online";

export type OrderAction =
  | "accept"
  | "pay"
  | "prepare"
  | "ready"
  | "assign"
  | "start"
  | "collect"
  | "pin"
  | "complete"
  | "cancel";

export interface OrderEvent {
  id: number;
  action: OrderAction;
  ok: boolean;
  message: string;
}

export interface OrderState {
  status: OrderStatus;
  method: PaymentMethod;
  paid: boolean;
  pinVerified: boolean;
  refundDue: boolean;
  events: OrderEvent[];
}

export const STATUS_TRACK: OrderStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "ASSIGNED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  NEW: "New",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  ASSIGNED: "Assigned",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ACTIONS: { id: OrderAction; label: string; actor: "Restaurant" | "Customer" | "Driver" }[] = [
  { id: "accept", label: "Accept order", actor: "Restaurant" },
  { id: "pay", label: "Pay online", actor: "Customer" },
  { id: "prepare", label: "Start preparing", actor: "Restaurant" },
  { id: "ready", label: "Mark ready", actor: "Restaurant" },
  { id: "assign", label: "Assign driver", actor: "Restaurant" },
  { id: "start", label: "Start delivery", actor: "Driver" },
  { id: "collect", label: "Record cash", actor: "Driver" },
  { id: "pin", label: "Enter customer PIN", actor: "Driver" },
  { id: "complete", label: "Complete delivery", actor: "Driver" },
  { id: "cancel", label: "Cancel order", actor: "Restaurant" },
];

export function createOrder(method: PaymentMethod): OrderState {
  return { status: "NEW", method, paid: false, pinVerified: false, refundDue: false, events: [] };
}

type Verdict = { ok: true; patch: Partial<OrderState>; message: string } | { ok: false; message: string };

const refuse = (message: string): Verdict => ({ ok: false, message });
const allow = (patch: Partial<OrderState>, message: string): Verdict => ({ ok: true, patch, message });

/** Decides whether an action is legal right now, and what it would change. */
export function judge(state: OrderState, action: OrderAction): Verdict {
  const { status, method, paid, pinVerified } = state;

  if (status === "DELIVERED") {
    return refuse("A delivered order is locked. Only a refund or a reasoned correction can change it.");
  }
  if (status === "CANCELLED") {
    return refuse("A cancelled order is closed.");
  }

  switch (action) {
    case "accept":
      return status === "NEW"
        ? allow(
            { status: "ACCEPTED" },
            method === "online"
              ? "Accepted. Payment is now required before the kitchen starts."
              : "Accepted and confirmed. Payment is collected on delivery.",
          )
        : refuse("Only a new order can be accepted.");

    case "pay":
      if (method !== "online") return refuse("This order pays on delivery. There is nothing to pay online.");
      if (status === "NEW") return refuse("The restaurant has not approved the order yet, so it cannot be paid.");
      if (paid) return refuse("This payment is already in the ledger. It is recorded once.");
      return allow({ paid: true }, "Payment confirmed by the provider and written to the ledger.");

    case "prepare":
      if (status !== "ACCEPTED") return refuse("Preparing starts from an accepted order.");
      if (method === "online" && !paid) return refuse("The kitchen waits for the money. This online order is not paid.");
      return allow({ status: "PREPARING" }, "Kitchen started.");

    case "ready":
      return status === "PREPARING"
        ? allow({ status: "READY" }, "Food is ready for a driver.")
        : refuse("Only an order being prepared can be marked ready.");

    case "assign":
      return status === "READY"
        ? allow({ status: "ASSIGNED" }, "Driver assigned and notified.")
        : refuse("A driver is assigned once the food is ready.");

    case "start":
      return status === "ASSIGNED"
        ? allow({ status: "OUT_FOR_DELIVERY" }, "Driver picked up the order and left.")
        : refuse("Delivery starts after a driver has been assigned.");

    case "collect":
      if (method !== "cash") return refuse("Drivers never record money for an online order.");
      if (status !== "OUT_FOR_DELIVERY") return refuse("Cash is recorded at the customer's door.");
      if (paid) return refuse("Cash for this order is already recorded.");
      return allow({ paid: true }, "Cash recorded against this driver.");

    case "pin":
      if (status !== "OUT_FOR_DELIVERY") return refuse("The PIN is entered at the door, during delivery.");
      if (!paid) return refuse("Payment comes before the PIN. Nothing has been collected yet.");
      if (pinVerified) return refuse("The PIN is already verified.");
      return allow({ pinVerified: true }, "PIN verified.");

    case "complete":
      if (status !== "OUT_FOR_DELIVERY") return refuse("Only an order that is out for delivery can be completed.");
      if (!pinVerified) return refuse("Completion needs the customer's PIN.");
      return allow({ status: "DELIVERED" }, "Delivered. The order is now financially locked.");

    case "cancel":
      return allow(
        { status: "CANCELLED", refundDue: paid },
        paid ? "Cancelled. Money was received, so a refund is now due." : "Cancelled. Nothing was charged.",
      );
  }
}

/** Applies an action. Every attempt, allowed or refused, is appended to the timeline. */
export function transition(state: OrderState, action: OrderAction): OrderState {
  const verdict = judge(state, action);
  const event: OrderEvent = {
    id: state.events.length + 1,
    action,
    ok: verdict.ok,
    message: verdict.message,
  };
  const next = verdict.ok ? { ...state, ...verdict.patch } : state;
  return { ...next, events: [...state.events, event] };
}

export function isLegal(state: OrderState, action: OrderAction) {
  return judge(state, action).ok;
}

export function paymentLabel(state: OrderState) {
  if (state.refundDue) return "Refund due";
  if (state.paid) return "Paid";
  if (state.method === "online") return state.status === "NEW" ? "Not payable yet" : "Payment required";
  return "Pay on delivery";
}
