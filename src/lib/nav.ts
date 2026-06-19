import {
  LucideIcon,
  LayoutDashboard,
  ShieldUser,
  UsersRound,
  CarTaxiFront,
  Car,
  Stethoscope,
  Hospital,
  CalendarIcon,
  Ambulance,
  ScrollText,
  FileSearchCorner,
} from "lucide-react";
import { Resource, Action } from "./permissions";

export type NavChild = {
  label: string;
  href: string;
} & (
  | { public: true; resource?: never; action?: never }
  | { public?: false; resource: Resource; actions: Action[] }
);

export type NavItem = {
  label: string;
  icon: LucideIcon;
} & (
  | {
      href: string;
      children?: never;
      public: true;
      resource?: never;
      action?: never;
    }
  | {
      href: string;
      children?: never;
      public?: false;
      resource: Resource;
      actions: Action[];
    }
  | { href?: never; children: NavChild[]; resource?: never; action?: never }
);

export type NavSection = {
  label?: string;
  items: NavItem[];
};

const NAV_ROUTES: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    public: true,
    icon: LayoutDashboard,
  },
  {
    label: "Usuários",
    icon: ShieldUser,
    children: [
      {
        label: "Criar",
        href: "/dashboard/admin/users/create",
        resource: "user",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/admin/users/manage",
        resource: "user",
        actions: ["read", "update", "delete"],
      },
      {
        label: "Permissões",
        href: "/dashboard/admin/users/permissions",
        resource: "user",
        actions: ["read", "update"],
      },
    ],
  },
  {
    label: "Documentos",
    icon: FileSearchCorner,
    children: [
      {
        label: "Templates",
        href: "/dashboard/admin/documents/templates",
        resource: "documents",
        actions: ["create", "read", "update", "delete"],
      },
      {
        label: "Diárias",
        href: "/dashboard/admin/documents/daily",
        resource: "documents",
        actions: ["read"],
      },
      {
        label: "Mapa de Rotas",
        href: "/dashboard/admin/documents/route-map",
        resource: "documents",
        actions: ["read"],
      },
    ],
  },
  {
    label: "Relatórios",
    icon: ScrollText,
    children: [
      {
        label: "Relatório Agendamentos",
        href: "/dashboard/admin/reports/appointments",
        resource: "appointment_report",
        actions: ["read"],
      },
      {
        label: "Relatório Transportes",
        href: "/dashboard/admin/reports/transports",
        resource: "transport_report",
        actions: ["read"],
      },
    ],
  },
  {
    label: "Pessoas",
    icon: UsersRound,
    children: [
      {
        label: "Criar",
        href: "/dashboard/person/create",
        resource: "person",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/person/manage",
        resource: "person",
        actions: ["read", "update", "delete"],
      },
    ],
  },
  {
    label: "Motoristas",
    icon: CarTaxiFront,
    children: [
      {
        label: "Criar",
        href: "/dashboard/driver/create",
        resource: "driver",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/driver/manage",
        resource: "driver",
        actions: ["read", "update", "delete"],
      },
    ],
  },
  {
    label: "Veículos",
    icon: Car,
    children: [
      {
        label: "Criar",
        href: "/dashboard/vehicle/create",
        resource: "vehicle",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/vehicle/manage",
        resource: "vehicle",
        actions: ["read", "update", "delete"],
      },
    ],
  },
  {
    label: "Especialidades",
    icon: Stethoscope,
    children: [
      {
        label: "Criar",
        href: "/dashboard/health-specialty/create",
        resource: "healthSpecialty",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/health-specialty/manage",
        resource: "healthSpecialty",
        actions: ["read", "update", "delete"],
      },
    ],
  },
  {
    label: "Unidades de Saúde",
    icon: Hospital,
    children: [
      {
        label: "Criar",
        href: "/dashboard/health-unit/create",
        resource: "healthUnit",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/health-unit/manage",
        resource: "healthUnit",
        actions: ["read", "update", "delete"],
      },
    ],
  },
  {
    label: "Agendamentos",
    icon: CalendarIcon,
    children: [
      {
        label: "Novo agendamento",
        href: "/dashboard/appointment/create",
        resource: "appointment",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/appointment/manage",
        resource: "appointment",
        actions: ["read"],
      },
    ],
  },
  {
    label: "Transporte",
    icon: Ambulance,
    children: [
      {
        label: "Novo transporte",
        href: "/dashboard/transport/create",
        resource: "transport",
        actions: ["create"],
      },
      {
        label: "Gerenciar",
        href: "/dashboard/transport/manage",
        resource: "transport",
        actions: ["read"],
      },
      {
        label: "Locais de espera",
        href: "/dashboard/transport/waiting-place/manage",
        resource: "transport",
        actions: ["read"],
      },
    ],
  },
];

export const NAV_SECTIONS: NavSection[] = [
  {
    items: NAV_ROUTES.filter((r) =>
      ["Dashboard", "Agendamentos", "Transporte"].includes(r.label),
    ),
  },
  {
    label: "Cadastros",
    items: NAV_ROUTES.filter((r) =>
      [
        "Pessoas",
        "Motoristas",
        "Veículos",
        "Especialidades",
        "Unidades de Saúde",
      ].includes(r.label),
    ),
  },
  {
    label: "Controle interno",
    items: NAV_ROUTES.filter((r) =>
      ["Usuários", "Documentos", "Relatórios"].includes(r.label),
    ),
  },
];

export { NAV_ROUTES };
