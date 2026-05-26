/**
 * LOGAPONT - Módulo Kanban (Tela Principal)
 */

const KanbanModule = {
    columns: [
        { id: 'QUALIDADE', label: 'Qualidade' },
        { id: 'RETRABALHO', label: 'Retrabalho' },
        { id: 'LOGISTICA', label: 'Logística' },
        { id: 'PCP', label: 'PCP' },
        { id: 'ARMAZENAGEM', label: 'Armazenagem' },
        { id: 'FINALIZADO', label: 'Finalizado' }
    ],

    init() {
        // Escuta mudanças nas movimentações
        this.unsubscribe = Store.subscribe('movimentacoes', (movs) => {
            if (App.currentView === 'kanban') {
                this.renderBoard(movs);
            }
        });
    },

    render() {
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div id="kanban-container" class="flex gap-6 overflow-x-auto pb-6 h-full items-start">
                ${this.columns.map(col => `
                    <div class="kanban-column flex flex-col w-80 shrink-0 h-full max-h-full">
                        <div class="flex items-center justify-between mb-4 px-2">
                            <h3 class="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                ${col.label}
                                <span id="count-${col.id}" class="text-xs bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">0</span>
                            </h3>
                        </div>
                        <div id="col-${col.id}" class="flex-1 space-y-4 overflow-y-auto min-h-[200px] rounded-2xl bg-slate-100/50 dark:bg-slate-900/30 p-2 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                            <!-- Cards serão injetados aqui -->
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Carrega dados iniciais
        this.init();
    },

    renderBoard(movs) {
        // Limpa colunas
        this.columns.forEach(col => {
            const el = document.getElementById(`col-${col.id}`);
            if (el) el.innerHTML = '';
            const countEl = document.getElementById(`count-${col.id}`);
            if (countEl) countEl.innerText = '0';
        });

        // Distribui cards
        const counts = {};
        movs.forEach(mov => {
            const etapa = mov.fluxo?.etapa || 'QUALIDADE';
            const colId = etapa;
            const colEl = document.getElementById(`col-${colId}`);

            if (colEl) {
                counts[colId] = (counts[colId] || 0) + 1;
                colEl.appendChild(this.createCard(mov));
            }
        });

        // Atualiza contadores
        Object.keys(counts).forEach(id => {
            const countEl = document.getElementById(`count-${id}`);
            if (countEl) countEl.innerText = counts[id];
        });

        lucide.createIcons();
    },

    createCard(mov) {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:scale-[1.02] cursor-pointer transition-all animate-fade-in group';
        card.onclick = () => DetailsModule.open(mov.id);

        const sla = Utils.getSLATime(mov.timestamps?.criacao?.toDate ? mov.timestamps.criacao.toDate() : mov.timestamps?.criacao);
        const prioridadeColor = mov.prioridade === 'ALTA' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600';

        card.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${prioridadeColor}">
                    ${mov.prioridade || 'NORMAL'}
                </span>
                <span class="text-[10px] font-medium ${sla.color} flex items-center gap-1">
                    <i data-lucide="clock" class="w-3 h-3"></i>
                    ${sla.text}
                </span>
            </div>
            
            <h4 class="font-bold text-slate-800 dark:text-white mb-1">${mov.idSequencial}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">${mov.produto?.descricao || 'Produto Indefinido'}</p>
            
            <div class="flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-1">
                    <i data-lucide="package" class="w-3 h-3 text-slate-400"></i>
                    ${mov.quantidade?.caixas || 0} cx
                </div>
                <div class="flex items-center gap-1">
                    <i data-lucide="layers" class="w-3 h-3 text-slate-400"></i>
                    ${mov.quantidade?.unidades || 0} un
                </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    ${mov.fluxo?.situacao || 'AGUARDANDO'}
                </span>
                <div class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                    <i data-lucide="chevron-right" class="w-3 h-3"></i>
                </div>
            </div>
        `;
        return card;
    },

    openNewMovementModal() {
        DetailsModule.renderNewModal();
    }
};
