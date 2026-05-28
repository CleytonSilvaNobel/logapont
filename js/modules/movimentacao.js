/**
 * LOGAPONT - Módulo de Lista de Movimentações
 */

const MovimentacaoModule = {
    pageSize: 20,
    currentPage: 0,
    pagesHistory: [], // Armazena o lastVisible de cada página para retroceder
    lastVisible: null,
    filters: {
        inicio: '',
        fim: '',
        busca: ''
    },

    renderList() {
        const mainContent = document.getElementById('main-content');
        const viewTitle = document.getElementById('view-title');
        if (viewTitle) viewTitle.innerText = 'Histórico de Movimentações';

        // Resetar busca ao entrar para evitar "lista vazia" fantasma
        this.filters.busca = '';
        this.currentPage = 0;
        this.pagesHistory = [];
        this.lastVisible = null;

        mainContent.innerHTML = `
            <div class="space-y-6 animate-fade-in">
            <!-- Barra de Ferramentas / Filtros -->
            <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-wrap items-end gap-4">
                <div class="flex-1 min-w-[150px]">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Data Inicial</label>
                    <input type="date" id="hist-inicio" class="form-input" value="${this.filters.inicio}" onchange="MovimentacaoModule.updateFilters()">
                </div>
                <div class="flex-1 min-w-[150px]">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Data Final</label>
                    <input type="date" id="hist-fim" class="form-input" value="${this.filters.fim}" onchange="MovimentacaoModule.updateFilters()">
                </div>
                <div class="flex-[2] min-w-[250px]">
                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Buscar (ID ou Produto)</label>
                    <div class="relative">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"></i>
                        <input type="text" id="hist-busca" class="form-input pl-11" placeholder="Ex: MOV-000001 ou Caixa 40" value="${this.filters.busca}" oninput="MovimentacaoModule.updateFilters()">
                    </div>
                </div>
            </div>

            <!-- Tabela -->
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sequencial</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produto</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quantidade</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Etapa Atual</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Situação</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Criação</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="movs-list-body">
                            <tr><td colspan="7" class="p-10 text-center text-slate-400 italic font-medium anim-pulse">Buscando dados no servidor...</td></tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginação -->
                <div class="p-4 bg-slate-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <p class="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Página <span id="pag-current">1</span></p>
                    <div class="flex gap-2">
                        <button id="btn-pag-prev" onclick="MovimentacaoModule.prevPage()" class="btn btn-secondary py-2 px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed" disabled>
                            <i data-lucide="chevron-left" class="w-4 h-4"></i> Anterior
                        </button>
                        <button id="btn-pag-next" onclick="MovimentacaoModule.nextPage()" class="btn btn-secondary py-2 px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed">
                            Próximo <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
        lucide.createIcons();
        this.loadList();
    },

    updateFilters() {
        this.filters.inicio = document.getElementById('hist-inicio').value;
        this.filters.fim = document.getElementById('hist-fim').value;
        this.filters.busca = document.getElementById('hist-busca').value;

        // Reset da paginação ao filtrar
        this.currentPage = 0;
        this.pagesHistory = [];
        this.lastVisible = null;

        // Timer simples para debouncing da busca
        if (this.searchTimer) clearTimeout(this.searchTimer);
        this.searchTimer = setTimeout(() => this.loadList(), 400);
    },

    async loadList(direction = 'next') {
        const body = document.getElementById('movs-list-body');
        if (!body) return;

        try {
            const queryFilters = [];

            // 1. Filtro por Data
            if (this.filters.inicio) {
                const dateStart = new Date(this.filters.inicio + 'T00:00:00');
                queryFilters.push({ field: 'timestamps.criacao', op: '>=', value: dateStart });
            }
            if (this.filters.fim) {
                const dateEnd = new Date(this.filters.fim + 'T23:59:59');
                queryFilters.push({ field: 'timestamps.criacao', op: '<=', value: dateEnd });
            }

            const result = await Store.list('movimentacoes', {
                filters: queryFilters,
                orderByField: 'timestamps.criacao',
                orderDir: 'desc',
                limit: this.pageSize,
                startAfter: direction === 'next' ? this.lastVisible : null
            });

            let movs = result.docs;

            // Filtro de texto "Search" (Feito localmente se houver busca)
            if (this.filters.busca) {
                const term = this.filters.busca.toUpperCase();
                movs = movs.filter(m =>
                    m.idSequencial.toUpperCase().includes(term) ||
                    m.produto?.descricao.toUpperCase().includes(term) ||
                    m.produto?.id?.toUpperCase().includes(term)
                );
            }

            if (!movs.length) {
                body.innerHTML = `<tr><td colspan="7" class="p-10 text-center text-slate-400">Nenhuma movimentação encontrada.</td></tr>`;
                document.getElementById('btn-pag-next').disabled = true;
                return;
            }

            this.lastVisible = result.lastVisible;
            this.renderTableBody(movs);

            // Atualiza UI de paginação
            document.getElementById('pag-current').innerText = this.currentPage + 1;
            document.getElementById('btn-pag-prev').disabled = this.currentPage === 0;
            document.getElementById('btn-pag-next').disabled = result.docs.length < this.pageSize;

        } catch (error) {
            console.error(error);
            Utils.notify('Erro ao carregar lista de movimentações.', 'danger');
        }
    },

    renderTableBody(movs) {
        const body = document.getElementById('movs-list-body');
        body.innerHTML = movs.map(mov => `
            <tr class="border-b border-gray-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-bold text-slate-700 dark:text-slate-300">${mov.idSequencial}</td>
                <td class="p-4">
                    <p class="font-medium text-sm">${mov.produto?.descricao}</p>
                    <p class="text-[10px] text-slate-400">${mov.produto?.id || '-'}</p>
                </td>
                <td class="p-4 text-xs font-semibold">
                    ${mov.quantidade?.caixas} cx / ${mov.quantidade?.unidades} un
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-md text-[10px] font-bold uppercase">
                        ${mov.fluxo?.etapa}
                    </span>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md text-[10px] font-bold uppercase">
                        ${mov.fluxo?.situacao}
                    </span>
                </td>
                <td class="p-4 text-xs text-slate-400">
                    ${Utils.formatDate(mov.timestamps?.criacao?.toDate ? mov.timestamps.criacao.toDate() : mov.timestamps?.criacao)}
                </td>
                <td class="p-4 text-right">
                    <button onclick="DetailsModule.open('${mov.id}')" class="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
    `).join('');
        lucide.createIcons();
    },

    nextPage() {
        this.pagesHistory.push(this.lastVisible);
        this.currentPage++;
        this.loadList('next');
    },

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.pagesHistory.pop();
            this.lastVisible = this.pagesHistory[this.pagesHistory.length - 1] || null;
            this.loadList('next');
        }
    }
};
