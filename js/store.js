/**
 * LOGAPONT - Store (Abstração do Firestore)
 * Usando API compat do Firebase
 */

const Store = {
    /**
     * Busca todos os documentos de uma coleção com filtros opcionais
     */
    async list(collectionName, filters = []) {
        try {
            let q = FB.db.collection(collectionName);

            filters.forEach(f => {
                q = q.where(f.field, f.op, f.value);
            });

            const snapshot = await q.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error(`Erro ao listar ${collectionName}:`, error);
            return [];
        }
    },

    /**
     * Escuta mudanças em tempo real em uma coleção
     */
    subscribe(collectionName, callback, filters = [], orderByField = null) {
        let q = FB.db.collection(collectionName);

        filters.forEach(f => {
            q = q.where(f.field, f.op, f.value);
        });

        if (orderByField) {
            q = q.orderBy(orderByField);
        }

        return q.onSnapshot((snapshot) => {
            const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(items);
        });
    },

    /**
     * Adiciona um novo documento com ID automático
     */
    async add(collectionName, data) {
        try {
            const docRef = FB.db.collection(collectionName).doc();
            await docRef.set({
                ...data,
                id: docRef.id,
                timestamps: {
                    criacao: firebase.firestore.FieldValue.serverTimestamp(),
                    atualizacao: firebase.firestore.FieldValue.serverTimestamp()
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
            const docRef = FB.db.collection(collectionName).doc(id);
            await docRef.update({
                ...data,
                'timestamps.atualizacao': firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Erro ao atualizar documento:', error);
            throw error;
        }
    },

    /**
     * Busca um documento pelo ID
     */
    async get(collectionName, id) {
        try {
            const docSnap = await FB.db.collection(collectionName).doc(id).get();
            if (docSnap.exists) {
                return { id: docSnap.id, ...docSnap.data() };
            }
            return null;
        } catch (error) {
            console.error(`Erro ao buscar ${collectionName}/${id}:`, error);
            return null;
        }
    },

    /**
     * Executa uma transação (para IDs sequenciais)
     */
    async runTransaction(fn) {
        return FB.db.runTransaction(fn);
    }
};
