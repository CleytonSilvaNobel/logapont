/**
 * LOGAPONT - Store (Abstração do Firestore)
 */

const Store = {
    /**
     * Busca todos os documentos de uma coleção com filtros opcionais
     */
    async list(collectionName, filters = []) {
        try {
            let q = window.firebase.collection(FB.db, collectionName);

            if (filters.length > 0) {
                filters.forEach(f => {
                    q = window.firebase.query(q, window.firebase.where(f.field, f.op, f.value));
                });
            }

            const querySnapshot = await window.firebase.getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Erro ao listar ${collectionName}:`, error);
            return [];
        }
    },

    /**
     * Escuta mudanças em tempo real em uma coleção
     */
    subscribe(collectionName, callback, filters = []) {
        let q = window.firebase.collection(FB.db, collectionName);

        if (filters.length > 0) {
            filters.forEach(f => {
                q = window.firebase.query(q, window.firebase.where(f.field, f.op, f.value));
            });
        }

        return window.firebase.onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(items);
        });
    },

    /**
     * Adiciona um novo documento
     */
    async add(collectionName, data) {
        try {
            const docRef = window.firebase.doc(window.firebase.collection(FB.db, collectionName));
            await window.firebase.setDoc(docRef, {
                ...data,
                id: docRef.id,
                timestamps: {
                    criacao: window.firebase.serverTimestamp(),
                    atualizacao: window.firebase.serverTimestamp()
                }
            });
            return docRef.id;
        } catch (error) {
            console.error('Erro ao adicionar documento:', error);
            throw error;
        }
    },

    /**
     * Atualiza um documento existente
     */
    async update(collectionName, id, data) {
        try {
            const docRef = window.firebase.doc(FB.db, collectionName, id);
            await window.firebase.updateDoc(docRef, {
                ...data,
                'timestamps.atualizacao': window.firebase.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erro ao atualizar documento:', error);
            throw error;
        }
    }
};
