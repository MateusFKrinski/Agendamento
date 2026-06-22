import { downloadFile } from "@/lib/utils/download";
import {
  AppointmentReportRow,
  TransportReportRow,
} from "@/actions/types/reports";

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR");
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toLocaleString("pt-BR");
}

function rowToCsv(row: unknown[]): string {
  return row.map(escapeCell).join(",");
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(","), ...rows.map(rowToCsv)];
  return "\uFEFF" + lines.join("\n");
}

const APPOINTMENT_HEADERS = [
  "Data",
  "Horário",
  "Cancelado",
  "Motivo Cancelamento",
  "Cancelado Em",
  "Possui Acompanhante",
  "Observações",
  "Paciente Nome",
  "Paciente CPF",
  "Paciente Data Nascimento",
  "Paciente Telefone",
  "Acompanhante Nome",
  "Especialidade",
  "Unidade",
  "Tipo de Unidade",
  "Local de Espera",
  "Criado Por",
  "Cancelado Por",
  "Transportes (direções)",
];

function appointmentToRow(a: AppointmentReportRow): unknown[] {
  return [
    formatDate(a.date),
    a.time,
    a.isCanceled ? "Sim" : "Não",
    a.cancelReason,
    formatDateTime(a.canceledAt),
    a.hasCompanion ? "Sim" : "Não",
    a.observations,
    a.patient.name,
    a.patient.cpf,
    formatDate(a.patient.birthDate),
    a.patient.phone,
    a.companion?.name,
    a.healthSpecialty.name,
    a.healthUnit.unitName,
    a.healthUnit.unitType,
    a.waitingPlace.name,
    a.createdBy.name,
    a.canceledBy?.name,
    a.transports.map((t) => t.direction).join(" | "),
  ];
}

export function downloadAppointmentsCsv(
  data: AppointmentReportRow[],
  fileName = "agendamentos.csv",
): void {
  const csv = buildCsv(APPOINTMENT_HEADERS, data.map(appointmentToRow));
  downloadFile(csv, fileName, "text/csv");
}

const TRANSPORT_HEADERS = [
  "Data",
  "Horário Saída",
  "Cancelado",
  "Motivo Cancelamento",
  "Cancelado Em",
  "Observações",
  "Veículo Placa",
  "Veículo Modelo",
  "Veículo Marca",
  "Veículo Ano",
  "Veículo Cor",
  "Veículo Capacidade",
  "Motorista Nome",
  "Motorista Telefone",
  "Criado Por",
  "Cancelado Por",
  "Agendamentos (Pacientes)",
  "Agendamentos (Direções)",
];

function transportToRow(t: TransportReportRow): unknown[] {
  const appointmentPatients = t.appointments
    .map((a) => a.appointment.patient.name)
    .join(" | ");
  const appointmentDirections = t.appointments
    .map((a) => a.direction)
    .join(" | ");

  return [
    formatDate(t.date),
    t.departureTime,
    t.isCanceled ? "Sim" : "Não",
    t.cancelReason,
    formatDateTime(t.canceledAt),
    t.observations,
    t.vehicle.plate,
    t.vehicle.model,
    t.vehicle.brand,
    t.vehicle.year,
    t.vehicle.color,
    t.vehicle.capacity,
    t.driver.name,
    t.driver.phone,
    t.createdBy.name,
    t.canceledBy?.name,
    appointmentPatients,
    appointmentDirections,
  ];
}

export function downloadTransportsCsv(
  data: TransportReportRow[],
  fileName = "transportes.csv",
): void {
  const csv = buildCsv(TRANSPORT_HEADERS, data.map(transportToRow));
  downloadFile(csv, fileName, "text/csv");
}
