/**
 * LOGAPONT - Módulo Kanban (Tela Principal)
 */

const KanbanModule = {
    columns: [
        { id: 'QUALIDADE', label: 'Qualidade', bg: 'col-bg-qualidade' },
        { id: 'LOGISTICA', label: 'Logística', bg: 'col-bg-logistica' },
        { id: 'PCP', label: 'PCP', bg: 'col-bg-pcp' },
        { id: 'ARMAZENAGEM', label: 'Armazenagem', bg: 'col-bg-armazenagem' },
        { id: 'RETRABALHO', label: 'Retrabalho', bg: 'col-bg-retrabalho' }
    ],

    // Armazena o estado anterior das movimentações para detectar transições
    lastPositions: {},

    init() {
        if (this.unsubscribe) this.unsubscribe();

        let firstLoad = true;
        this.unsubscribe = Store.subscribe('movimentacoes', (movs) => {
            if (firstLoad) {
                // Sincroniza estado inicial sem disparar sons
                movs.forEach(m => {
                    this.lastPositions[m.id] = m.fluxo?.etapa;
                });
                firstLoad = false;
            } else {
                this.monitorChanges(movs);
            }

            if (App.currentView === 'kanban') {
                this.renderBoard(movs);
            }
        });
    },

    monitorChanges(movs) {
        movs.forEach(mov => {
            const movId = mov.id;
            const currentEtapa = mov.fluxo?.etapa;
            const lastEtapa = this.lastPositions[movId];

            // Detecta se a movimentação é nova ou mudou de etapa
            if (currentEtapa && currentEtapa !== lastEtapa) {
                // Só notifica se entrou em uma etapa que requer ação (não finalizado)
                if (currentEtapa !== 'FINALIZADO') {
                    if (this.isUserResponsible(currentEtapa)) {
                        this.triggerNotification(mov);
                    }
                }
                // Atualiza o cache de posição
                this.lastPositions[movId] = currentEtapa;
            }
        });
    },

    isUserResponsible(etapa) {
        const user = App.user;
        if (!user) return false;

        // Admin ouve tudo o que acontece (conforme solicitado)
        if (user.perfil === 'ADMIN') return true;

        // Usuário do setor específico
        if (user.setor === etapa) return true;

        // Regras especiais de cobertura de setor
        if (user.setor === 'LOGISTICA' && etapa === 'ARMAZENAGEM') return true;
        if (user.setor === 'ARTE_FINAL' && etapa === 'RETRABALHO') return true;

        return false;
    },

    triggerNotification(mov) {
        const lastNotified = localStorage.getItem(`notify_${mov.id}_${mov.fluxo.etapa}`);

        // Evita duplicidade persistente se o app recarregar
        if (lastNotified) return;

        Utils.notify(`🔔 ${mov.fluxo.etapa}: ${mov.idSequencial}`, 'indigo');
        localStorage.setItem(`notify_${mov.id}_${mov.fluxo.etapa}`, 'true');

        try {
            // Som de notificação curto e profissional
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play();
        } catch (e) {
            console.warn('Feedback sonoro bloqueado pelo navegador ou falha na rede.');
        }
    },

    render() {
        const mainContent = document.getElementById('main-content');
        const viewTitle = document.getElementById('view-title');
        if (viewTitle) viewTitle.innerText = 'Fluxo de Movimentação';

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
                        <div id="col-${col.id}" class="flex-1 space-y-4 overflow-y-auto min-h-[200px] rounded-2xl ${col.bg} p-2 border-2 border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
                            <!-- Cards serão injetados aqui -->
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.init();
    },

    renderBoard(movs) {
        this.columns.forEach(col => {
            const el = document.getElementById(`col-${col.id}`);
            if (el) el.innerHTML = '';
            const countEl = document.getElementById(`count-${col.id}`);
            if (countEl) countEl.innerText = '0';
        });

        const counts = {};
        movs.forEach(mov => {
            // Filtrar apenas o que estiver em fluxo ativo (etapa presente nas colunas)
            const etapa = mov.fluxo?.etapa;
            if (etapa && this.columns.find(c => c.id === etapa)) {
                const colEl = document.getElementById(`col-${etapa}`);
                if (colEl) {
                    counts[etapa] = (counts[etapa] || 0) + 1;
                    colEl.appendChild(this.createCard(mov));
                }
            }
        });

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
                <div class="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-md text-indigo-600 dark:text-indigo-400">
                    <i data-lucide="truck" class="w-3 h-3"></i>
                    ${mov.quantidade?.paletes || 0} pal
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
