(function exposeWhatsAppMessaging(globalScope) {
  const approaches = {
    Quente: {
      opening: (name) => `Olá, ${name}! Tudo bem? Aqui é da Norte Atelier.`,
      closing:
        "Podemos conversar agora para entender o que faz mais sentido para a sua loja?",
    },
    Morno: {
      opening: (name) => `Olá, ${name}! Tudo bem? Aqui é da Norte Atelier.`,
      closing:
        "Se fizer sentido para o seu momento, posso te contar mais e ajudar nos próximos passos.",
    },
    Frio: {
      opening: (name) => `Oi, ${name}! Tudo bem? Aqui é da Norte Atelier.`,
      closing:
        "Fique à vontade para conhecer a gente no seu tempo. Será um prazer manter esse contato!",
    },
  };

  const interestMessages = {
    "Quero comprar": {
      Quente: (store) =>
        `Vi que a ${store} tem interesse em comprar nossas peças. Quero te apresentar a coleção e entender como podemos iniciar uma parceria de revenda.`,
      Morno: (store) =>
        `Que bom saber do interesse da ${store} em nossas peças! Posso apresentar a coleção e explicar com calma como funciona nossa parceria para revenda.`,
      Frio: (store) =>
        `Gostaria de apresentar nossas coleções à ${store} e deixar o caminho aberto para uma futura parceria de revenda.`,
    },
    "Quero receber o catálogo": {
      Quente: (store) =>
        `Recebi o pedido da ${store} e já quero te apresentar nosso catálogo. Posso enviá-lo por aqui e conversar sobre as peças que mais combinam com a loja?`,
      Morno: (store) =>
        `Será um prazer apresentar a coleção à ${store}. Posso te enviar nosso catálogo por aqui para você conhecer as peças com calma.`,
      Frio: (store) =>
        `Quero te apresentar um pouco do nosso trabalho e enviar o catálogo para a ${store} conhecer nossas peças sem compromisso.`,
    },
    "Quero conhecer a marca": {
      Quente: (store) =>
        `Quero apresentar a Norte Atelier e nossa coleção à ${store}. Podemos conversar para eu entender o perfil da loja e mostrar as peças mais alinhadas ao seu momento?`,
      Morno: (store) =>
        `Que bom ter a ${store} por aqui! Quero te apresentar a Norte Atelier, nossa coleção e a proposta que inspira cada peça.`,
      Frio: (store) =>
        `Que bom ter a ${store} por aqui! Gostaria de apresentar, com calma, a Norte Atelier e as histórias por trás da nossa coleção.`,
    },
  };

  function generateWhatsAppMessage(lead, classification) {
    const approach = approaches[classification];
    const interestMessage = interestMessages[lead.principalInteresse]?.[classification];

    if (!approach || !interestMessage) {
      throw new Error("Não foi possível gerar a mensagem para este perfil.");
    }

    const name = lead.nome.trim();
    const store = lead.nomeDaLoja.trim();
    return `${approach.opening(name)}\n\n${interestMessage(store)}\n\n${approach.closing}`;
  }

  const whatsAppMessaging = { generateWhatsAppMessage, approaches, interestMessages };
  globalScope.WhatsAppMessaging = whatsAppMessaging;

  if (typeof module !== "undefined" && module.exports) {
    module.exports = whatsAppMessaging;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
