/**
 * LOGAPONT - Lógica Principal da Aplicação
 */

const App = {
    user: null,
    currentView: 'kanban',

    init() {
        console.log('LOGAPONT Iniciado');
        AuthModule.init();
        this.bindGlobalEvents();
    },

    /**
     * Renderiza o shell da aplicação após login
     */
    async showApp(user) {
        this.user = user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-shell').classList.remove('hidden');

        this.renderSidebar();
        this.renderTopbar();
        this.switchView('kanban');
    },

    renderSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.innerHTML = `
            <div class="p-6 flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                    <i data-lucide="package" class="w-6 h-6"></i>
                </div>
                <div>
                    <h1 class="font-bold text-xl tracking-tight brand-font">LOGAPONT</h1>
                    <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Industrial v1.0</p>
                </div>
            </div>

            <nav class="flex-1 px-4 py-4 space-y-1">
                <button onclick="App.switchView('kanban')" id="nav-kanban" class="nav-btn active">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Painel Kanban</span>
                </button>
                <button onclick="App.switchView('movimentacoes')" id="nav-movimentacoes" class="nav-btn">
                    <i data-lucide="list"></i>
                    <span>Movimentações</span>
                </button>
                ${this.user.perfil === 'ADMIN' ? `
                <button onclick="App.switchView('admin')" id="nav-admin" class="nav-btn">
                    <i data-lucide="shield-check"></i>
                    <span>Administração</span>
                </button>
                ` : ''}
            </nav>

            <div class="p-4 border-t border-gray-100 dark:border-slate-800">
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                        ${this.user.nome.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold truncate">${this.user.nome}</p>
                        <p class="text-[10px] text-slate-500 uppercase font-bold">${this.user.setor}</p>
                    </div>
                    <button onclick="AuthModule.logout()" class="p-2 text-slate-400 hover:text-danger transition-colors" title="Sair">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    renderTopbar() {
        const topbar = document.getElementById('topbar');
        topbar.innerHTML = `
            <div>
                <h2 id="view-title" class="text-lg font-semibold brand-font">Painel Operacional</h2>
            </div>
            <div class="flex items-center gap-4">
                <div class="relative group">
                    <input type="text" placeholder="Buscar MOV ou Produto..." class="pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all w-64">
                    <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"></i>
                </div>
                <button onclick="KanbanModule.openNewMovementModal()" class="btn btn-primary text-sm px-4">
                    <i data-lucide="plus" class="w-4 h-4"></i>
                    <span>Nova MOV</span>
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
        if (view === 'admin') AdminModule.render();
    },

    bindGlobalEvents() {
        // Theme Toggle shortcut or listener if needed
    }
};

// Navigation button styles injected globally
const style = document.createElement('style');
style.textContent = `
    .nav-btn {
        @apply w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 transition-all font-medium;
    }
    .nav-btn i { @apply w-5 h-5; }
    .nav-btn.active {
        @apply bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 shadow-sm;
    }
`;
document.head.appendChild(style);

window.addEventListener('DOMContentLoaded', () => App.init());
