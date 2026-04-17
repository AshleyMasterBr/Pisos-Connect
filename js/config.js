// ============================================================
// PISOS CONNECT — CONFIG CENTRAL
// ============================================================

const CONFIG = {
    app: {
        nome: "Pisos Connect",
        versao: "1.0.0",
        slogan: "O piso certo. Na hora certa. Na sua porta."
    },

    supabase: {
        url: "https://zirxhuencjkjldmlumlt.supabase.co",
        anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppcnhodWVuY2pramxkbWx1bWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTEzNTgsImV4cCI6MjA5MTkyNzM1OH0.60T7ysEztHLCELF4vynXiWDwXwOz0WsK1eSJTQ-G8SM"
    },

    empresa: {
        whatsapp: "5511910620140", // Número do Denis — atualizar
        cidade: "São Paulo, SP"
    },

    // Fator de quebra técnica (10% — padrão do setor)
    fator_quebra: 1.10,

    // Rotas do app
    rotas: {
        login: "/login.html",
        home: "/app/home.html",
        catalogo: "/app/catalogo.html",
        produto: "/app/produto.html",
        sacola: "/app/sacola.html",
        pedidos: "/app/pedidos.html",
        admin: "/admin/index.html",
        minhaLoja: "/app/minha-loja.html"
    },

    // Template da mensagem WhatsApp ao confirmar pedido
    mensagemWhatsApp: (pedido) =>
        `Olá! Acabei de fazer um pedido pelo *Pisos Connect* 🏠\n\n` +
        ` *Pedido:* #${pedido.numero || 'Novo'}\n` +
        ` *Itens:* ${pedido.resumo}\n` +
        ` *Total:* ${pedido.valorFormatado}\n` +
        ` *Entrega:* ${pedido.endereco}\n` +
        ` *Pagamento:* Pagar na Entrega (COD)\n\n` +
        `Pode confirmar?`
};
