# Norte Leads — Mini CRM Inteligente

## Sobre o projeto

O **Norte Leads** é um projeto acadêmico de automação e CRM criado para demonstrar, de forma prática, o fluxo:

**Lead chegou → lógica acontece → ação é tomada.**

A aplicação captura dados comerciais, qualifica automaticamente cada oportunidade e apresenta um direcionamento para o atendimento.

## Contexto

A **Norte Atelier** é uma empresa fictícia de moda feminina B2B voltada para lojistas. O Norte Leads representa uma ferramenta de apoio à organização e à priorização de potenciais clientes da marca.

## Fluxo da automação

1. **Captura do lead:** coleta dados de contato, perfil comercial, interesse e prazo de compra.
2. **Lead Scoring:** calcula uma pontuação de 0 a 100 a partir das respostas comerciais.
3. **Classificação:** identifica o lead como Frio, Morno ou Quente.
4. **Definição de prioridade:** atribui prioridade baixa, média ou alta.
5. **Próxima ação:** indica o direcionamento comercial mais adequado.
6. **Geração de mensagem:** cria uma abordagem personalizada para WhatsApp.
7. **Armazenamento no CRM:** salva o lead e seu resultado no navegador.
8. **Priorização comercial:** organiza a base para facilitar o atendimento das melhores oportunidades.

## Funcionalidades

- formulário responsivo para captura de leads;
- validação dos campos obrigatórios;
- cálculo automático da pontuação e exibição de sua composição;
- classificação em Frio, Morno ou Quente;
- definição automática de prioridade, próxima ação, orientação e motivo;
- geração de mensagem comercial personalizada;
- opções para copiar a mensagem ou abrir a conversa no WhatsApp, sem envio automático;
- armazenamento de vários leads no `localStorage`;
- Mini CRM com resumo, detalhes e exclusão individual de leads;
- dashboard com total de leads e indicadores por classificação;
- filtros por classificação;
- ordenação por pontuação ou data de cadastro;
- interface responsiva para computadores, tablets e smartphones.

## Lead Scoring

A pontuação considera quatro critérios: existência de loja, volume médio de compra, principal interesse e prazo previsto para compra. A soma pode variar de 0 a 100 e determina a classificação:

- **0–39:** Frio;
- **40–69:** Morno;
- **70–100:** Quente.

## Tecnologias

- HTML
- CSS
- JavaScript
- localStorage

## Persistência

Os leads são armazenados no `localStorage` do navegador porque o projeto é uma demonstração acadêmica sem infraestrutura de servidor. Os dados permanecem disponíveis após o recarregamento da página no mesmo navegador.

Em uma aplicação real, a persistência seria feita por um backend integrado a um banco de dados, com os controles adequados de acesso, segurança e disponibilidade.

## Execução

O Norte Leads também possui uma [versão web publicada através do GitHub Pages](https://gustavoroden.github.io/norte-leads/).

Não é necessário instalar dependências nem executar um processo de build:

1. baixe ou clone este repositório;
2. abra o arquivo `index.html` em um navegador;
3. preencha o formulário e cadastre um lead;
4. consulte o resultado e acompanhe os registros no Mini CRM.

## Status

**Projeto concluído.**
