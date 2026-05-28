/**
 * LOGAPONT - Módulo de Autenticação
 * Usando Firebase Auth compat - mesmo padrão do LogAgend
 */

const AuthModule = {
    init() {
        // onAuthStateChanged: aguarda resposta do Firebase antes de qualquer renderização
        FB.auth.onAuthStateChanged(async (firebaseUser) => {
            // Remove a tela de loading assim que o Firebase responde
            const loading = document.getElementById('initial-loading');
            if (loading) loading.classList.add('hidden');

            if (firebaseUser) {
                // Buscar perfil no Firestore
                const userDocs = await Store.list('usuarios', [{ field: 'email', op: '==', value: firebaseUser.email }]);

                if (userDocs && userDocs.length > 0) {
                    App.showApp(userDocs[0]);
                } else {
                    Utils.notify('Usuário sem perfil cadastrado no sistema. Contate o administrador.', 'danger');
                    this.logout();
                }
            } else {
                this.renderLogin();
            }
        });
    },

    renderLogin() {
        const loginScreen = document.getElementById('login-screen');
        loginScreen.classList.remove('hidden');
        document.getElementById('app-shell').classList.add('hidden');

        loginScreen.innerHTML = `
            <div class="w-full max-w-md p-8 animate-fade-in">
                <div class="text-center mb-10">
                    <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-indigo-500/20">
                        <i data-lucide="package" class="w-8 h-8"></i>
                    </div>
                    <h1 class="text-4xl font-bold tracking-tight brand-font">LOGAPONT</h1>
                    <p class="text-slate-500 mt-2">Controle Operacional de Movimentação</p>
                </div>
                
                <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800">
                    <div class="space-y-6">
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">E-mail</label>
                            <input type="email" id="login-email" class="form-input" placeholder="seu@email.com">
                        </div>
                        <div>
                            <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Senha</label>
                            <input type="password" id="login-password" class="form-input" placeholder="••••••••">
                        </div>
                        <div class="flex justify-end">
                            <button onclick="AuthModule.handleResetPassword()" class="text-xs font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                                Esqueci minha senha
                            </button>
                        </div>
                        <div id="login-error" class="text-red-500 text-sm text-center hidden"></div>
                        <button onclick="AuthModule.handleLogin()" id="btn-login" class="w-full btn btn-primary py-4 rounded-2xl text-lg mt-4">
                            <span>Acessar Sistema</span>
                            <i data-lucide="arrow-right" class="w-5 h-5"></i>
                        </button>
                    </div>
                    
                    <div class="mt-8 text-center">
                        <p class="text-sm text-slate-400">Desenvolvido para NobelPack &copy; 2026</p>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();

        // Permitir login com Enter
        setTimeout(() => {
            const pwInput = document.getElementById('login-password');
            if (pwInput) pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') AuthModule.handleLogin(); });
        }, 100);
    },

    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-login');
        const errEl = document.getElementById('login-error');

        if (!email || !password) {
            return Utils.notify('Preencha todos os campos.', 'warning');
        }

        try {
            errEl.classList.add('hidden');
            btn.disabled = true;
            btn.innerHTML = `<span>Autenticando...</span>`;

            await FB.auth.signInWithEmailAndPassword(email, password);
            // O onAuthStateChanged cuida do resto
        } catch (error) {
            console.error('Login error:', error);
            let msg = 'Erro ao autenticar. Verifique seus dados.';

            // Mensagens Amigáveis
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                msg = 'E-mail ou senha incorretos.';
            } else if (error.code === 'auth/user-not-found') {
                msg = 'Usuário não encontrado.';
            } else if (error.code === 'auth/too-many-requests') {
                msg = 'Muitas tentativas. Aguarde alguns minutos.';
            } else if (error.code === 'auth/api-key-not-valid') {
                msg = 'Erro de Configuração: API Key ainda bloqueada ou inválida.';
            }

            // Exibe o erro legível + o código técnico para debug
            errEl.innerHTML = `${msg}<br><span class="text-[10px] opacity-50">[Código: ${error.code}]</span>`;
            errEl.classList.remove('hidden');
            btn.disabled = false;
            btn.innerHTML = `<span>Acessar Sistema</span><i data-lucide="arrow-right" class="w-5 h-5"></i>`;
            lucide.createIcons();
        }
    },

    async logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            await FB.auth.signOut();
            location.reload();
        }
    },

    async changePassword() {
        const user = FB.auth.currentUser;
        if (!user) return;

        const newPass = prompt('Digite sua nova senha (mínimo 6 caracteres):');
        if (!newPass) return;
        if (newPass.length < 6) return Utils.notify('A senha deve ter pelo menos 6 caracteres.', 'warning');

        try {
            Utils.notify('Atualizando senha...', 'info');
            await user.updatePassword(newPass);
            Utils.notify('Senha alterada com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/requires-recent-login') {
                Utils.notify('Para trocar a senha, você precisa ter logado recentemente. Saia e entre novamente.', 'danger');
            } else {
                Utils.notify('Erro ao alterar senha: ' + error.message, 'danger');
            }
        }
    },

    async sendResetEmail(email) {
        try {
            await FB.auth.sendPasswordResetEmail(email);
            Utils.notify('E-mail de redefinição enviado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            Utils.notify('Erro ao enviar e-mail: ' + error.message, 'danger');
        }
    },

    async handleResetPassword() {
        const email = document.getElementById('login-email').value.trim();
        const targetEmail = prompt('Confirme seu e-mail para redefinição de senha:', email || '');
        if (!targetEmail) return;
        this.sendResetEmail(targetEmail);
    }
};
