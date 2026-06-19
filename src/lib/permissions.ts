export const RESOURCES = {
  USER: "user",
  PERSON: "person",
  DRIVER: "driver",
  VEHICLE: "vehicle",
  HEALTH_UNIT: "healthUnit",
  HEALTH_SPECIALTY: "healthSpecialty",
  TRANSPORT: "transport",
  APPOINTMENT: "appointment",
  APPOINTMENT_REPORT: "appointment_report",
  TRANSPORT_REPORT: "transport_report",
  DOCUMENTS: "documents",
} as const;

export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",
} as const;

export type Resource = (typeof RESOURCES)[keyof typeof RESOURCES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];
