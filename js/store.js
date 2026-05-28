/**
 * LOGAPONT - Store (Abstração do Firestore)
 * Usando API compat do Firebase
 */

const Store = {
    /**
     * Busca documentos de uma coleção com suporte a filtros, ordenação e paginação
     * @param {string} collectionName 
     * @param {Array|Object} filtersOrOptions - Array de filtros (legado) ou Objeto de opções (novo)
     */
    async list(collectionName, filtersOrOptions = []) {
        let filters = [];
        let options = {};

        // Detectar se é o formato novo (objeto) ou legado (array de filtros)
        if (Array.isArray(filtersOrOptions)) {
            filters = filtersOrOptions;
        } else {
            options = filtersOrOptions;
            filters = options.filters || [];
        }

        const { orderByField = null, orderDir = 'desc', limit = null, startAfter = null } = options;

        try {
            let q = FB.db.collection(collectionName);

            filters.forEach(f => {
                q = q.where(f.field, f.op, f.value);
            });

            if (orderByField) {
                q = q.orderBy(orderByField, orderDir);
            }

            if (startAfter) {
                q = q.startAfter(startAfter);
            }

            if (limit) {
                q = q.limit(limit);
            }

            const snapshot = await q.get();
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            // Se o usuário solicitou opções de paginação/ordenação explícitas via objeto,
            // retornamos o formato de objeto com metadados. Caso contrário, mantemos o array simples (retrocompatibilidade).
            if (!Array.isArray(filtersOrOptions) && (limit || startAfter || orderByField)) {
                return {
                    docs: docs,
                    lastVisible: snapshot.docs[snapshot.docs.length - 1] || null
                };
            }

            return docs;
        } catch (error) {
            console.error(`Erro ao listar ${collectionName}:`, error);
            return Array.isArray(filtersOrOptions) ? [] : { docs: [], lastVisible: null };
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
    },

    /**
     * Remove um documento pelo ID
     */
    async delete(collectionName, id) {
        try {
            await FB.db.collection(collectionName).doc(id).delete();
            return true;
        } catch (error) {
            console.error('Erro ao deletar documento:', error);
            throw error;
        }
    }
};
