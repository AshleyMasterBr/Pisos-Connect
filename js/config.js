// ============================================================
// PISOS CONNECT — CONFIG CENTRAL
// ============================================================

// Detecta automaticamente o prefixo do caminho (basePath).
// No GitHub Pages o site fica em /Pisos-Connect/; no Vercel/localhost fica em /.
// Ex.: pathname = "/Pisos-Connect/app/home.html" → basePath = "/Pisos-Connect"
const _basePath = (() => {
    const parts = window.location.pathname.split('/');
    // Se o segundo segmento não for uma página conhecida, é um subdiretório de deploy
    const knownRoots = ['app', 'admin', 'js', 'css', 'assets', ''];
    if (parts.length > 1 && !knownRoots.includes(parts[1]) && !parts[1].includes('.')) {
        return '/' + parts[1];
    }
    return '';
})();

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

    // Rotas do app — prefixadas com basePath para funcionar no GitHub Pages e Vercel
    rotas: {
        login:     _basePath + '/login.html',
        home:      _basePath + '/app/home.html',
        catalogo:  _basePath + '/app/catalogo.html',
        produto:   _basePath + '/app/produto.html',
        sacola:    _basePath + '/app/sacola.html',
        pedidos:   _basePath + '/app/pedidos.html',
        admin:     _basePath + '/admin/index.html',
        minhaLoja: _basePath + '/app/minha-loja.html'
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
