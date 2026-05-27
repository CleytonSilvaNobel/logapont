/**
 * LOGAPONT - Módulo de Gestão de Produtos
 */

const ProdutosModule = {
    async render() {
        const mainContent = document.getElementById('main-content');
        document.getElementById('view-title').textContent = 'Cadastro de Produtos';

        mainContent.innerHTML = `
            <div class="space-y-6 animate-fade-in">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 class="text-xl font-bold dark:text-white">Lista de Produtos</h3>
                        <p class="text-sm text-slate-500">Gerencie o cadastro técnico para automação de MOVs</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button onclick="ProdutosModule.downloadTemplate()" class="btn btn-secondary text-xs">
                            <i data-lucide="download"></i> Template Excel
                        </button>
                        <button onclick="document.getElementById('excel-input').click()" class="btn btn-secondary text-xs">
                            <i data-lucide="file-up"></i> Importar Excel
                        </button>
                        <input type="file" id="excel-input" class="hidden" accept=".xlsx, .xls, .csv" onchange="ProdutosModule.handleImport(this)">
                        <button onclick="ProdutosModule.openModal()" class="btn btn-primary">
                            <i data-lucide="plus"></i> Novo Produto
                        </button>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50">
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Código</th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Descrição</th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Unid / Cx</th>
                                <th class="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="produtos-list" class="divide-y divide-gray-100 dark:divide-slate-800">
                            <tr>
                                <td colspan="4" class="px-6 py-10 text-center text-slate-400">Carregando produtos...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.loadList();
        lucide.createIcons();
    },

    async loadList() {
        try {
            const produtos = await Store.list('produtos');
            const listEl = document.getElementById('produtos-list');

            if (produtos.length === 0) {
                listEl.innerHTML = `<tr><td colspan="4" class="px-6 py-10 text-center text-slate-400 italic">Nenhum produto cadastrado.</td></tr>`;
                return;
            }

            listEl.innerHTML = produtos.map(p => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="px-6 py-4 font-bold text-indigo-600">${p.codigo}</td>
                    <td class="px-6 py-4 text-sm dark:text-slate-300 font-medium">${p.descricao}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">${p.unidadePorCaixa}</td>
                    <td class="px-6 py-4 text-right flex justify-end gap-2">
                        <button onclick="ProdutosModule.openModal('${p.id}')" class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-all" title="Editar">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <button onclick="ProdutosModule.delete('${p.id}')" class="p-2 text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all" title="Excluir">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            lucide.createIcons();
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            Utils.notify('Falha ao carregar lista de produtos.', 'danger');
        }
    },

    async openModal(productId = null) {
        let product = { codigo: '', descricao: '', unidadePorCaixa: 1 };
        if (productId) {
            product = await Store.get('produtos', productId);
        }

        const modal = document.createElement('div');
        modal.id = 'product-modal';
        modal.className = 'fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in';
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20 dark:border-slate-800">
                <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 class="text-xl font-bold dark:text-white">${productId ? 'Editar Produto' : 'Novo Produto'}</h3>
                    <button onclick="this.closest('#product-modal').remove()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>
                
                <form id="form-produto" class="p-6 space-y-4">
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Código do Produto</label>
                        <input type="text" id="prod-codigo" class="form-input" required placeholder="Ex: 10020" value="${product.codigo}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descrição Completa</label>
                        <input type="text" id="prod-descricao" class="form-input" required placeholder="Ex: Caixa de Papelão 20kg" value="${product.descricao}">
                    </div>
                    <div>
                        <label class="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Unidades por Caixa</label>
                        <input type="number" id="prod-unid-cx" class="form-input" required value="${product.unidadePorCaixa}" min="1">
                    </div>

                    <div class="pt-4 flex gap-3">
                        <button type="button" onclick="this.closest('#product-modal').remove()" class="flex-1 btn btn-secondary py-3">Cancelar</button>
                        <button type="submit" class="flex-[2] btn btn-primary py-3">Salvar Produto</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(modal);
        lucide.createIcons();

        document.getElementById('form-produto').onsubmit = (e) => this.handleSave(e, productId);
    },

    async handleSave(e, productId = null) {
        e.preventDefault();
        const data = {
            codigo: document.getElementById('prod-codigo').value.trim().toUpperCase(),
            descricao: document.getElementById('prod-descricao').value.trim(),
            unidadePorCaixa: parseInt(document.getElementById('prod-unid-cx').value) || 1
        };

        try {
            if (productId) {
                await Store.update('produtos', productId, data);
                Utils.notify('Produto atualizado!');
            } else {
                await Store.add('produtos', data);
                Utils.notify('Produto cadastrado com sucesso!');
            }
            document.getElementById('product-modal').remove();
            this.render();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            Utils.notify('Falha ao salvar produto.', 'danger');
        }
    },

    async delete(id) {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;
        try {
            await Store.delete('produtos', id);
            Utils.notify('Produto removido.');
            this.loadList();
        } catch (error) {
            Utils.notify('Falha ao remover produto.', 'danger');
        }
    },

    // --- Lógica Excel ---

    downloadTemplate() {
        const data = [
            ['Código', 'Descrição', 'Unid por Caixa'],
            ['10020', 'CAIXA TESTE NOBEL 20KG', '1'],
            ['20050', 'SACOLA KRAFT MEDIA', '50']
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Modelo_Produtos");
        XLSX.writeFile(wb, "Modelo_Importacao_Produtos.xlsx");
    },

    async handleImport(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet);

                Utils.notify('Processando arquivo...', 'warning');

                let successCount = 0;
                for (const row of rows) {
                    const codigo = String(row['Código'] || row['codigo'] || '').trim().toUpperCase();
                    const descricao = String(row['Descrição'] || row['descricao'] || '').trim();
                    const unidCx = parseInt(row['Unid por Caixa'] || row['unid-cx'] || 1);

                    if (codigo && descricao) {
                        await Store.add('produtos', {
                            codigo,
                            descricao,
                            unidadePorCaixa: unidCx
                        });
                        successCount++;
                    }
                }

                Utils.notify(`${successCount} produtos importados!`, 'success');
                this.render();
            } catch (error) {
                console.error(error);
                Utils.notify('Erro ao importar Excel. Verifique o formato.', 'danger');
            }
        };
        reader.readAsArrayBuffer(file);
        input.value = ''; // Reset input
    },

    async findByCodigo(codigo) {
        if (!codigo) return null;
        const normalized = codigo.trim().toUpperCase();
        const results = await Store.list('produtos', [{ field: 'codigo', op: '==', value: normalized }]);
        return results.length > 0 ? results[0] : null;
    }
};
