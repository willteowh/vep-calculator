import { CHECKPOINTS, VEHICLE_TYPES } from "../config/constants";

export type VehicleCategory =
  (typeof VEHICLE_TYPES)[keyof typeof VEHICLE_TYPES];
export type Checkpoint = (typeof CHECKPOINTS)[keyof typeof CHECKPOINTS];
export type HasIU = "yes" | "no";

const VEHICLE_CATEGORIES: readonly string[] = Object.values(VEHICLE_TYPES);
const CHECKPOINT_VALUES: readonly string[] = Object.values(CHECKPOINTS);

export const isVehicleCategory = (v: string): v is VehicleCategory =>
  VEHICLE_CATEGORIES.includes(v);
export const isCheckpoint = (v: string): v is Checkpoint =>
  CHECKPOINT_VALUES.includes(v);
export const isHasIU = (v: string): v is HasIU => v === "yes" || v === "no";
