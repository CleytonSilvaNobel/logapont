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
                    <div class="w-10 h-10 rounded-xl bg-indigo-600 flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                        <i data-lucide="package" class="w-6 h-6"></i>
                    </div>
                    <div class="brand-info">
                        <h1 class="font-bold text-xl tracking-tight brand-font">LOGAPONT</h1>
                        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold text-nowrap">Industrial v1.0</p>
                    </div>
                </div>
            </div>

            <nav class="flex-1 px-4 py-4 space-y-1">
                <button onclick="App.switchView('kanban')" id="nav-kanban" class="nav-btn active" title="Painel Kanban">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Painel Kanban</span>
                </button>
                <button onclick="App.switchView('movimentacoes')" id="nav-movimentacoes" class="nav-btn" title="Movimentações">
                    <i data-lucide="list"></i>
                    <span>Movimentações</span>
                </button>
                <button onclick="App.switchView('produtos')" id="nav-produtos" class="nav-btn" title="Produtos">
                    <i data-lucide="box"></i>
                    <span>Produtos</span>
                </button>
                ${this.user.perfil === 'ADMIN' ? `
                <button onclick="App.switchView('admin')" id="nav-admin" class="nav-btn" title="Administração">
                    <i data-lucide="shield-check"></i>
                    <span>Administração</span>
                </button>
                ` : ''}
            </nav>

            <div class="p-4 border-t border-gray-100 dark:border-slate-800 profile-section">
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 overflow-hidden">
                    <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                        ${this.user.nome.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0 profile-text">
                        <p class="text-sm font-semibold truncate">${this.user.nome}</p>
                        <p class="text-[10px] text-slate-500 uppercase font-bold truncate">${this.user.setor}</p>
                    </div>
                    <button onclick="AuthModule.logout()" class="p-2 text-slate-400 hover:text-danger transition-colors flex-shrink-0" title="Sair">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                    </button>
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
                <button onclick="App.toggleTheme()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors" title="Alternar Tema">
                    <i data-lucide="${isDark ? 'sun' : 'moon'}" class="w-5 h-5"></i>
                </button>
                <div class="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                <div class="relative group hidden md:block">
                    <input type="text" placeholder="Buscar MOV ou Produto..." class="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-64">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                </div>
                <button onclick="KanbanModule.openNewMovementModal()" class="btn btn-primary text-sm px-4">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span class="hidden sm:inline">Nova MOV</span>
                </button>
            </div>
        `;
        lucide.createIcons();
    },

    switchView(view) {
        this.currentView = view;
        const mainContent = document.getElementById('main-content');

        // Update Nav UI
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        const activeNav = document.getElementById(`nav-${view}`);
        if (activeNav) activeNav.classList.add('active');

        // Render specific module
        if (view === 'kanban') KanbanModule.render();
        if (view === 'movimentacoes') MovimentacaoModule.renderList();
        if (view === 'produtos') ProdutosModule.render();
        if (view === 'admin') AdminModule.render();
    },

    bindGlobalEvents() {
        // Theme Toggle shortcut or listener if needed
    }
};

window.addEventListener('DOMContentLoaded', () => App.init());
