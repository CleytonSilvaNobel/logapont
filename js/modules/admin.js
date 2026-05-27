/**
 * LOGAPONT - Módulo de Administração
 */

const AdminModule = {
    render() {
        const mainContent = document.getElementById('main-content');
        const viewTitle = document.getElementById('view-title');
        if (viewTitle) viewTitle.innerText = 'Gestão do Sistema';

        mainContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                <!-- Gestão de Usuários -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-lg brand-font">Usuários</h3>
                        <button onclick="AdminModule.openUserModal()" class="btn btn-secondary text-xs">
                            <i data-lucide="user-plus" class="w-4 h-4"></i> Novo Usuário
                        </button>
                    </div>
                    <div id="users-list" class="space-y-4">
                        <p class="text-sm text-slate-400 italic">Carregando usuários...</p>
                    </div>
                </div>

                <!-- Configurações e Logs -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 class="font-bold text-lg brand-font mb-6">Configurações Base</h3>
                    <div class="space-y-6">
                        <div>
                            <label class="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">Meta de SLA (Minutos)</label>
                            <input type="number" class="form-input" value="120" readonly>
                            <p class="text-[10px] text-slate-400 mt-1">Tempo padrão para alerta crítico no Kanban.</p>
                        </div>
                        <div class="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl">
                            <div class="flex gap-3">
                                <i data-lucide="alert-circle" class="w-5 h-5 text-amber-500 shrink-0"></i>
                                <div>
                                    <h4 class="text-sm font-bold text-amber-700 dark:text-amber-400">Atenção</h4>
                                    <p class="text-xs text-amber-600/80">Esta área permite a modificação de permissões críticas. Use com cautela.</p>
                                </div>
                            </div>
                        </div>

                        <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
                             <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Manutenção de Dados</h4>
                             <button onclick="AdminModule.clearData()" class="w-full btn btn-danger py-3 text-sm">
                                <i data-lucide="refresh-cw"></i> Zerar Base de Testes
                             </button>
                             <p class="text-[10px] text-slate-400 mt-2 text-center">⚠️ Esta ação removerá todas as MOVs e resetará o contador.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        this.loadUsers();
    },

    async loadUsers() {
        const users = await Store.list('usuarios');
        const list = document.getElementById('users-list');

        if (!users.length) {
            list.innerHTML = '<p class="text-sm text-slate-400 italic">Nenhum usuário encontrado além do administrador inicial.</p>';
            return;
        }

        list.innerHTML = users.map(user => `
            <div class="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 flex items-center justify-center font-bold text-xs">
                    ${user.nome.charAt(0)}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-bold">${user.nome}</p>
                    <p class="text-[10px] text-slate-400 uppercase tracking-tighter">${user.setor} | ${user.perfil}</p>
                </div>
                <button class="p-2 text-slate-300 hover:text-danger"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </div>
        `).join('');
        lucide.createIcons();
    },

    openUserModal() {
        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                    <div class="p-8">
                        <h3 class="text-xl font-bold brand-font mb-6">Vincular Usuário</h3>
                        <p class="text-sm text-slate-500 mb-6">O usuário deve primeiro ser criado no Firebase Authentication. Aqui você define o perfil operacional.</p>
                        <div class="space-y-4">
                            <div>
                                <label class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">E-mail</label>
                                <input type="email" id="u-email" class="form-input" placeholder="email@nobelpack.com">
                            </div>
                            <div>
                                <label class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Nome Completo</label>
                                <input type="text" id="u-name" class="form-input" placeholder="João da Silva">
                            </div>
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Setor</label>
                                    <select id="u-setor" class="form-input">
                                        <option value="QUALIDADE">QUALIDADE</option>
                                        <option value="LOGISTICA">LOGISTICA</option>
                                        <option value="PCP">PCP</option>
                                        <option value="ARMAZENAGEM">ARMAZENAGEM</option>
                                        <option value="ARTE_FINAL">ARTE FINAL (Retrabalho)</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 block">Perfil</label>
                                    <select id="u-perfil" class="form-input">
                                        <option value="OPERADOR">OPERADOR</option>
                                        <option value="SUPERVISOR">SUPERVISOR</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-3 mt-8">
                            <button onclick="DetailsModule.close()" class="flex-1 btn btn-secondary">Cancelar</button>
                            <button onclick="AdminModule.handleSaveUser()" class="flex-1 btn btn-primary">Salvar Perfil</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async handleSaveUser() {
        const email = document.getElementById('u-email').value;
        const nome = document.getElementById('u-name').value;
        const setor = document.getElementById('u-setor').value;
        const perfil = document.getElementById('u-perfil').value;

        if (!email || !nome) return Utils.notify('Preencha os campos obrigatórios.', 'warning');

        try {
            await Store.add('usuarios', { email, nome, setor, perfil, ativo: true });
            Utils.notify('Usuário vinculado com sucesso!');
            DetailsModule.close();
            this.render();
        } catch (e) {
            console.error(e);
        }
    },

    async clearData() {
        if (!confirm('!!! ATENÇÃO !!!\n\nIsso irá apagar TODAS as movimentações do sistema e resetar a numeração para MOV-000001.\n\nTem certeza absoluta?')) return;

        const senha = prompt('Digite a senha de segurança (admin) para confirmar:');
        if (senha !== 'admin') return Utils.notify('Senha incorreta. Operação cancelada.', 'danger');

        try {
            Utils.notify('Iniciando limpeza...', 'warning');

            // 1. Limpar Movimentações
            const movs = await Store.list('movimentacoes');
            for (const m of movs) {
                await Store.delete('movimentacoes', m.id);
            }

            // 2. Resetar Contador
            await Store.update('counters', 'movimentacoes', { valor: 0 });

            Utils.notify('Base de dados zerada com sucesso!', 'success');
            App.switchView('kanban');
        } catch (error) {
            console.error(error);
            Utils.notify('Falha ao zerar base.', 'danger');
        }
    }
};
