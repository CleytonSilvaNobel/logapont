/**
 * LOGAPONT - Módulo de Administração
 * Gestão de usuários e manutenção da base de dados.
 */

const AdminModule = {
    render() {
        const mainContent = document.getElementById('main-content');
        const viewTitle = document.getElementById('view-title');
        if (viewTitle) viewTitle.innerText = 'Gestão do Sistema';

        mainContent.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                <!-- Gestão de Usuários (2 colunas) -->
                <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-lg brand-font">Usuários Ativos</h3>
                        <button onclick="AdminModule.openUserModal()" class="btn btn-secondary text-xs">
                            <i data-lucide="user-plus" class="w-4 h-4"></i> Novo Usuário
                        </button>
                    </div>
                    <div id="users-list" class="space-y-4">
                        <p class="text-sm text-slate-400 italic">Carregando usuários...</p>
                    </div>
                </div>

                <!-- Configurações e Manutenção (1 coluna) -->
                <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 class="font-bold text-lg brand-font mb-6 text-rose-500">Zona de Perigo</h3>
                    <div class="space-y-6">
                        <div class="p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-2xl">
                            <div class="flex gap-3">
                                <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500 shrink-0"></i>
                                <div>
                                    <h4 class="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Aviso Operacional</h4>
                                    <p class="text-xs text-amber-600/80 mt-1">Mudanças aqui afetam o acesso de toda a equipe industrial.</p>
                                </div>
                            </div>
                        </div>

                        <div class="pt-6 border-t border-slate-100 dark:border-slate-800">
                             <h4 class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Ação Destrutiva</h4>
                             <button onclick="AdminModule.clearData()" class="w-full btn btn-danger py-4 text-sm shadow-lg shadow-rose-500/20">
                                <i data-lucide="refresh-cw"></i> Zerar Base de Testes
                             </button>
                             <p class="text-[10px] text-slate-400 mt-2 text-center italic">Irá apagar todas as MOVs e resetar o contador ID.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        this.loadUsers();
    },

    async loadUsers() {
        try {
            const users = await Store.list('usuarios');
            const list = document.getElementById('users-list');

            if (!users.length) {
                list.innerHTML = '<p class="text-xs text-slate-400 italic">Nenhum usuário cadastrado.</p>';
                return;
            }

            list.innerHTML = users.map(user => `
                <div class="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20 transition-all">
                    <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                        ${user.nome.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold truncate">${user.nome}</p>
                        <p class="text-[10px] text-slate-500 uppercase font-bold tracking-tight">${user.setor} | ${user.perfil}</p>
                        <p class="text-[10px] text-slate-400 truncate">${user.email}</p>
                    </div>
                    <div class="flex gap-1">
                        <button onclick="AdminModule.openUserModal('${user.id}')" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all" title="Editar">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button onclick="AuthModule.sendResetEmail('${user.email}')" class="p-2 text-slate-400 hover:text-amber-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all" title="Redefinir Senha (E-mail)">
                            <i data-lucide="mail-warning" class="w-4 h-4"></i>
                        </button>
                        <button onclick="AdminModule.deleteUser('${user.id}', '${user.nome}')" class="p-2 text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all" title="Excluir">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();
        } catch (e) { console.error(e); }
    },

    async openUserModal(userId = null) {
        let user = null;
        if (userId) {
            const doc = await FB.db.collection('usuarios').doc(userId).get();
            user = { id: doc.id, ...doc.data() };
        }

        const container = document.getElementById('modal-container');
        container.innerHTML = `
            <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden shadow-indigo-500/10">
                    <header class="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                        <h3 class="text-xl font-bold brand-font">${user ? 'Editar Usuário' : 'Novo Usuário'}</h3>
                        <button onclick="DetailsModule.close()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </button>
                    </header>
                    <div class="p-8 space-y-5">
                        <input type="hidden" id="u-id" value="${user?.id || ''}">
                        <div>
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Nome Completo</label>
                            <input type="text" id="u-name" class="form-input" placeholder="João Silva" value="${user?.nome || ''}">
                        </div>
                        <div>
                            <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">E-mail</label>
                            <input type="email" id="u-email" class="form-input" placeholder="joao@nobelpack.com" value="${user?.email || ''}" ${user ? 'readonly bg-slate-50' : ''}>
                        </div>
                        
                        ${!user ? `
                        <div>
                            <label class="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1 block font-bold">Senha de Acesso</label>
                            <input type="password" id="u-password" class="form-input border-indigo-200" placeholder="No mínimo 6 caracteres">
                            <p class="text-[9px] text-slate-400 mt-1">Essa senha será enviada ao Firebase para autenticação inicial.</p>
                        </div>
                        ` : ''}

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Setor</label>
                                <select id="u-setor" class="form-input">
                                    <option value="QUALIDADE" ${user?.setor === 'QUALIDADE' ? 'selected' : ''}>QUALIDADE</option>
                                    <option value="LOGISTICA" ${user?.setor === 'LOGISTICA' ? 'selected' : ''}>LOGÍSTICA</option>
                                    <option value="PCP" ${user?.setor === 'PCP' ? 'selected' : ''}>PCP</option>
                                    <option value="ARTE_FINAL" ${user?.setor === 'ARTE_FINAL' ? 'selected' : ''}>ARTE FINAL</option>
                                    <option value="ARMAZENAGEM" ${user?.setor === 'ARMAZENAGEM' ? 'selected' : ''}>ARMAZENAGEM</option>
                                    <option value="ADMIN" ${user?.setor === 'ADMIN' ? 'selected' : ''}>ADMINISTRAÇÃO</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Perfil</label>
                                <select id="u-perfil" class="form-input">
                                    <option value="USER" ${user?.perfil === 'USER' ? 'selected' : ''}>OPERADOR</option>
                                    <option value="ADMIN" ${user?.perfil === 'ADMIN' ? 'selected' : ''}>ADMINISTRADOR</option>
                                </select>
                            </div>
                        </div>
                        <button onclick="AdminModule.handleSaveUser()" class="w-full btn btn-primary py-4 mt-4 shadow-lg shadow-indigo-500/20" id="btn-save-user">
                            ${user ? 'Atualizar Perfil' : 'Criar e Provisionar Conta'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
    },

    async handleSaveUser() {
        const id = document.getElementById('u-id').value;
        const email = document.getElementById('u-email').value.trim();
        const nome = document.getElementById('u-name').value.trim();
        const setor = document.getElementById('u-setor').value;
        const perfil = document.getElementById('u-perfil').value;
        const password = document.getElementById('u-password')?.value;
        const btn = document.getElementById('btn-save-user');

        if (!email || !nome) return Utils.notify('Preencha os campos obrigatórios.', 'warning');
        if (!id && (!password || password.length < 6)) return Utils.notify('Defina uma senha de no mínimo 6 caracteres.', 'warning');

        try {
            btn.disabled = true;
            btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Processando...`;
            lucide.createIcons();

            if (!id) {
                // NOVO USUÁRIO: Provisionar no Firebase Auth
                // Usamos FB.config global definido em firebase-config.js
                const tempApp = window.firebase.initializeApp(FB.config, 'tempAuth' + Date.now());
                try {
                    await tempApp.auth().createUserWithEmailAndPassword(email, password);
                    await tempApp.delete();
                } catch (authErr) {
                    if (authErr.code !== 'auth/email-already-in-use') throw authErr;
                }

                await Store.add('usuarios', { email, nome, setor, perfil, ativo: true });
                Utils.notify('Usuário provisionado com sucesso!', 'success');
            } else {
                // EDITAR USUÁRIO
                await Store.update('usuarios', id, { nome, setor, perfil });
                Utils.notify('Perfil atualizado com sucesso!', 'success');
            }

            DetailsModule.close();
            this.render();
        } catch (e) {
            console.error(e);
            Utils.notify('Erro ao salvar: ' + e.message, 'danger');
            btn.disabled = false;
            btn.innerHTML = id ? 'Atualizar Perfil' : 'Criar e Provisionar Conta';
        }
    },

    async deleteUser(id, nome) {
        if (!confirm(`Deseja realmente excluir o usuário ${nome}? Isso removerá apenas o perfil operacional, não a conta de e-mail do Firebase.`)) return;

        try {
            await Store.delete('usuarios', id);
            Utils.notify('Usuário removido da base operacional.');
            this.loadUsers();
        } catch (e) {
            console.error(e);
            Utils.notify('Erro ao excluir.', 'danger');
        }
    },

    async clearData() {
        if (!confirm('!!! ALERTA DE SEGURANÇA !!!\n\nEsta ação é IRREVERSÍVEL.\nApaga todas as movimentações e reseta o contador.\n\nProsseguir?')) return;

        const key = prompt('Digite "admin" para confirmar:');
        if (key !== 'admin') return Utils.notify('Código incorreto.', 'danger');

        try {
            Utils.notify('Resetando base...', 'warning');
            const movs = await Store.list('movimentacoes');
            for (const m of movs) await Store.delete('movimentacoes', m.id);
            await Store.update('counters', 'movimentacoes', { valor: 0 });
            Utils.notify('Sistema zerado!', 'success');
            App.switchView('kanban');
        } catch (e) { console.error(e); }
    }
};
