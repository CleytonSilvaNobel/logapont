/**
 * LOGAPONT - Configuração do Firebase
 */

const firebaseConfig = {
    apiKey: "AIzaSyCiAGUImdK0p9EsMc7AsOvchA-DLm-crfg",
    authDomain: "logapont.firebaseapp.com",
    databaseURL: "https://logapont-default-rtdb.firebaseio.com",
    projectId: "logapont",
    storageBucket: "logapont.firebasestorage.app",
    messagingSenderId: "1048796274212",
    appId: "1:1048796274212:web:09d89cd936b167e3bb02b1",
    measurementId: "G-MWBSM1HFCP"
};

// Singleton para o Firebase
const FB = {
    auth: null,
    db: null,

    init() {
        if (!window.firebase) {
            console.error('Firebase SDK não carregado via CDN.');
            return;
        }

        const app = window.firebase.initializeApp(firebaseConfig);
        this.auth = window.firebase.getAuth(app);
        this.db = window.firebase.getFirestore(app);

        console.log('Firebase Inicializado com Sucesso');
    }
};

// Inicializa o Firebase assim que o script carregar
// Nota: Em um ambiente real, o usuário preencheria a config acima.
// Para o MVP, deixaremos a estrutura pronta.
// Inicialização Imediata
FB.init();
