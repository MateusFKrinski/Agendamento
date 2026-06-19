"use server";

import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";
import {
  maskCNPJ,
  maskCPF,
  maskPhone,
  maskPlate,
  maskZipCode,
} from "@/lib/utils/masks";
import {
  GenerateDailyFormData,
  generateDailySchema,
} from "@/lib/schemas/daily";
import {
  GenerateRouteMapFormData,
  generateRouteMapSchema,
} from "@/lib/schemas/routeMap";
import {
  GENERATE_DOCUMENT_DAILY_SELECT,
  GENERATE_DOCUMENT_ROUTE_MAP_SELECT,
} from "@/actions/selects/generateDocument";
import { countPassengers } from "@/lib/utils/count-passengers";

export const generateDaily = withPermission(
  "read",
  "documents",
  async (
    input: GenerateDailyFormData,
  ): Promise<ActionResult<{ fileName: string; fileData: number[] }>> => {
    return createResult(async () => {
      const parsed = generateDailySchema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const templateRecord = await prisma.documentTemplate.findUnique({
        where: { type: "DAILY_REQUEST" },
        select: { fileData: true, fileName: true },
      });
      if (!templateRecord) {
        throw new Error("Template de diária não cadastrado");
      }

      const transport = await prisma.transport.findUnique({
        where: { id: input.transportId },
        select: GENERATE_DOCUMENT_DAILY_SELECT,
      });
      if (!transport) throw new Error("Transporte não encontrado");

      const pm =
        transport.driver.paymentMethods.find(
          (p) => p.id === input.paymentMethodId,
        ) ?? transport.driver.paymentMethods[0];

      const totalPassengers = countPassengers(
        transport.appointments.map((a) => a.appointment),
      );

      const data = {
        motorista_nome: transport.driver.name,
        motorista_cpf: maskCPF(transport.driver.cpf),
        motorista_rg: transport.driver.rg ?? "",
        motorista_cargo: transport.driver.role ?? "Motorista",
        banco_nome: pm?.bankName ?? "",
        banco_agencia: pm?.bankAgency ?? "",
        banco_conta: pm?.bankAccount ?? "",
        veiculo_placa: maskPlate(transport.vehicle.plate),
        veiculo_descricao: `${transport.vehicle.brand} ${transport.vehicle.model}`,
        hora_saida: transport.departureTime,
        hora_retorno: parsed.data.returnTime,
        municipio_destino: parsed.data.destinationCity,
        data_pedido: new Date(parsed.data.orderDate).toLocaleDateString(
          "pt-BR",
          {
            timeZone: "UTC",
          },
        ),
        data_ida: new Date(parsed.data.departureDate).toLocaleDateString(
          "pt-BR",
          {
            timeZone: "UTC",
          },
        ),
        data_volta: new Date(parsed.data.returnDate).toLocaleDateString(
          "pt-BR",
          {
            timeZone: "UTC",
          },
        ),
        valor_diaria: parsed.data.dailyValue,
        periodo_deslocamento: input.travelPeriod,
        motivo: parsed.data.reason,
        total_passageiros: String(totalPassengers),
        pernoite_sim: parsed.data.overnight ? "X" : " ",
        pernoite_nao: parsed.data.overnight ? " " : "X",
      };

      const zip = new PizZip(Buffer.from(templateRecord.fileData));
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => "",
      });
      doc.render(data);

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const fileName = `Diária_${transport.driver.name.replace(/\s+/g, "_")}.docx`;

      return { fileName, fileData: Array.from(buffer) };
    });
  },
);

export const generateRouteMap = withPermission(
  "read",
  "documents",
  async (
    input: GenerateRouteMapFormData,
  ): Promise<ActionResult<{ fileName: string; fileData: number[] }>> => {
    return createResult(async () => {
      const parsed = generateRouteMapSchema.safeParse(input);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const templateRecord = await prisma.documentTemplate.findUnique({
        where: { type: "ROUTE_MAP" },
        select: { fileData: true, fileName: true },
      });
      if (!templateRecord)
        throw new Error("Template de mapa de rotas não cadastrado");

      const transport = await prisma.transport.findUnique({
        where: { id: parsed.data.transportId },
        select: GENERATE_DOCUMENT_ROUTE_MAP_SELECT,
      });

      if (!transport) throw new Error("Transporte não encontrado");

      type Consulta = {
        consulta_data: string;
        consulta_hora: string;
        consulta_especialidade: string;
        local_espera: string;
      };
      type Paciente = {
        paciente_nome: string;
        paciente_telefone: string;
        paciente_acompanhante: boolean;
        acompanhante_nome: string;
        acompanhante_telefone: string;
        consultas: Consulta[];
      };
      type Unidade = {
        unidade_saude_nome: string;
        unidade_saude_cnpj: string;
        unidade_saude_contato: string;
        unidade_saude_tipo: string;
        unidade_saude_rua: string;
        unidade_saude_numero: string;
        unidade_saude_complemento: string;
        unidade_saude_bairro: string;
        unidade_saude_cidade: string;
        unidade_saude_estado: string;
        unidade_saude_cep: string;
        pacientes: Paciente[];
        _patientsById: Map<string, Paciente>;
      };

      const unitMap = new Map<string, Unidade>();

      for (const { appointment } of transport.appointments) {
        const u = appointment.healthUnit;

        let unit = unitMap.get(u.id);
        if (!unit) {
          unit = {
            unidade_saude_nome: u.unitName,
            unidade_saude_cnpj: maskCNPJ(u.cnpj),
            unidade_saude_contato: maskPhone(u.phone),
            unidade_saude_tipo: u.unitType,
            unidade_saude_rua: u.address.street,
            unidade_saude_numero: u.address.number,
            unidade_saude_complemento: u.address.complement ?? "",
            unidade_saude_bairro: u.address.district,
            unidade_saude_cidade: u.address.city,
            unidade_saude_estado: u.address.state,
            unidade_saude_cep: maskZipCode(u.address.zipCode),
            pacientes: [],
            _patientsById: new Map(),
          };
          unitMap.set(u.id, unit);
        }

        const consulta: Consulta = {
          consulta_data: new Date(appointment.date).toLocaleDateString(
            "pt-BR",
            {
              timeZone: "UTC",
            },
          ),
          consulta_hora: appointment.time,
          consulta_especialidade: appointment.healthSpecialty.name,
          local_espera: appointment.waitingPlace.name,
        };

        const existing = unit._patientsById.get(appointment.patient.id);
        if (existing) {
          existing.consultas.push(consulta);
        } else {
          const paciente: Paciente = {
            paciente_nome: appointment.patient.name,
            paciente_telefone: maskPhone(appointment.patient.phone),
            paciente_acompanhante: appointment.hasCompanion,
            acompanhante_nome: appointment.companion?.name ?? "",
            acompanhante_telefone: maskPhone(appointment.companion?.phone),
            consultas: [consulta],
          };
          unit._patientsById.set(appointment.patient.id, paciente);
          unit.pacientes.push(paciente);
        }
      }

      const unidades = Array.from(unitMap.values())
        .map(({ _patientsById, ...unit }) => {
          void _patientsById;
          unit.pacientes.sort((a, b) =>
            a.paciente_nome.localeCompare(b.paciente_nome, "pt-BR"),
          );
          for (const paciente of unit.pacientes) {
            paciente.consultas.sort((a, b) =>
              a.consulta_hora.localeCompare(b.consulta_hora, "pt-BR"),
            );
          }
          return unit;
        })
        .sort((a, b) =>
          a.unidade_saude_nome.localeCompare(b.unidade_saude_nome, "pt-BR"),
        );

      const data = {
        data_viagem: new Date(transport.date).toLocaleDateString("pt-BR", {
          timeZone: "UTC",
        }),
        hora_saida: transport.departureTime,
        motorista_nome: transport.driver.name,
        veiculo_placa: maskPlate(transport.vehicle.plate),
        veiculo_descricao: `${transport.vehicle.brand} ${transport.vehicle.model}`,
        unidades,
      };

      const zip = new PizZip(Buffer.from(templateRecord.fileData));
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        nullGetter: () => "",
      });
      doc.render(data);

      const buffer = doc.getZip().generate({ type: "nodebuffer" });
      const fileName = `Mapa_Rotas_${transport.driver.name.replace(/\s+/g, "_")}.docx`;

      return { fileName, fileData: Array.from(buffer) };
    });
  },
);
