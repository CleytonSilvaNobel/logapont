/**
 * LOGAPONT - Módulo de Autenticação
 */

const AuthModule = {
    init() {
        if (!window.firebase) return;

        window.firebase.onAuthStateChanged(FB.auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Ao logar, buscamos os dados complementares no Firestore
                const userDoc = await Store.list('usuarios', [{ field: 'email', op: '==', value: firebaseUser.email }]);

                if (userDoc && userDoc.length > 0) {
                    App.showApp(userDoc[0]);
                } else {
                    // Usuário autenticado no Firebase mas sem perfil no Firestore (caso de erro ou novo admin)
                    if (firebaseUser.email === 'cleyton.silva@nobelpack.com.br') {
                        App.showApp({
                            nome: 'Administrador Inicial',
                            email: firebaseUser.email,
                            setor: 'ADMIN',
                            perfil: 'ADMIN'
                        });
                    } else {
                        Utils.notify('Usuário sem perfil cadastrado. Contate o administrador.', 'danger');
                        this.logout();
                    }
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
    },

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('btn-login');

        if (!email || !password) {
            return Utils.notify('Preencha todos os campos.', 'warning');
        }

        try {
            btn.disabled = true;
            btn.innerHTML = `<span>Autenticando...</span>`;
            await window.firebase.signInWithEmailAndPassword(FB.auth, email, password);
            Utils.notify('Login realizado com sucesso!');
        } catch (error) {
            console.error('Login error:', error);
            Utils.notify('Erro ao autenticar. Verifique seus dados.', 'danger');
            btn.disabled = false;
            btn.innerHTML = `<span>Acessar Sistema</span><i data-lucide="arrow-right" class="w-5 h-5"></i>`;
            lucide.createIcons();
        }
    },

    async logout() {
        if (confirm('Deseja realmente sair do sistema?')) {
            await window.firebase.signOut(FB.auth);
            location.reload();
        }
    }
};
