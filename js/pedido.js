// ============================================================
// PISOS CONNECT — LÓGICA DO PEDIDO E DISPARO WHATSAPP
// Sistema com fallback wa.me/ (Evolution API na Fase 4)
// ============================================================

const Pedido = (() => {

    // Estado atual do pedido (preenchido pela calculadora)
    let _estado = null;

    /**
     * Define o resultado do cálculo como pedido atual.
     * @param {object} resultadoCalculo - Saída do Calculadora.calcular()
     */
    function definir(resultadoCalculo) {
        _estado = { ...resultadoCalculo, timestamp: new Date().toISOString() };
    }

    /**
     * Retorna o estado atual do pedido.
     * @returns {object|null}
     */
    function obter() {
        return _estado;
    }

    /**
     * Gera a URL do WhatsApp com a mensagem pré-formatada.
     * Estratégia: wa.me/ direto (Phase 1). Evolution API na Fase 4.
     * @param {object} dados - Estado do pedido
     * @param {string} nomeCliente - Nome fornecido pelo cliente
     * @returns {string} URL completa do WhatsApp
     */
    function gerarLinkWhatsApp(dados, nomeCliente = '') {
        const telefone = CONFIG.empresa.whatsapp;
        const mensagem = CONFIG.mensagemWhatsApp({
            produto: dados.produto,
            area: dados.area,
            caixas: dados.caixas,
            valorFormatado: dados.valorFormatado
        });
        return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
    }

    /**
     * Fecha o pedido:
     * 1. Tenta salvar no Supabase (se conectado)
     * 2. Dispara o WhatsApp com a mensagem formatada
     * @param {string} nomeCliente
     * @param {string} whatsappCliente
     */
    async function fechar(nomeCliente, whatsappCliente) {
        if (!_estado) {
            console.error('[Pedido] Nenhum cálculo definido. Execute Pedido.definir() primeiro.');
            return;
        }

        // 1. Salvar no banco (silently fails se sem conexão)
        await SupabaseClient.salvarPedido({
            clienteNome: nomeCliente || 'Não informado',
            clienteWhatsapp: whatsappCliente || 'Não informado',
            produtoId: _estado.produtoObj?.id || null,
            area: _estado.area,
            caixas: _estado.caixas,
            valorTotal: _estado.valorTotal,
        });

        // 2. Abrir WhatsApp
        const link = gerarLinkWhatsApp(_estado, nomeCliente);
        window.open(link, '_blank');
    }

    // API Pública
    return { definir, obter, fechar, gerarLinkWhatsApp };

})();
