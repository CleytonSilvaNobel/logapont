/**
 * LOGAPONT - Módulo de Detalhes e Cadastro
 */

const DetailsModule = {
    async open(movId) {
        const movRef = window.firebase.doc(FB.db, 'movimentacoes', movId);
        const docSnap = await window.firebase.getDoc(movRef);

        if (!docSnap.exists()) return Utils.notify('Movimentação não encontrada.', 'danger');

        const mov = docSnap.data();
        this.renderModal(mov);
    },

    renderModal(mov) {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div class="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                    <header class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <h3 class="text-2xl font-bold brand-font">${mov.idSequencial}</h3>
                            <p class="text-slate-500 text-sm">Criado em: ${Utils.formatDate(mov.timestamps?.criacao?.toDate() || mov.timestamps?.criacao)}</p>
                        </div>
                        <button onclick="DetailsModule.close()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </header>

                    <div class="flex-1 overflow-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <!-- Coluna Info -->
                        <div class="md:col-span-2 space-y-8">
                            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                                <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Informações do Produto</h4>
                                <div class="grid grid-cols-2 gap-6">
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Descrição</label>
                                        <p class="font-semibold text-lg">${mov.produto?.descricao}</p>
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">ID Produto</label>
                                        <p class="font-semibold">${mov.produto?.id || '-'}</p>
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Quantidade</label>
                                        <p class="font-semibold text-lg">${mov.quantidade?.caixas} cx / ${mov.quantidade?.unidades} un</p>
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Prioridade</label>
                                        <p class="font-semibold text-indigo-600">${mov.prioridade}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Ações Disponíveis</h4>
                                <div id="action-buttons" class="flex flex-wrap gap-3">
                                    ${this.getButtonsForEtapa(mov)}
                                </div>
                            </div>

                            <div>
                                <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Histórico Operacional</h4>
                                <div class="space-y-4">
                                    ${(mov.historico || []).reverse().map(h => `
                                        <div class="flex gap-4">
                                            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <i data-lucide="activity" class="w-4 h-4 text-slate-400"></i>
                                            </div>
                                            <div class="flex-1 pb-4 border-b border-gray-50 dark:border-slate-800">
                                                <div class="flex justify-between items-start mb-1">
                                                    <span class="font-bold text-sm text-slate-700 dark:text-slate-300">${h.acao}</span>
                                                    <span class="text-[10px] font-medium text-slate-400">${Utils.formatDate(h.data)}</span>
                                                </div>
                                                <p class="text-xs text-slate-500 mb-1">${h.usuario?.nome} alterou de <b>${h.de.etapa}</b> para <b>${h.para.etapa}</b></p>
                                                ${h.observacao ? `<p class="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg mt-2">"${h.observacao}"</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Coluna Lateral (Status) -->
                        <div class="bg-indigo-50 dark:bg-indigo-500/5 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-500/10 h-fit">
                            <h4 class="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Status Atual</h4>
                            <div class="mb-6">
                                <div class="text-[10px] uppercase font-bold text-indigo-500/60 mb-1">Etapa Atual</div>
                                <div class="text-2xl font-bold text-indigo-600">${mov.fluxo?.etapa}</div>
                            </div>
                            <div class="mb-6">
                                <div class="text-[10px] uppercase font-bold text-indigo-500/60 mb-1">Situação</div>
                                <div class="text-lg font-semibold text-slate-700 dark:text-slate-300 px-3 py-1 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-500/20 rounded-xl inline-block">
                                    ${mov.fluxo?.situacao}
                                </div>
                            </div>
                            <div class="border-t border-indigo-100 dark:border-indigo-500/10 pt-4">
                                <div class="text-[10px] uppercase font-bold text-indigo-500/60 mb-1">Setor Responsável</div>
                                <p class="text-sm font-medium text-slate-600 dark:text-slate-400 italic">Aguardando ação em ${mov.fluxo?.etapa}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    getButtonsForEtapa(mov) {
        const etapa = mov.fluxo?.etapa;
        const perfil = App.user.perfil;
        const setor = App.user.setor;
        const buttons = [];

        // Regras de permissão simplificadas
        if (etapa === 'QUALIDADE' && (setor === 'QUALIDADE' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'LOGISTICA', 'APROVADO', 'APROVAR_QUALIDADE')" class="btn btn-primary flex-1">
                    <i data-lucide="check-circle" class="w-5 h-5"></i> Aprovar Qualidade
                </button>
                <button onclick="DetailsModule.reprovar('${mov.id}')" class="btn btn-danger flex-1">
                    <i data-lucide="x-circle" class="w-5 h-5"></i> Reprovar
                </button>
            `);
        } else if (etapa === 'RETRABALHO' && (setor === 'ARTE_FINAL' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'QUALIDADE', 'AGUARDANDO', 'CONCLUIR_RETRABALHO')" class="btn btn-primary flex-1">
                    <i data-lucide="send" class="w-5 h-5"></i> Reenviar para Qualidade
                </button>
            `);
        } else if (etapa === 'LOGISTICA' && (setor === 'LOGISTICA' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'PCP', 'AGUARDANDO', 'CONFERIDO_LOGISTICA')" class="btn btn-primary flex-1">
                    <i data-lucide="forward" class="w-5 h-5"></i> Encaminhar PCP
                </button>
            `);
        } else if (etapa === 'PCP' && (setor === 'PCP' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'ARMAZENAGEM', 'AGUARDANDO', 'APONTADO_PCP')" class="btn btn-primary flex-1">
                    <i data-lucide="database" class="w-5 h-5"></i> Apontar PCP
                </button>
            `);
        } else if (etapa === 'ARMAZENAGEM' && (setor === 'ARMAZENAGEM' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'FINALIZADO', 'CONCLUIDO', 'ARMAZENADO')" class="btn btn-primary flex-1">
                    <i data-lucide="archive" class="w-5 h-5"></i> Finalizar Movimentação
                </button>
            `);
        } else {
            return `<p class="text-sm text-slate-400 italic">Sem ações disponíveis para seu setor nesta etapa.</p>`;
        }

        return buttons.join('');
    },

    async updateFlow(movId, nextEtapa, situacao, acao, obs = '') {
        try {
            const movRef = window.firebase.doc(FB.db, 'movimentacoes', movId);
            const doc = await window.firebase.getDoc(movRef);
            const current = doc.data();

            await MovimentacaoService.updateStatus(movId, current.fluxo, { etapa: nextEtapa, situacao }, acao, obs);
            this.close();
        } catch (e) {
            console.error(e);
        }
    },

    reprovar(movId) {
        const obs = prompt('Descreva o motivo da reprovação (Obrigatório):');
        if (!obs) return Utils.notify('A observação é obrigatória para reprovar.', 'warning');

        this.updateFlow(movId, 'RETRABALHO', 'EM_PROCESSO', 'REPROVADO_QUALIDADE', obs);
    },

    renderNewModal() {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
                    <header class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 class="text-xl font-bold brand-font">Nova Movimentação</h3>
                        <button onclick="DetailsModule.close()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </header>
                    <div class="p-8 space-y-4">
                        <div>
                            <label class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Produto</label>
                            <input type="text" id="new-prod-desc" class="form-input" placeholder="Ex: Caixa X-25">
                            <input type="text" id="new-prod-id" class="form-input mt-2" placeholder="ID do Produto (opcional)">
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Qtd Caixas</label>
                                <input type="number" id="new-qty-cx" class="form-input" value="0">
                            </div>
                            <div>
                                <label class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Qtd Unidades</label>
                                <input type="number" id="new-qty-un" class="form-input" value="0">
                            </div>
                        </div>
                        <div>
                            <label class="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Prioridade</label>
                            <select id="new-priority" class="form-input">
                                <option value="NORMAL">NORMAL</option>
                                <option value="ALTA">ALTA</option>
                                <option value="URGENTE">URGENTE</option>
                            </select>
                        </div>
                        <button onclick="DetailsModule.handleCreate()" class="w-full btn btn-primary py-4 mt-4">
                            Criar Movimentação
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async handleCreate() {
        const desc = document.getElementById('new-prod-desc').value;
        const prodId = document.getElementById('new-prod-id').value;
        const cx = parseInt(document.getElementById('new-qty-cx').value);
        const un = parseInt(document.getElementById('new-qty-un').value);
        const priority = document.getElementById('new-priority').value;

        if (!desc || cx <= 0) return Utils.notify('Preencha a descrição e a quantidade.', 'warning');

        try {
            await MovimentacaoService.create({
                produto: { id: prodId, descricao: desc },
                quantidade: { caixas: cx, unidades: un },
                prioridade: priority
            });
            Utils.notify('Nova MOV criada com sucesso!');
            this.close();
        } catch (e) {
            console.error(e);
        }
    },

    close() {
        document.getElementById('modal-container').innerHTML = '';
    }
};
