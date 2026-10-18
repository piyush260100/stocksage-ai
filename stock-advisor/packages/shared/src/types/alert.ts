export type AlertDirection = "above" | "below";
export type AlertStatus = "active" | "triggered";

/** A user-defined price alert on a stock. */
export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  direction: AlertDirection;
  /** Target price in INR. */
  target: number;
  /** Price when the alert was created, for context. */
  createdPrice: number;
  status: AlertStatus;
  createdAt: string;
  triggeredAt?: string;
}
