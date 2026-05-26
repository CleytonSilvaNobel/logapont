/**
 * LOGAPONT - Módulo de Lista de Movimentações
 */

const MovimentacaoModule = {
    renderList() {
        const mainContent = document.getElementById('main-content');
        const viewTitle = document.getElementById('view-title');
        if (viewTitle) viewTitle.innerText = 'Histórico de Movimentações';

        mainContent.innerHTML = `
            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden animate-fade-in">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Sequencial</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Produto</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Quantidade</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Etapa Atual</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Situação</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Criação</th>
                                <th class="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="movs-list-body">
                            <tr><td colspan="7" class="p-10 text-center text-slate-400 italic">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.loadList();
    },

    async loadList() {
        const movs = await Store.list('movimentacoes', []);
        const body = document.getElementById('movs-list-body');

        if (!movs.length) {
            body.innerHTML = '<tr><td colspan="7" class="p-10 text-center text-slate-400">Nenhuma movimentação registrada.</td></tr>';
            return;
        }

        // Ordenar por data de criação desc
        const sorted = movs.sort((a, b) => {
            const dateA = a.timestamps?.criacao?.toDate ? a.timestamps.criacao.toDate() : new Date(a.timestamps?.criacao);
            const dateB = b.timestamps?.criacao?.toDate ? b.timestamps.criacao.toDate() : new Date(b.timestamps?.criacao);
            return dateB - dateA;
        });

        body.innerHTML = sorted.map(mov => `
            <tr class="border-b border-gray-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td class="p-4 font-bold text-slate-700 dark:text-slate-300">${mov.idSequencial}</td>
                <td class="p-4">
                    <p class="font-medium text-sm">${mov.produto?.descricao}</p>
                    <p class="text-[10px] text-slate-400">${mov.produto?.id || '-'}</p>
                </td>
                <td class="p-4 text-xs font-semibold">
                    ${mov.quantidade?.caixas} cx / ${mov.quantidade?.unidades} un
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-md text-[10px] font-bold uppercase">
                        ${mov.fluxo?.etapa}
                    </span>
                </td>
                <td class="p-4">
                    <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md text-[10px] font-bold uppercase">
                        ${mov.fluxo?.situacao}
                    </span>
                </td>
                <td class="p-4 text-xs text-slate-400">
                    ${Utils.formatDate(mov.timestamps?.criacao?.toDate ? mov.timestamps.criacao.toDate() : mov.timestamps?.criacao)}
                </td>
                <td class="p-4 text-right">
                    <button onclick="DetailsModule.open('${mov.id}')" class="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                        <i data-lucide="eye" class="w-4 h-4"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        lucide.createIcons();
    }
};
