export type TemplateKey = { key: string; description: string };

export type TemplateKeyGroup = {
  title: string;
  description?: string;
  loop?: string;
  keys: TemplateKey[];
};

export type TemplateKeysDoc = {
  title: string;
  intro: string;
  groups: TemplateKeyGroup[];
  loopExample?: string;
};

export const DAILY_TEMPLATE_KEYS: TemplateKeysDoc = {
  title: "Solicitação de diária",
  intro:
    "Escreva as chaves abaixo entre chaves simples no modelo .docx, ex.: {motorista_nome}.",
  groups: [
    {
      title: "Campos disponíveis",
      keys: [
        { key: "motorista_nome", description: "Nome do motorista" },
        { key: "motorista_cpf", description: "CPF do motorista (formatado)" },
        { key: "motorista_rg", description: "RG do motorista" },
        {
          key: "motorista_cargo",
          description: "Cargo/função (padrão: Motorista)",
        },
        { key: "banco_nome", description: "Banco do método de pagamento" },
        { key: "banco_agencia", description: "Agência bancária" },
        { key: "banco_conta", description: "Conta bancária" },
        { key: "veiculo_placa", description: "Placa do veículo (formatada)" },
        { key: "veiculo_descricao", description: "Marca e modelo do veículo" },
        { key: "hora_saida", description: "Horário de saída do transporte" },
        { key: "hora_retorno", description: "Horário de retorno informado" },
        { key: "municipio_destino", description: "Município de destino" },
        { key: "data_pedido", description: "Data do pedido" },
        { key: "data_ida", description: "Data de ida" },
        { key: "data_volta", description: "Data de volta" },
        { key: "valor_diaria", description: "Valor da diária" },
        { key: "periodo_deslocamento", description: "Período de deslocamento" },
        { key: "motivo", description: "Motivo do deslocamento" },
        {
          key: "total_passageiros",
          description: "Total de passageiros (pessoas únicas)",
        },
        {
          key: "pernoite_sim",
          description: '"X" se necessita pernoite, senão vazio',
        },
        {
          key: "pernoite_nao",
          description: '"X" se NÃO necessita pernoite, senão vazio',
        },
      ],
    },
  ],
};

export const ROUTE_MAP_TEMPLATE_KEYS: TemplateKeysDoc = {
  title: "Mapa de rotas",
  intro:
    "Campos gerais usam chaves simples, ex.: {data_viagem}. As listas (unidades → pacientes → consultas) usam loops aninhados — veja o exemplo no fim.",
  groups: [
    {
      title: "Campos gerais",
      keys: [
        { key: "data_viagem", description: "Data da viagem" },
        { key: "hora_saida", description: "Horário de saída" },
        { key: "motorista_nome", description: "Nome do motorista" },
        { key: "veiculo_placa", description: "Placa do veículo (formatada)" },
        { key: "veiculo_descricao", description: "Marca e modelo do veículo" },
      ],
    },
    {
      title: "Unidades de saúde",
      description: "Repetidas para cada unidade do transporte.",
      loop: "unidades",
      keys: [
        { key: "unidade_saude_nome", description: "Nome da unidade" },
        { key: "unidade_saude_cnpj", description: "CNPJ (formatado)" },
        { key: "unidade_saude_contato", description: "Telefone (formatado)" },
        { key: "unidade_saude_tipo", description: "Tipo da unidade" },
        { key: "unidade_saude_rua", description: "Logradouro" },
        { key: "unidade_saude_numero", description: "Número" },
        { key: "unidade_saude_complemento", description: "Complemento" },
        { key: "unidade_saude_bairro", description: "Bairro" },
        { key: "unidade_saude_cidade", description: "Cidade" },
        { key: "unidade_saude_estado", description: "Estado (UF)" },
        { key: "unidade_saude_cep", description: "CEP (formatado)" },
      ],
    },
    {
      title: "Pacientes (dentro de cada unidade)",
      description:
        "Repetidos para cada paciente da unidade. Um paciente com várias consultas aparece uma única vez.",
      loop: "pacientes",
      keys: [
        { key: "paciente_nome", description: "Nome do paciente" },
        { key: "paciente_telefone", description: "Telefone (formatado)" },
        {
          key: "paciente_acompanhante",
          description: "Booleano — use como {#paciente_acompanhante}…{/}",
        },
        { key: "acompanhante_nome", description: "Nome do acompanhante" },
        {
          key: "acompanhante_telefone",
          description: "Telefone do acompanhante (formatado)",
        },
      ],
    },
    {
      title: "Consultas (dentro de cada paciente)",
      description: "Repetidas para cada consulta do paciente naquela unidade.",
      loop: "consultas",
      keys: [
        { key: "consulta_data", description: "Data da consulta" },
        { key: "consulta_hora", description: "Horário da consulta" },
        { key: "consulta_especialidade", description: "Especialidade" },
        { key: "local_espera", description: "Local de espera" },
      ],
    },
  ],
  loopExample: `{#unidades}
{unidade_saude_nome} — {unidade_saude_cidade}/{unidade_saude_estado}
CNPJ: {unidade_saude_cnpj}  Contato: {unidade_saude_contato}

  {#pacientes}
  {paciente_nome} — {paciente_telefone}
  {#paciente_acompanhante}Acompanhante: {acompanhante_nome} ({acompanhante_telefone}){/paciente_acompanhante}

    {#consultas}
    {consulta_hora} — {consulta_especialidade} ({local_espera})
    {/consultas}
  {/pacientes}
{/unidades}`,
};
