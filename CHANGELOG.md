# CHANGELOG — Pisos Connect

Todas as alterações relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.2.0] — 2026-04-16 🎨 Redesign Premium (Fim da Era Emoji)

### ✨ Adicionado
- **Fotografia Real de Pisos**: Fotos reais de estúdio incorporadas aos cards de produto (`app/home.html`, `app/catalogo.html`, `app/produto.html`) substituindo os antigos padrões geométricos e blocos de cor.
- **Sistema de Ícones SVG Lineares**: Todos os emojis da interface de usuário foram removidos e substituídos por um sistema de SVGs padronizado, afetando navegação, empty states e botões de contato.
- **Avatares Profissionais Iniciais**: Profissionais e Lojas não têm mais carinhas "🏢" e sim avatares com as iniciais da empresa gerados dinamicamente em backgrounds gradientes.

### 🔧 Atualizado
- `app/sacola.html` e `app/pedidos.html`: UI refeita sem emojis (`🛒`, `📦`, `✅`), troca por badge SVG de Sucesso e lixeirinha outline.
- `registro-profissional.html`: UI limpa de emojis (botão de categoria agora tem vetores), mensagem pendente otimizada.
- `admin/index.html` e `admin/profissionais.html`: Dashboard administrador completamente livre de emojis. Nova status navigation e métricas atualizadas. Service Worker (`sw.js`) atualizado para forçar cache clear (v2).

---

## [1.1.0] — 2026-04-16 🏪 Marketplace de Profissionais

### ✨ Adicionado

#### Profissionais — Lado B do Marketplace
- **Cadastro de Profissionais** (`registro-profissional.html`) — formulário com seleção de tipo (loja, fábrica, instalador), campos de empresa, e seção condicional de serviços para instaladores
- **Listagem de Profissionais** (`app/profissionais.html`) — grid 2 colunas com filtros por tipo e banner CTA de cadastro
- **Perfil do Profissional** (`app/profissional.html`) — hero visual, descrição, lista de serviços com preço/m², grid de produtos vinculados, botão fixo de orçamento via WhatsApp
- **Modelo Híbrido (Instaladores)** — instaldores podem ter serviços (mão de obra) + produtos opcionais
- **Curadoria Manual** — todos os cadastros entram como `pendente` e precisam de aprovação do Denis

#### Admin
- **Painel de Profissionais** (`admin/profissionais.html`) — KPIs (pendentes/ativos/lojas/instaladores), filtro por status, aprovação em 1 clique, modal de revisão detalhada, listener realtime de novos cadastros
- Link "Profissionais" adicionado à sidebar do admin

#### Banco de Dados (`migrate_v1_1.sql`)
- Tabela `profissionais` — perfil completo com status de aprovação e curadoria
- Tabela `servicos` — serviços de mão de obra vinculados ao instalador
- `produtos.profissional_id` — FK para vincular produtos ao profissional (Opção A: catálogo global)
- RLS completo para as novas tabelas
- Role `profissional` adicionado ao constraint de `perfis`
- 3 profissionais placeholder para teste

#### PWA
- ✅ Service Worker registrado em todas as páginas do app
- ✅ Ícones 192x192 e 512x512 gerados e copiados para `assets/icons/`

#### Visual (Redesign)
- Bottom nav completamente reformulada com **ícones SVG** — removidos emojis
- 5 itens na nav: Início, Catálogo, **Parceiros**, Sacola, Pedidos
- Indicador ativo com barra superior + glow sutil
- Saudação na home refinada — hierarquia correta (label uppercase pequeno + nome médio)
- Barra de busca com bordas full-pill e interação hover
- Banner hero com duplo gradiente radial (coral + dourado)
- Cards de produto com hover `translateY` + box-shadow em vez de scale
- Backgrounds de thumb dos cards mais profundos e saturados
- Badge de destaque com backdrop-filter
- Paleta ligeiramente mais escura e saturada para mais contraste

### 🔧 Atualizado
- `js/supabase.js` — 10 novos métodos para profissionais e serviços + `onNovoProfissional` realtime
- `css/app.css` — redesign completo do sistema de navegação e melhorias gerais
- `app/home.html` — seção de profissionais com scroll horizontal + cards com skeleton loaders
- `admin/index.html` — novo link de profissionais na sidebar

---



Todas as alterações relevantes do projeto são documentadas aqui.
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.0.0] — 2026-04-16 🚀 MVP Launch

### ✨ Adicionado

#### App do Cliente (PWA/APK)
- **Login** com 3 métodos: Email + Senha, Magic Link e Telefone + OTP (SMS)
- **Cadastro** de novos clientes com nome, email e WhatsApp
- **Home** com banner de destaque, scroll de categorias e grid de produtos em destaque
- **Catálogo** com busca em tempo real por nome/fornecedor e filtros por tipo de piso
- **Detalhe do Produto** com hero visual, meta chips e calculadora de cubagem embutida
- **Calculadora de Cubagem** com fórmula `⌈(Área × 1.10) / m²_por_caixa⌉` — 10% de quebra técnica inclusa
- **Sacola** com CRUD de itens, pré-preenchimento do perfil do cliente e form de entrega
- **Checkout COD** — pedido salvo no banco + mensagem automática gerada para o WhatsApp do Denis
- **Histórico de Pedidos** com status visual colorido (aguardando, confirmado, em entrega, entregue)
- **Bottom Navigation Bar** — Home / Catálogo / Sacola / Pedidos
- **Guard de Rota** por role (`cliente` / `admin`) com redirect automático

#### Painel Admin (Dashboard Web)
- **Dashboard** com KPIs em tempo real: pedidos do dia, aguardando, faturamento, total geral
- **Kanban de Pedidos** — 4 colunas drag-free com update de status via modal
- **Modal de Detalhe** — ver cliente, endereço, itens do pedido e atualizar status
- **Botão WhatsApp** por pedido — abre conversa direta com o cliente
- **CRUD de Produtos** — criar, editar, ativar/desativar com toggle
- **Importação CSV** de catálogo no formato `sku,nome,tipo,preco_m2,m2_por_caixa,fornecedor`
- **Realtime** — novo pedido dispara toast e atualiza kanban sem reload
- **Guard Admin** — acesso bloqueado para clientes comuns

#### Backend / Banco de Dados (Supabase)
- Tabelas: `produtos`, `pedidos`, `pedido_itens`, `perfis`
- **Trigger automático** de criação de perfil ao cadastrar usuário
- **Row Level Security (RLS)** — cliente vê apenas seus dados; admin acessa tudo
- Catálogo placeholder com 6 produtos para teste imediato
- Suporte a Supabase Auth: email, magic link e phone OTP

#### PWA
- `manifest.json` — instalável como APK no Android (display: standalone)
- `sw.js` — Service Worker com cache offline do shell do app

#### Design System
- **Identidade visual própria** — sem relação com os projetos Budget Machine/MdO
- Paleta: Grafite escuro + Coral (`#E94560`) + Dourado (`#F5A623`) + Verde sucesso
- Tipografia: `Syne` (títulos) + `DM Sans` (corpo)
- Animações de transição, skeleton loaders, toasts de feedback
- Dois sistemas CSS independentes: `app.css` (mobile) e `admin.css` (dashboard)

---

### 🔧 Configurado

- `js/config.js` — WhatsApp Denis: `5511910620140`
- Supabase URL: `https://zirxhuencjkjldmlumlt.supabase.co`
- Fallback `wa.me/` ativo para o WhatsApp (Evolution API planejada para Fase 4)

---

## Roadmap — Próximas Versões

### [1.1.0] — Fase 2 (Previsto)
- [ ] Registro do Service Worker nas páginas do app
- [ ] Ícones PWA (192x512) — Denis fornece a logo
- [ ] Rodar `database.sql` no Supabase e promover conta admin
- [ ] Página de perfil do cliente (editar nome, WhatsApp, endereço padrão)
- [ ] Upload de foto de produto no admin (Supabase Storage)
- [ ] Hostear no GitHub Pages ou Vercel

### [1.2.0] — Fase 3 (Previsto)
- [ ] Notificações push quando status do pedido muda
- [ ] Filtro de pedidos por data/status no admin
- [ ] Dashboard com gráfico de faturamento por semana
- [ ] Relatório exportável em CSV

### [2.0.0] — Fase 4 (Pós-tráfego)
- [ ] Integração com Evolution API para automação de WhatsApp
- [ ] Chatbot de triagem inicial
- [ ] Disparos em massa de atualização de status de entrega
- [ ] Portal de fornecedores para atualização de estoque/preço
