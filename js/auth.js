// ============================================================
// PISOS CONNECT — AUTH GUARD + HELPERS
// Inclui em toda página protegida antes do script da página
// ============================================================

const Auth = (() => {

    // Detecta se está numa página admin
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const isLoginPage = window.location.pathname.includes('login');

    /**
     * Guard de rota: redireciona se não autenticado.
     * Chame em toda página protegida.
     * @param {object} opcoes - { requireAdmin: bool }
     */
    async function requireAuth(opcoes = {}) {
        const sessao = await DB.getSessao();
        if (!sessao) {
            window.location.replace(CONFIG.rotas.login);
            return null;
        }
        if (opcoes.requireAdmin) {
            const perfil = await DB.getPerfil(sessao.user.id);
            if (!perfil || perfil.role !== 'admin') {
                window.location.replace(CONFIG.rotas.home);
                return null;
            }
        }
        return sessao;
    }

    /**
     * Se já logado, vai direto para o home (ou admin).
     * Chame na página de login.
     */
    async function redirectIfLogged() {
        const sessao = await DB.getSessao();
        if (!sessao) return;
        const perfil = await DB.getPerfil(sessao.user.id);
        if (perfil?.role === 'admin') {
            window.location.replace(CONFIG.rotas.admin);
        } else if (perfil?.role === 'profissional') {
            window.location.replace(CONFIG.rotas.minhaLoja);
        } else {
            window.location.replace(CONFIG.rotas.home);
        }
    }

    /**
     * Preenche o nome do usuário em elementos com [data-user-nome].
     */
    async function preencherNomeUsuario() {
        const sessao = await DB.getSessao();
        if (!sessao) return;
        const perfil = await DB.getPerfil(sessao.user.id);
        const nome = perfil?.nome || sessao.user.email?.split('@')[0] || 'Cliente';
        document.querySelectorAll('[data-user-nome]').forEach(el => el.textContent = nome);
    }

    /**
     * Inicializa o botão de logout em elementos com id="btnLogout".
     */
    function inicializarLogout() {
        document.querySelectorAll('#btnLogout, [data-logout]').forEach(btn => {
            btn.addEventListener('click', () => DB.logout());
        });
    }

    /**
     * Retorna o perfil atual em cache do sessionStorage ou busca no banco.
     */
    async function getPerfilAtual() {
        const cached = sessionStorage.getItem('pisos_perfil');
        if (cached) return JSON.parse(cached);
        const sessao = await DB.getSessao();
        if (!sessao) return null;
        const perfil = await DB.getPerfil(sessao.user.id);
        sessionStorage.setItem('pisos_perfil', JSON.stringify(perfil));
        return perfil;
    }

    /**
     * Limpa o cache de perfil (chamar após logout ou atualização de perfil).
     */
    function limparCache() {
        sessionStorage.removeItem('pisos_perfil');
        sessionStorage.removeItem('pisos_sacola');
    }

    return { requireAuth, redirectIfLogged, preencherNomeUsuario, inicializarLogout, getPerfilAtual, limparCache };
})();
