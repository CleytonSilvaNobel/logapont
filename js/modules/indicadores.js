/**
 * LOGAPONT - Módulo de Indicadores (BI)
 */

const IndicadoresModule = {
    filters: {
        inicio: '',
        fim: ''
    },

    async render() {
        const mainContent = document.getElementById('main-content');
        document.getElementById('view-title').textContent = 'Indicadores de Performance';

        // Padrão: Mês Vigente
        if (!this.filters.inicio) {
            const now = new Date();
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            this.filters.inicio = firstDay.toISOString().split('T')[0];
            this.filters.fim = now.toISOString().split('T')[0];
        }

        mainContent.innerHTML = `
            <div class="space-y-8 animate-fade-in">
                <!-- Filtros -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-wrap items-end gap-4">
                    <div class="flex-1 min-w-[200px]">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Data Inicial</label>
                        <input type="date" id="filtro-inicio" class="form-input" value="${this.filters.inicio}" onchange="IndicadoresModule.updateFilters()">
                    </div>
                    <div class="flex-1 min-w-[200px]">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Data Final</label>
                        <input type="date" id="filtro-fim" class="form-input" value="${this.filters.fim}" onchange="IndicadoresModule.updateFilters()">
                    </div>
                    <button onclick="IndicadoresModule.updateFilters()" class="btn btn-primary px-8">
                        <i data-lucide="refresh-cw"></i> Atualizar
                    </button>
                </div>

                <!-- Cards de Lead Time -->
                <div>
                    <h3 class="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 ml-2">Tempo Médio por Etapa (Lead Time)</h3>
                    <div id="lead-time-cards" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <!-- Gerado via JS -->
                    </div>
                </div>

                <!-- Cards Gerais -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600">
                                <i data-lucide="truck"></i>
                            </div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="total-em-processo">0</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Paletes em Processo</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600">
                                <i data-lucide="timer"></i>
                            </div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="ciclo-medio">-</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Tempo Total de Ciclo</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl text-rose-600">
                                <i data-lucide="alert-octagon"></i>
                            </div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="total-rejeitado">0</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Rejeições (Paletes)</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600">
                                <i data-lucide="alert-triangle"></i>
                            </div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="total-divergencia">0</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Divergências (Arte Final)</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                                <i data-lucide="package-check"></i>
                            </div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="total-concluidos-paletes">0</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Total Paletes Concluídos</p>
                    </div>
                </div>

                <!-- Gríficos Principais -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6" id="label-chart-concluidos">Concluídos Diários (Paletes)</h4>
                        <div class="h-[300px]">
                            <canvas id="chart-paletes-dia"></canvas>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Reprovações por Dia (Paletes)</h4>
                        <div class="h-[300px]">
                            <canvas id="chart-rejeicoes-dia"></canvas>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Divergências por Dia (Paletes)</h4>
                        <div class="h-[300px]">
                            <canvas id="chart-divergencia-dia"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        this.loadStats();
    },

    updateFilters() {
        this.filters.inicio = document.getElementById('filtro-inicio').value;
        this.filters.fim = document.getElementById('filtro-fim').value;
        this.loadStats();
    },

    async loadStats() {
        try {
            const movs = await Store.list('movimentacoes');
            const filtered = movs.filter(m => {
                const dataCriacao = m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : new Date(m.timestamps?.criacao);
                const inicio = new Date(this.filters.inicio + 'T00:00:00');
                const fim = new Date(this.filters.fim + 'T23:59:59');
                return dataCriacao >= inicio && dataCriacao <= fim;
            });

            this.calculateMetrics(filtered);
            this.renderCharts(filtered);
        } catch (error) {
            console.error(error);
            Utils.notify('Erro ao carregar indicadores.', 'danger');
        }
    },

    calculateMetrics(movs) {
        let totalConcluidosPaletes = 0;
        let totalEmProcessoPaletes = 0;
        let totalRejeitadoPaletes = 0;
        let totalDivergenciaPaletes = 0;
        let totalCicloMs = 0;
        let totalCicloCount = 0;

        const etapaTimes = {
            'QUALIDADE': [], 'LOGISTICA': [], 'PCP': [], 'ARMAZENAGEM': [], 'RETRABALHO': []
        };

        movs.forEach(m => {
            const paletes = parseInt(m.quantidade?.paletes || 0);

            if (m.fluxo?.etapa === 'FINALIZADO') {
                totalConcluidosPaletes += paletes;
            } else {
                totalEmProcessoPaletes += paletes;
            }

            if (m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE')) {
                totalRejeitadoPaletes += paletes;
            }

            if (m.historico?.some(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA')) {
                totalDivergenciaPaletes += paletes;
            }

            const hist = m.historico || [];
            for (let i = 0; i < hist.length - 1; i++) {
                const entrada = new Date(hist[i].data);
                const saida = new Date(hist[i + 1].data);
                const diff = (saida - entrada) / 1000 / 60;
                if (etapaTimes[hist[i].para.etapa]) etapaTimes[hist[i].para.etapa].push(diff);
            }

            if (m.fluxo?.etapa === 'FINALIZADO' && hist.length > 1) {
                totalCicloMs += (new Date(hist[hist.length - 1].data) - new Date(hist[0].data));
                totalCicloCount++;
            }
        });

        const elProcesso = document.getElementById('total-em-processo');
        const elRejeitado = document.getElementById('total-rejeitado');
        const elDivergencia = document.getElementById('total-divergencia');
        const elConcluidos = document.getElementById('total-concluidos-paletes');
        const elCiclo = document.getElementById('ciclo-medio');

        if (elProcesso) elProcesso.innerText = totalEmProcessoPaletes;
        if (elRejeitado) elRejeitado.innerText = totalRejeitadoPaletes;
        if (elDivergencia) elDivergencia.innerText = totalDivergenciaPaletes;
        if (elConcluidos) elConcluidos.innerText = totalConcluidosPaletes;

        if (elCiclo && totalCicloCount > 0) {
            elCiclo.innerText = this.formatDuration(totalCicloMs / totalCicloCount / 1000 / 60);
        }

        this.renderLeadTimeCards(etapaTimes);
    },

    renderCharts(movs) {
        const dailyConcluidos = {};
        const dailyRejections = {};
        const dailyDivergences = {};

        movs.forEach(m => {
            const pals = parseInt(m.quantidade?.paletes || 0);

            // 1. Lógica para CONCLUÍDOS (Apenas FINALIZADO) - Usa data de criação/referência
            if (m.fluxo?.etapa === 'FINALIZADO') {
                const dateConclusao = new Date(m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : m.timestamps?.criacao).toLocaleDateString('pt-BR');
                dailyConcluidos[dateConclusao] = (dailyConcluidos[dateConclusao] || 0) + pals;
            }

            // 2. Lógica para REPROVADOS (Independe de estar finalizado) - Usa data exata da reprovação
            const hReprovado = (m.historico || []).find(h => h.acao === 'REPROVADO_QUALIDADE');
            if (hReprovado) {
                const dateReprovacao = new Date(hReprovado.data).toLocaleDateString('pt-BR');
                dailyRejections[dateReprovacao] = (dailyRejections[dateReprovacao] || 0) + pals;
            }

            // 3. Lógica para DIVERGÊNCIAS - Usa data exata da divergência
            const hDivergencia = (m.historico || []).find(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA');
            if (hDivergencia) {
                const dateDivergencia = new Date(hDivergencia.data).toLocaleDateString('pt-BR');
                dailyDivergences[dateDivergencia] = (dailyDivergences[dateDivergencia] || 0) + pals;
            }
        });

        // Garantir que os labels contenham datas de todos para manter o eixo X sincronizado
        const allDates = new Set([...Object.keys(dailyConcluidos), ...Object.keys(dailyRejections), ...Object.keys(dailyDivergences)]);
        const labels = Array.from(allDates).sort((a, b) => {
            const [da, ma, ya] = a.split('/');
            const [db, mb, yb] = b.split('/');
            return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
        });

        const concluidosData = labels.map(l => dailyConcluidos[l] || 0);
        const rejectionsData = labels.map(l => dailyRejections[l] || 0);
        const divergencesData = labels.map(l => dailyDivergences[l] || 0);

        this.createChart('chart-paletes-dia', labels, concluidosData, 'Paletes Concluídos', '#6366f1');
        this.createChart('chart-rejeicoes-dia', labels, rejectionsData, 'Paletes Reprovados', '#ef4444');
        this.createChart('chart-divergencia-dia', labels, divergencesData, 'Paletes com Divergência', '#f59e0b');
    },

    createChart(id, labels, data, label, color) {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (this[`chart_${id}`]) this[`chart_${id}`].destroy();
        this[`chart_${id}`] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: color + '33',
                    borderColor: color,
                    borderWidth: 2,
                    borderRadius: 8,
                    barThickness: 30
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    },

    renderLeadTimeCards(times) {
        const container = document.getElementById('lead-time-cards');
        if (!container) return;
        const etapas = Object.keys(times);
        container.innerHTML = etapas.map(etapa => {
            const values = times[etapa];
            const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            let color = 'text-indigo-600';
            if (avg > 120) color = 'text-rose-500';
            else if (avg > 60) color = 'text-amber-500';
            return `
                <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">${etapa}</p>
                    <p class="text-xl font-bold ${color}">${avg > 0 ? this.formatDuration(avg) : '-'}</p>
                    <p class="text-[9px] text-slate-400 mt-1">${values.length} movimentações</p>
                </div>
            `;
        }).join('');
    },

    formatDuration(mins) {
        if (mins < 60) return `${Math.round(mins)} min`;
        const h = Math.floor(mins / 60);
        const m = Math.round(mins % 60);
        return `${h}h ${m}min`;
    }
};
