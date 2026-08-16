# Norte Leads — Mini CRM Inteligente

O **Norte Leads** é a estrutura inicial de uma aplicação web para captura, qualificação e gerenciamento de leads B2B da **Norte Atelier**, uma confecção fictícia de moda feminina que vende no atacado para lojistas.

## Objetivo

O projeto tem como objetivo evoluir para um mini CRM que apoie a captura, a qualificação e o gerenciamento de potenciais lojistas da Norte Atelier.

## Conceito do projeto

O fluxo que orientará as próximas etapas é **“Lead → Lógica → Ação”**: um lead chega ao sistema, uma lógica de qualificação é aplicada e uma próxima ação comercial é definida.

## Contexto acadêmico

A aplicação foi criada para uma atividade acadêmica sobre automação e CRM. Ela servirá como base para demonstrar, em etapas futuras, como dados de potenciais clientes podem apoiar a qualificação de leads e a definição de ações comerciais.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro

## Status do projeto

### Etapas concluídas

- **Etapa 1 — Estrutura inicial:** página de apresentação e arquivos-base da aplicação.
- **Etapa 2 — Captura do lead:** formulário responsivo para coleta dos dados básicos e comerciais de potenciais lojistas.
- **Etapa 3 — Lead Scoring e Classificação Automática:** concluída.
- **Etapa 4 — Próxima Ação Comercial Automática:** concluída.
- **Etapa 5 — Geração Automática de Mensagem para WhatsApp:** concluída.

Na Etapa 3, o sistema passou a utilizar as respostas comerciais do formulário para calcular automaticamente uma pontuação em uma escala de 0 a 100. Com base no resultado, cada lead é classificado como **Frio**, **Morno** ou **Quente**, e a composição dos pontos é apresentada após o cadastro.

Na Etapa 4, o sistema passou a transformar automaticamente a classificação do lead em uma prioridade e em uma próxima ação comercial, além de apresentar a orientação de atendimento e o motivo da decisão:

- **Quente:** contato comercial prioritário.
- **Morno:** catálogo + follow-up.
- **Frio:** nutrição e relacionamento.

Na Etapa 5, o sistema passou a gerar automaticamente uma abordagem comercial personalizada após a classificação do lead. A mensagem utiliza:

- nome do lead;
- nome da loja;
- classificação;
- principal interesse.

A abordagem gerada pode ser copiada para utilização pelo responsável comercial. O sistema não realiza o envio automático da mensagem e não possui integração com a API do WhatsApp.

O CRM e a persistência dos leads ainda serão implementados em etapas posteriores.

## Como visualizar

Abra o arquivo `index.html` em um navegador. Não é necessário instalar dependências ou executar um processo de build.
