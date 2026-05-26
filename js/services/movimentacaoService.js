/**
 * LOGAPONT - Serviço de Movimentações
 */

const MovimentacaoService = {
    /**
     * Gera o ID Sequencial (MOV-XXXXXX) via Transação do Firestore
     */
    async generateSequentialId() {
        const counterRef = window.firebase.doc(FB.db, 'counters', 'movimentacoes');

        try {
            const result = await window.firebase.runTransaction(FB.db, async (transaction) => {
                const counterDoc = await transaction.get(counterRef);

                let nextValue = 1;
                if (counterDoc.exists()) {
                    nextValue = (counterDoc.data().valor || 0) + 1;
                }

                transaction.set(counterRef, { valor: nextValue });

                // Formata MOV-000001
                return `MOV-${nextValue.toString().padStart(6, '0')}`;
            });

            return result;
        } catch (error) {
            console.error('Erro na transação de ID:', error);
            throw new Error('Falha ao gerar ID sequencial.');
        }
    },

    /**
     * Cria uma nova movimentação
     */
    async create(movData) {
        try {
            const idSequencial = await this.generateSequentialId();

            const docData = {
                idSequencial,
                ...movData,
                fluxo: {
                    etapa: 'QUALIDADE',
                    situacao: 'AGUARDANDO'
                },
                retrabalho: {
                    quantidade: 0,
                    necessario: false,
                    concluido: false
                },
                historico: [{
                    data: new Date().toISOString(),
                    usuario: {
                        id: App.user.id || 'system',
                        nome: App.user.nome
                    },
                    de: { etapa: 'CRIADO', situacao: '-' },
                    para: { etapa: 'QUALIDADE', situacao: 'AGUARDANDO' },
                    acao: 'CRIACAO',
                    observacao: 'Início do fluxo operacional'
                }]
            };

            return await Store.add('movimentacoes', docData);
        } catch (error) {
            Utils.notify('Erro ao criar movimentação.', 'danger');
            throw error;
        }
    },

    /**
     * Atualiza o status de uma movimentação e registra no histórico
     */
    async updateStatus(movId, de, para, acao, observacao = '') {
        try {
            const movRef = window.firebase.doc(FB.db, 'movimentacoes', movId);
            const movDoc = await window.firebase.getDoc(movRef);

            if (!movDoc.exists()) throw new Error('Movimentação não encontrada');

            const currentMov = movDoc.data();
            const historico = currentMov.historico || [];

            const novoEvento = {
                data: new Date().toISOString(),
                usuario: {
                    id: App.user.id || 'system',
                    nome: App.user.nome
                },
                de,
                para,
                acao,
                observacao
            };

            await Store.update('movimentacoes', movId, {
                fluxo: para,
                historico: [...historico, novoEvento]
            });

            Utils.notify(`MOV atualizada para ${para.etapa}`);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            Utils.notify('Erro ao atualizar status.', 'danger');
            throw error;
        }
    }
};
