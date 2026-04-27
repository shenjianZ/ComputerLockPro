import type { LockMode } from "./lock";

export interface LockEvent {
  id: number;
  eventType: string;
  mode: LockMode | null;
  message: string;
  createdAt: string;
}
