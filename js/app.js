/**
 * LOGAPONT - Lógica Principal da Aplicação
 */

const App = {
    user: null,
    currentView: 'kanban',

    init() {
        console.log('LOGAPONT Iniciado');
        this.initTheme();
        AuthModule.init();
        this.bindGlobalEvents();
    },

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.renderTopbar();
        lucide.createIcons();
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));

        // Re-render components that might need resizing
        if (this.currentView === 'kanban') KanbanModule.render();
        lucide.createIcons();
    },

    /**
     * Renderiza o shell da aplicação após login
     */
    async showApp(user) {
        this.user = user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');

        // Restore sidebar state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            document.getElementById('sidebar').classList.add('collapsed');
        }

        this.renderSidebar();
        this.renderTopbar();
        this.switchView('kanban');
    },

    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="p-6 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-xl bg-blue-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                        <i data-lucide="package" class="w-6 h-6"></i>
                    </div>
                    <div class="brand-info">
                        <h1 class="font-bold text-xl tracking-tight brand-font text-white uppercase">LOGAPONT</h1>
                        <p class="text-[10px] uppercase tracking-widest text-blue-400 font-bold text-nowrap">NobelPack</p>
                    </div>
                </div>
            </div>

            <nav class="flex-1 px-4 py-4 flex flex-col gap-2">
                <button onclick="App.switchView('kanban')" id="nav-kanban" class="nav-btn active" title="Painel Kanban">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Painel Kanban</span>
                </button>
                <button onclick="App.switchView('movimentacoes')" id="nav-movimentacoes" class="nav-btn" title="Histórico de Movimentações">
                    <i data-lucide="list"></i>
                    <span>Movimentações</span>
                </button>
                <button onclick="App.switchView('indicadores')" id="nav-indicadores" class="nav-btn" title="Indicadores de BI">
                    <i data-lucide="bar-chart-3"></i>
                    <span>Indicadores</span>
                </button>
                <button onclick="App.switchView('produtos')" id="nav-produtos" class="nav-btn" title="Gestão de Produtos">
                    <i data-lucide="box"></i>
                    <span>Produtos</span>
                </button>
                ${this.user.perfil === 'ADMIN' ? `
                <button onclick="App.switchView('admin')" id="nav-admin" class="nav-btn" title="Gestão de Usuários">
                    <i data-lucide="shield-check"></i>
                    <span>Administração</span>
                </button>
                ` : ''}
            </nav>

            <div class="p-4 border-t border-slate-800 profile-section space-y-3">
                <div class="flex items-center gap-3 px-2">
                    <div class="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-white font-bold border border-slate-700">
                        ${this.user.nome.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold truncate text-white">${this.user.nome}</p>
                        <p class="text-[10px] text-slate-500 uppercase font-bold truncate">${this.user.setor}</p>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="AuthModule.changePassword()" class="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all">
                        <i data-lucide="key-round" class="w-3.5 h-3.5"></i> Senha
                    </button>
                    <button onclick="AuthModule.logout()" class="flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-400 rounded-xl text-xs font-semibold transition-all">
                        <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Sair
                    </button>
                </div>

                <div class="pt-2 text-center border-t border-slate-800/50">
                    <span class="text-[9px] font-bold uppercase tracking-widest text-slate-600">v1.0.0-beta</span>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    renderTopbar() {
        const topbar = document.getElementById('topbar');
        const isDark = document.documentElement.classList.contains('dark');

        topbar.innerHTML = `
            <div class="flex items-center gap-4">
                <button onclick="App.toggleSidebar()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Alternar Menu">
                    <i data-lucide="menu" class="w-5 h-5"></i>
                </button>
                <h2 id="view-title" class="text-lg font-semibold brand-font">Painel Operacional</h2>
            </div>

            <div class="flex items-center gap-4">
                <!-- Botão Nova Movimentação (Restaurado) -->
                <button onclick="KanbanModule.openNovaMovModal()" class="btn btn-primary h-10 px-6 hidden md:flex">
                    <i data-lucide="plus"></i> Nova Movimentação
                </button>

                <!-- Atalho Mobile -->
                <button onclick="KanbanModule.openNovaMovModal()" class="md:hidden p-2 bg-blue-600 text-white rounded-lg shadow-lg">
                    <i data-lucide="plus" class="w-5 h-5"></i>
                </button>

                <div class="h-8 w-[1px] bg-gray-200 dark:bg-slate-800 mx-1"></div>

                <button onclick="App.toggleTheme()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Alternar Tema">
                    <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
                </button>
            </div>
        `;
        lucide.createIcons();
    },

    switchView(view) {
        this.currentView = view;

        // Update Nav Active State
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`nav-${view}`);
        if (activeBtn) activeBtn.classList.add('active');

        // Render Module
        switch (view) {
            case 'kanban':
                KanbanModule.render();
                break;
            case 'movimentacoes':
                // CORREÇÃO: Usar o nome correto do módulo e método
                MovimentacaoModule.renderList();
                break;
            case 'indicadores':
                IndicadoresModule.render();
                break;
            case 'produtos':
                ProdutosModule.render();
                break;
            case 'admin':
                AdminModule.render();
                break;
        }
    },

    bindGlobalEvents() {
        // Esc para fechar qualquer modal aberto
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal-overlay');
                if (modal && !modal.classList.contains('hidden')) {
                    modal.remove();
                }
            }
        });
    }
};

// Start App
window.addEventListener('DOMContentLoaded', () => App.init());
