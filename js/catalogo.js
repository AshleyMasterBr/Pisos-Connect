// ============================================================
// PISOS CONNECT — CATÁLOGO E RENDERIZAÇÃO DE PRODUTOS
// ============================================================

const Catalogo = (() => {

    let _produtos = [];
    let _filtroAtivo = 'todos';

    /**
     * Inicializa o catálogo buscando produtos (Supabase ou local).
     */
    async function init() {
        _produtos = await SupabaseClient.buscarProdutos();
        renderizar();
        inicializarFiltros();
    }

    /**
     * Renderiza os cards de produtos no grid.
     */
    function renderizar(tipo = 'todos') {
        const grid = document.getElementById('catalogoGrid');
        if (!grid) return;

        const lista = tipo === 'todos'
            ? _produtos
            : _produtos.filter(p => p.tipo === tipo);

        if (lista.length === 0) {
            grid.innerHTML = `<div class="catalogo-vazio">Nenhum produto encontrado.</div>`;
            return;
        }

        grid.innerHTML = lista.map(produto => criarCard(produto)).join('');

        // Anima os cards conforme entram na tela
        grid.querySelectorAll('.produto-card').forEach((card, i) => {
            card.style.animationDelay = `${i * 60}ms`;
        });
    }

    /**
     * Cria o HTML de um card de produto.
     */
    function criarCard(produto) {
        const precoPorCaixa = (produto.preco_m2 * produto.m2_por_caixa).toFixed(2).replace('.', ',');
        const badgeDestaque = produto.destaque ? '<span class="badge-destaque">⭐ Destaque</span>' : '';
        const tipoCor = {
            'vinilico': 'badge-vinilico',
            'porcellanato': 'badge-porcellanato',
            'laminado': 'badge-laminado'
        }[produto.tipo] || '';

        const bgGradient = {
            'vinilico': 'linear-gradient(135deg, #2d5a27 0%, #4a7c3f 100%)',
            'porcellanato': 'linear-gradient(135deg, #3d3d5c 0%, #5c5c8a 100%)',
            'laminado': 'linear-gradient(135deg, #7c4a1e 0%, #a0622a 100%)'
        }[produto.tipo] || 'linear-gradient(135deg, #444 0%, #666 100%)';

        const iconeTipo = {
            'vinilico': '🏠',
            'porcellanato': '✨',
            'laminado': '🌲'
        }[produto.tipo] || '📦';

        return `
        <div class="produto-card" data-id="${produto.id}" onclick="Catalogo.selecionarProduto('${produto.id}')">
            <div class="produto-imagem" style="background: ${bgGradient}">
                <span class="produto-icone">${iconeTipo}</span>
                ${badgeDestaque}
                <span class="badge-tipo ${tipoCor}">${produto.tipLabel || produto.tipo}</span>
            </div>
            <div class="produto-info">
                <div class="produto-fornecedor">${produto.fornecedor}</div>
                <h3 class="produto-nome">${produto.nome}</h3>
                <p class="produto-descricao">${produto.descricao || ''}</p>
                <div class="produto-valores">
                    <div class="produto-preco">
                        <span class="preco-label">Preço por m²</span>
                        <span class="preco-valor">R$ ${produto.preco_m2.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div class="produto-caixa">
                        <span class="caixa-label">Caixa cobre</span>
                        <span class="caixa-valor">${produto.m2_por_caixa} m²</span>
                    </div>
                </div>
                <button class="btn-calcular-produto" onclick="event.stopPropagation(); Catalogo.calcularProduto('${produto.id}')">
                    📐 Calcular para este piso
                </button>
            </div>
        </div>`;
    }

    /**
     * Inicializa os botões de filtro por tipo.
     */
    function inicializarFiltros() {
        const filtros = document.querySelectorAll('[data-filtro]');
        filtros.forEach(btn => {
            btn.addEventListener('click', () => {
                filtros.forEach(b => b.classList.remove('ativo'));
                btn.classList.add('ativo');
                _filtroAtivo = btn.dataset.filtro;
                renderizar(_filtroAtivo);
            });
        });
    }

    /**
     * Seleciona um produto pelo ID e destaca o card.
     */
    function selecionarProduto(id) {
        document.querySelectorAll('.produto-card').forEach(c => c.classList.remove('selecionado'));
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) card.classList.add('selecionado');
    }

    /**
     * Seleciona o produto e abre a calculadora principal com ele pré-selecionado.
     */
    function calcularProduto(id) {
        const produto = _produtos.find(p => p.id === id || p.id === String(id));
        if (!produto) return;

        // Salva o produto selecionado no sessionStorage para a calculadora carregar
        sessionStorage.setItem('produtoSelecionado', JSON.stringify(produto));

        // Se a calculadora estiver na mesma página, atualiza o select
        const selectModelo = document.getElementById('produtoSelect');
        if (selectModelo) {
            selectModelo.value = produto.id;
            selectModelo.dispatchEvent(new Event('change'));
            document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Se em outra página, redireciona
            window.location.href = 'index.html#calculadora';
        }
    }

    /**
     * Retorna a lista de produtos carregada.
     */
    function getProdutos() {
        return _produtos;
    }

    /**
     * Retorna um produto pelo ID.
     */
    function getProduto(id) {
        return _produtos.find(p => String(p.id) === String(id));
    }

    // API Pública
    return { init, renderizar, selecionarProduto, calcularProduto, getProdutos, getProduto };

})();
