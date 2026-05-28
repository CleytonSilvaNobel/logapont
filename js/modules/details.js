/**
 * LOGAPONT - Módulo de Detalhes e Cadastro
 */

const DetailsModule = {
    async open(movId) {
        try {
            const docSnap = await FB.db.collection('movimentacoes').doc(movId).get();

            if (!docSnap.exists) return Utils.notify('Movimentação não encontrada.', 'danger');

            const mov = docSnap.data();
            this.renderModal({ id: docSnap.id, ...mov });
        } catch (e) {
            console.error(e);
            Utils.notify('Erro ao abrir detalhes.', 'danger');
        }
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
                        <div class="md:col-span-2 space-y-8">
                            <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                                <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Informações do Produto</h4>
                                <div class="grid grid-cols-2 gap-6">
                                    <div class="col-span-2">
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Descrição</label>
                                        <p class="font-semibold text-lg text-slate-800 dark:text-slate-100">${mov.produto?.descricao}</p>
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Código</label>
                                        <p class="font-bold text-indigo-600">${mov.produto?.id || '-'}</p>
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Quantidade</label>
                                        <p class="font-semibold text-lg text-slate-700 dark:text-slate-200">${mov.quantidade?.caixas} cx / ${mov.quantidade?.unidades} un</p>
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase font-bold text-slate-500">Prioridade</label>
                                        <p class="font-bold text-indigo-600">${mov.prioridade}</p>
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
                                    ${(mov.historico || []).slice().reverse().map(h => `
                                        <div class="flex gap-4">
                                            <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                                <i data-lucide="activity" class="w-4 h-4 text-slate-400"></i>
                                            </div>
                                            <div class="flex-1 pb-4 border-b border-gray-50 dark:border-slate-800">
                                                <div class="flex justify-between items-start mb-1">
                                                    <span class="font-bold text-sm text-slate-700 dark:text-slate-300">${h.acao}</span>
                                                    <span class="text-[10px] font-medium text-slate-400">${Utils.formatDate(h.data)}</span>
                                                </div>
                                                <p class="text-xs text-slate-500 mb-1">${h.usuario?.nome} em <b>${h.para.etapa}</b></p>
                                                ${h.observacao ? `<p class="text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg mt-2">"${h.observacao}"</p>` : ''}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

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
            // Se veio de erro na logística, volta pra logística. Se veio de reprova da qualidade, volta pra qualidade.
            const hist = mov.historico || [];
            const lastErrorAction = [...hist].reverse().find(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA' || h.acao === 'REPROVADO_QUALIDADE');
            const targetEtapa = (lastErrorAction && lastErrorAction.acao === 'ERRO_APONTAMENTO_LOGISTICA') ? 'LOGISTICA' : 'QUALIDADE';

            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', '${targetEtapa}', 'AGUARDANDO', 'CONCLUIR_RETRABALHO')" class="btn btn-primary flex-1">
                    <i data-lucide="send" class="w-5 h-5"></i> Concluir Retrabalho
                </button>
            `);
        } else if (etapa === 'LOGISTICA' && (setor === 'LOGISTICA' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'PCP', 'AGUARDANDO', 'CONFERIDO_LOGISTICA')" class="btn btn-primary flex-1">
                    <i data-lucide="forward" class="w-5 h-5"></i> Encaminhar PCP
                </button>
                <button onclick="DetailsModule.divergencia('${mov.id}')" class="btn btn-danger flex-1">
                    <i data-lucide="alert-triangle" class="w-5 h-5"></i> Divergência
                </button>
            `);
        } else if (etapa === 'PCP' && (setor === 'PCP' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'ARMAZENAGEM', 'AGUARDANDO', 'APONTADO_PCP')" class="btn btn-primary flex-1">
                    <i data-lucide="database" class="w-5 h-5"></i> Apontar PCP
                </button>
            `);
        } else if (etapa === 'ARMAZENAGEM' && (setor === 'ARMAZENAGEM' || setor === 'LOGISTICA' || perfil === 'ADMIN')) {
            buttons.push(`
                <button onclick="DetailsModule.updateFlow('${mov.id}', 'FINALIZADO', 'CONCLUIDO', 'ARMAZENADO')" class="btn btn-primary flex-1">
                    <i data-lucide="archive" class="w-5 h-5"></i> Finalizar Movimentação
                </button>
            `);
        }

        // BOTAO EDITAR (Admin sempre, Arte Final se estiver em Retrabalho)
        if (perfil === 'ADMIN' || (setor === 'ARTE_FINAL' && etapa === 'RETRABALHO')) {
            buttons.push(`
                <button onclick="DetailsModule.openEditModal('${mov.id}')" class="btn btn-secondary flex-1 border-indigo-200 text-indigo-600">
                    <i data-lucide="edit-3" class="w-5 h-5"></i> Editar Lançamento
                </button>
            `);
        }

        if (buttons.length === 0) {
            return `<p class="text-sm text-slate-400 italic">Sem ações disponíveis para seu setor nesta etapa.</p>`;
        }

        return buttons.join('');
    },

    async updateFlow(movId, nextEtapa, situacao, acao, obs = '') {
        const modal = document.querySelector('.animate-fade-in > div');
        try {
            if (modal) modal.style.opacity = '0.5';
            Utils.notify('Atualizando etapa...', 'info');

            const docSnap = await FB.db.collection('movimentacoes').doc(movId).get();
            const current = docSnap.data();

            await MovimentacaoService.updateStatus(movId, current.fluxo, { etapa: nextEtapa, situacao }, acao, obs);
            this.close();
        } catch (e) {
            console.error(e);
            Utils.notify('Falha ao atualizar etapa.', 'danger');
            if (modal) modal.style.opacity = '1';
        }
    },

    reprovar(movId) {
        const obs = prompt('Descreva o motivo da reprovação (Obrigatório):');
        if (!obs) return Utils.notify('A observação é obrigatória para reprovar.', 'warning');
        this.updateFlow(movId, 'RETRABALHO', 'EM_PROCESSO', 'REPROVADO_QUALIDADE', obs);
    },

    divergencia(movId) {
        const obs = prompt('Descreva a divergência encontrada (Obrigatório):');
        if (!obs) return Utils.notify('A descrição da divergência é obrigatória para registrar.', 'warning');
        this.updateFlow(movId, 'RETRABALHO', 'AGUARDANDO', 'ERRO_APONTAMENTO_LOGISTICA', obs);
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
                        <div class="grid grid-cols-3 gap-3">
                            <div class="col-span-1">
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Código Produto</label>
                                <input type="text" id="new-prod-id" class="form-input" placeholder="Ex: 10020" oninput="DetailsModule.checkProduct(this.value)">
                            </div>
                            <div class="col-span-2">
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Descrição do Produto</label>
                                <input type="text" id="new-prod-desc" class="form-input bg-slate-50 dark:bg-slate-800" placeholder="Aproxime ou digite o código..." readonly>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Qtd Caixas</label>
                                <input type="number" id="new-qty-cx" class="form-input" value="0" oninput="DetailsModule.calculateTotal()">
                            </div>
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Unid / Caixa</label>
                                <input type="number" id="new-unid-cx" class="form-input bg-slate-50 dark:bg-slate-800" value="1" readonly>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Total Unidades</label>
                                <input type="number" id="new-qty-un" class="form-input bg-slate-50 dark:bg-slate-800 font-bold text-indigo-600" value="0" readonly>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 block font-bold">Total Paletes</label>
                                <input type="number" id="new-qty-pal" class="form-input border-indigo-200 dark:border-indigo-500/30 font-bold" value="1">
                            </div>
                        </div>
                        <div>
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Prioridade</label>
                            <select id="new-priority" class="form-input">
                                <option value="NORMAL">NORMAL</option>
                                <option value="ALTA">ALTA</option>
                                <option value="URGENTE">URGENTE</option>
                            </select>
                        </div>
                        <button onclick="DetailsModule.handleCreate()" class="w-full btn btn-primary py-4 mt-4 shadow-indigo-500/40">
                            Criar Movimentação
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async checkProduct(codigo) {
        if (!codigo) return;
        const prod = await ProdutosModule.findByCodigo(codigo);
        if (prod) {
            document.getElementById('new-prod-desc').value = prod.descricao;
            document.getElementById('new-unid-cx').value = prod.unidadePorCaixa;
            this.calculateTotal();
            Utils.notify('Produto identificado!', 'success');
        }
    },

    calculateTotal() {
        const cx = parseInt(document.getElementById('new-qty-cx').value) || 0;
        const unidCx = parseInt(document.getElementById('new-unid-cx').value) || 1;
        const total = cx * unidCx;
        const input = document.getElementById('new-qty-un');
        if (input) input.value = total;
    },

    async handleCreate() {
        const btn = document.querySelector('[onclick="DetailsModule.handleCreate()"]');
        const desc = document.getElementById('new-prod-desc').value;
        const prodId = document.getElementById('new-prod-id').value;
        const cx = parseInt(document.getElementById('new-qty-cx').value);
        const un = parseInt(document.getElementById('new-qty-un').value);
        const pal = parseInt(document.getElementById('new-qty-pal').value) || 0;
        const priority = document.getElementById('new-priority').value;

        if (!desc || cx <= 0) return Utils.notify('Preencha a descrição e a quantidade.', 'warning');

        try {
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Criando...`;
                lucide.createIcons();
            }

            await MovimentacaoService.create({
                produto: { id: prodId, descricao: desc },
                quantidade: { caixas: cx, unidades: un, paletes: pal },
                prioridade: priority
            });

            Utils.notify('Nova MOV criada com sucesso!');
            this.close();
        } catch (e) {
            console.error(e);
            Utils.notify('Erro ao criar movimentação.', 'danger');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = `Criar Movimentação`;
                lucide.createIcons();
            }
        }
    },

    async openEditModal(movId) {
        try {
            const mov = await Store.get('movimentacoes', movId);
            if (!mov) return;

            const container = document.getElementById('modal-container');
            // Reutiliza parte da estrutura do NewModal mas com botão de Update
            container.innerHTML = `
                <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
                    <div class="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-indigo-100 dark:border-indigo-500/20">
                        <header class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-500/5">
                            <div>
                                <h3 class="text-xl font-bold brand-font text-indigo-600">Editar Lançamento</h3>
                                <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">${mov.idSequencial}</p>
                            </div>
                            <button onclick="DetailsModule.closeEdit()" class="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <i data-lucide="x" class="w-6 h-6"></i>
                            </button>
                        </header>
                        <div class="p-8 space-y-4">
                            <input type="hidden" id="edit-mov-id" value="${mov.id}">
                            <div class="grid grid-cols-1 gap-4">
                                <div>
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Descrição do Produto</label>
                                    <input type="text" id="edit-prod-desc" class="form-input bg-slate-50 dark:bg-slate-800" value="${mov.produto?.descricao}" readonly>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Qtd Caixas</label>
                                    <input type="number" id="edit-qty-cx" class="form-input" value="${mov.quantidade?.caixas}" oninput="DetailsModule.calculateTotalEdit()">
                                </div>
                                <div>
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Unid / Caixa</label>
                                    <input type="number" id="edit-unid-cx" class="form-input bg-slate-50 dark:bg-slate-800" value="${mov.quantidade?.unidades / mov.quantidade?.caixas}" readonly>
                                </div>
                                <div>
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Total Unidades</label>
                                    <input type="number" id="edit-qty-un" class="form-input bg-slate-50 dark:bg-slate-800 font-bold text-indigo-600" value="${mov.quantidade?.unidades}" readonly>
                                </div>
                                <div>
                                    <label class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 block font-bold">Total Paletes</label>
                                    <input type="number" id="edit-qty-pal" class="form-input border-indigo-200 dark:border-indigo-500/30 font-bold" value="${mov.quantidade?.paletes || 0}">
                                </div>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Prioridade</label>
                                <select id="edit-priority" class="form-input">
                                    <option value="NORMAL" ${mov.prioridade === 'NORMAL' ? 'selected' : ''}>NORMAL</option>
                                    <option value="ALTA" ${mov.prioridade === 'ALTA' ? 'selected' : ''}>ALTA</option>
                                    <option value="URGENTE" ${mov.prioridade === 'URGENTE' ? 'selected' : ''}>URGENTE</option>
                                </select>
                            </div>
                            <button onclick="DetailsModule.handleUpdate()" class="w-full btn btn-primary py-4 mt-4 shadow-xl shadow-indigo-500/20" id="btn-update-mov">
                                Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            `;
            lucide.createIcons();
        } catch (e) {
            console.error(e);
            Utils.notify('Erro ao abrir edição.', 'danger');
        }
    },

    calculateTotalEdit() {
        const cx = parseInt(document.getElementById('edit-qty-cx').value) || 0;
        const unidCx = parseInt(document.getElementById('edit-unid-cx').value) || 1;
        document.getElementById('edit-qty-un').value = cx * unidCx;
    },

    async handleUpdate() {
        const id = document.getElementById('edit-mov-id').value;
        const cx = parseInt(document.getElementById('edit-qty-cx').value);
        const un = parseInt(document.getElementById('edit-qty-un').value);
        const pal = parseInt(document.getElementById('edit-qty-pal').value);
        const priority = document.getElementById('edit-priority').value;
        const btn = document.getElementById('btn-update-mov');

        try {
            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Salvando...`;
            lucide.createIcons();

            await Store.update('movimentacoes', id, {
                'quantidade.caixas': cx,
                'quantidade.unidades': un,
                'quantidade.paletes': pal,
                'prioridade': priority
            });

            // Registrar no histórico a edição
            const mov = await Store.get('movimentacoes', id);
            await FB.db.collection('movimentacoes').doc(id).update({
                historico: firebase.firestore.FieldValue.arrayUnion({
                    data: new Date().toISOString(),
                    acao: 'EDIÇÃO_MANUAL',
                    usuario: App.user,
                    para: mov.fluxo,
                    observacao: 'Dados de quantidade/prioridade alterados via edição manual.'
                })
            });

            Utils.notify('Lançamento atualizado com sucesso!', 'success');
            this.closeEdit();
            this.open(id); // Recarregar detalhes
        } catch (e) {
            console.error(e);
            Utils.notify('Erro ao atualizar.', 'danger');
            btn.disabled = false;
            btn.innerHTML = 'Salvar Alterações';
        }
    },

    closeEdit() {
        // Apenas limpa o modal de edição se houver sobreposição, mas aqui vamos re-renderizar o de detalhes
        const id = document.getElementById('edit-mov-id').value;
        if (id) this.open(id);
    },

    close() { document.getElementById('modal-container').innerHTML = ''; }
};
