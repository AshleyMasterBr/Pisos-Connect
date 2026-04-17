// ============================================================
// PISOS CONNECT — SUPABASE CLIENT + AUTH + DATA ACCESS
// ============================================================

const DB = (() => {
    const { createClient } = window.supabase;
    const client = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);

    // ── AUTH ─────────────────────────────────────────────────

    async function loginEmail(email, senha) {
        const { data, error } = await client.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
        return data;
    }

    async function loginMagicLink(email) {
        const { error } = await client.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin + CONFIG.rotas.home }
        });
        if (error) throw error;
    }

    async function loginTelefone(telefone) {
        // Formato esperado: +5511999999999
        const { error } = await client.auth.signInWithOtp({ phone: telefone });
        if (error) throw error;
    }

    async function verificarOTP(telefone, token) {
        const { data, error } = await client.auth.verifyOtp({
            phone: telefone,
            token,
            type: 'sms'
        });
        if (error) throw error;
        return data;
    }

    async function cadastrar(email, senha, nome, whatsapp) {
        const { data, error } = await client.auth.signUp({
            email,
            password: senha,
            options: { data: { nome, whatsapp } }
        });
        if (error) throw error;
        // Cria perfil
        if (data.user) {
            await client.from('perfis').upsert({
                id: data.user.id,
                nome,
                whatsapp,
                role: 'cliente'
            });
        }
        return data;
    }

    async function logout() {
        await client.auth.signOut();
        window.location.href = CONFIG.rotas.login;
    }

    async function getSessao() {
        const { data } = await client.auth.getSession();
        return data.session;
    }

    async function getUsuarioAtual() {
        const { data } = await client.auth.getUser();
        return data.user;
    }

    async function getPerfil(userId) {
        const { data } = await client.from('perfis').select('*').eq('id', userId).single();
        return data;
    }

    // ── PRODUTOS ─────────────────────────────────────────────

    async function getProdutos(filtros = {}) {
        let query = client.from('produtos').select('*').eq('ativo', true);
        if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
        if (filtros.destaque) query = query.eq('destaque', true);
        const { data, error } = await query.order('destaque', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function getProduto(id) {
        const { data, error } = await client.from('produtos').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
    }

    async function upsertProduto(produto) {
        const { data, error } = await client.from('produtos').upsert(produto).select().single();
        if (error) throw error;
        return data;
    }

    async function deletarProduto(id) {
        const { error } = await client.from('produtos').update({ ativo: false }).eq('id', id);
        if (error) throw error;
    }

    // ── PEDIDOS ──────────────────────────────────────────────

    async function criarPedido(pedido, itens) {
        const usuario = await getUsuarioAtual();
        // Insere o pedido
        const { data: pedidoData, error: pedidoError } = await client
            .from('pedidos')
            .insert({
                cliente_id: usuario.id,
                cliente_nome: pedido.clienteNome,
                cliente_whatsapp: pedido.clienteWhatsapp,
                endereco_entrega: pedido.enderecoEntrega,
                valor_total: pedido.valorTotal,
                observacoes: pedido.observacoes || null
            })
            .select()
            .single();
        if (pedidoError) throw pedidoError;

        // Insere os itens
        const itensComId = itens.map(item => ({ ...item, pedido_id: pedidoData.id }));
        const { error: itensError } = await client.from('pedido_itens').insert(itensComId);
        if (itensError) throw itensError;

        return pedidoData;
    }

    async function getMeusPedidos() {
        const { data, error } = await client
            .from('pedidos')
            .select('*, pedido_itens(*)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function getTodosPedidos() {
        const { data, error } = await client
            .from('pedidos')
            .select('*, pedido_itens(*), perfis(nome, whatsapp)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function atualizarStatusPedido(id, status) {
        const { error } = await client
            .from('pedidos')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error) throw error;
    }

    // ── PROFISSIONAIS ─────────────────────────────────────────

    async function getProfissionais(filtros = {}) {
        let query = client.from('profissionais').select('*').eq('status', 'ativo');
        if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
        if (filtros.destaque) query = query.eq('destaque', true);
        const { data, error } = await query.order('destaque', { ascending: false }).order('nome_empresa');
        if (error) throw error;
        return data || [];
    }

    async function getProfissional(id) {
        const { data, error } = await client
            .from('profissionais')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    }

    async function getProdutosDoProfissional(profissionalId) {
        const { data, error } = await client
            .from('produtos')
            .select('*')
            .eq('profissional_id', profissionalId)
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return data || [];
    }

    async function getServicosDoProfissional(profissionalId) {
        const { data, error } = await client
            .from('servicos')
            .select('*')
            .eq('profissional_id', profissionalId)
            .eq('ativo', true)
            .order('nome');
        if (error) throw error;
        return data || [];
    }

    async function cadastrarProfissional(dados) {
        const usuario = await getUsuarioAtual();
        const { data, error } = await client
            .from('profissionais')
            .insert({
                usuario_id: usuario?.id || null,
                nome_empresa: dados.nomeEmpresa,
                tipo: dados.tipo,
                descricao: dados.descricao || null,
                cidade: dados.cidade,
                whatsapp: dados.whatsapp,
                site: dados.site || null,
                status: 'pendente'
            })
            .select()
            .single();
        if (error) throw error;
        // Atualiza role do perfil para profissional
        if (usuario?.id) {
            await client.from('perfis')
                .update({ role: 'profissional' })
                .eq('id', usuario.id);
        }
        return data;
    }

    async function getMeuPerfil_Profissional() {
        const usuario = await getUsuarioAtual();
        if (!usuario) return null;
        const { data } = await client
            .from('profissionais')
            .select('*')
            .eq('usuario_id', usuario.id)
            .single();
        return data;
    }

    async function upsertServico(servico) {
        const { data, error } = await client.from('servicos').upsert(servico).select().single();
        if (error) throw error;
        return data;
    }

    async function getTodosProfissionais() {
        const { data, error } = await client
            .from('profissionais')
            .select('*')
            .order('status')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async function atualizarStatusProfissional(id, status) {
        const { error } = await client
            .from('profissionais')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    }

    // ── UPLOAD DE FOTOS ───────────────────────────────────────

    async function uploadFotoLoja(file, nomeArquivo) {
        const { data, error } = await client.storage
            .from('lojas_fotos')
            .upload(nomeArquivo, file, { cacheControl: '3600', upsert: true });
        if (error) throw error;
        
        const { data: { publicUrl } } = client.storage
            .from('lojas_fotos')
            .getPublicUrl(nomeArquivo);
        return publicUrl;
    }

    async function atualizarFotoProfissional(id, logo_url) {
        const { error } = await client.from('profissionais').update({ logo_url }).eq('id', id);
        if (error) throw error;
    }

    // ── UTILS ─────────────────────────────────────────────────

    function onAuthChange(callback) {
        return client.auth.onAuthStateChange(callback);
    }

    function onNovoPedido(callback) {
        return client
            .channel('pedidos')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, callback)
            .subscribe();
    }

    function onNovoProfissional(callback) {
        return client
            .channel('profissionais_pendentes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profissionais' }, callback)
            .subscribe();
    }

    return {
        client,
        // Auth
        loginEmail, loginMagicLink, loginTelefone, verificarOTP,
        cadastrar, logout, getSessao, getUsuarioAtual, getPerfil, onAuthChange,
        // Produtos
        getProdutos, getProduto, upsertProduto, deletarProduto,
        // Pedidos
        criarPedido, getMeusPedidos, getTodosPedidos, atualizarStatusPedido, onNovoPedido,
        // Profissionais
        getProfissionais, getProfissional, getProdutosDoProfissional,
        getServicosDoProfissional, cadastrarProfissional, getMeuPerfil_Profissional,
        upsertServico, getTodosProfissionais, atualizarStatusProfissional, onNovoProfissional,
        uploadFotoLoja, atualizarFotoProfissional
    };
})();
