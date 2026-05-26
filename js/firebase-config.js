/**
 * LOGAPONT - Configuração do Firebase
 * Usando SDK v9 COMPAT - mesmo padrão dos projetos LogAgend/LogTransf
 */

const firebaseConfig = {
    apiKey: "AIzaSyCiAGUImdK0p9EsMc7AsOvcHa-DLm-crfg",
    authDomain: "logapont.firebaseapp.com",
    databaseURL: "https://logapont-default-rtdb.firebaseio.com",
    projectId: "logapont",
    storageBucket: "logapont.firebasestorage.app",
    messagingSenderId: "1048796274212",
    appId: "1:1048796274212:web:09d89cd936b167e3bb02b1",
    measurementId: "G-MWBSM1HFCP"
};

// Inicializa o Firebase (SDK compat está disponível imediatamente via <script> acima)
firebase.initializeApp(firebaseConfig);

// Referências globais
const FB = {
    auth: firebase.auth(),
    db: firebase.firestore()
};

console.log('Firebase Inicializado com Sucesso (compat mode)');
