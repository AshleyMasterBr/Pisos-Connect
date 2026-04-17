// ============================================================
// PISOS CONNECT — ENGINE DE CÁLCULO DE CUBAGEM
// Fórmula: Caixas = ⌈ (Área × 1.10) / m² por Caixa ⌉
// ============================================================

const Calculadora = (() => {

    /**
     * Calcula o número de caixas necessárias para cobrir uma área.
     * Inclui automaticamente 10% de sobra técnica (quebra/recortes).
     *
     * @param {number} areaMq - Área em metros quadrados
     * @param {number} m2PorCaixa - Metros quadrados cobertos por caixa do produto
     * @param {number} fatorQuebra - Fator de quebra (padrão: 1.10)
     * @returns {number} - Número de caixas (arredondado para cima)
     */
    function calcularCaixas(areaMq, m2PorCaixa, fatorQuebra = CONFIG.fator_quebra) {
        if (!areaMq || !m2PorCaixa || areaMq <= 0 || m2PorCaixa <= 0) return 0;
        return Math.ceil((areaMq * fatorQuebra) / m2PorCaixa);
    }

    /**
     * Retorna o valor total do pedido.
     * @param {number} caixas - Número de caixas
     * @param {number} precoM2 - Preço por m² do produto
     * @param {number} m2PorCaixa - Metros quadrados por caixa
     * @returns {number} - Valor total em reais
     */
    function calcularValorTotal(caixas, precoM2, m2PorCaixa) {
        const precoPorCaixa = precoM2 * m2PorCaixa;
        return caixas * precoPorCaixa;
    }

    /**
     * Executa o cálculo completo para um pedido.
     * @param {number} areaMq - Área em m²
     * @param {object} produto - Objeto do produto do catálogo
     * @returns {object} - Resultado completo do cálculo
     */
    function calcular(areaMq, produto) {
        const caixas = calcularCaixas(areaMq, produto.m2_por_caixa);
        const areaComQuebra = areaMq * CONFIG.fator_quebra;
        const precoPorCaixa = produto.preco_m2 * produto.m2_por_caixa;
        const valorTotal = calcularValorTotal(caixas, produto.preco_m2, produto.m2_por_caixa);

        return {
            area: areaMq,
            areaComQuebra: parseFloat(areaComQuebra.toFixed(2)),
            produto: produto.nome,
            produtoObj: produto,
            m2PorCaixa: produto.m2_por_caixa,
            caixas,
            precoPorCaixa: parseFloat(precoPorCaixa.toFixed(2)),
            valorTotal: parseFloat(valorTotal.toFixed(2)),
            valorFormatado: formatarMoeda(valorTotal),
            fatorQuebra: CONFIG.fator_quebra
        };
    }

    /**
     * Formata um número como moeda brasileira.
     * @param {number} valor
     * @returns {string}
     */
    function formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    /**
     * Valida a entrada de área do usuário.
     * @param {string|number} valor
     * @returns {{valido: boolean, area: number, erro: string}}
     */
    function validarArea(valor) {
        const area = parseFloat(String(valor).replace(',', '.'));
        if (isNaN(area) || area <= 0) {
            return { valido: false, area: 0, erro: 'Digite uma metragem válida (ex: 45 ou 45,5).' };
        }
        if (area < 1) {
            return { valido: false, area: 0, erro: 'A área mínima é 1 m².' };
        }
        if (area > 10000) {
            return { valido: false, area: 0, erro: 'Para áreas acima de 10.000 m², entre em contato direto.' };
        }
        return { valido: true, area, erro: null };
    }

    // API Pública
    return { calcular, calcularCaixas, calcularValorTotal, formatarMoeda, validarArea };

})();
