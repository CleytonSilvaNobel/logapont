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
            <div class="space-y-8 animate-fade-in pb-10">
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
                    <p class="w-full text-[10px] text-slate-400 font-medium italic mt-2 ml-1">
                        * Tendências comparam o período selecionado com o período imediatamente anterior de mesma duração.
                    </p>
                </div>

                <!-- Cards Gerais Otimizados -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-4">
                            <div class="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-blue-600">
                                <i data-lucide="package-check"></i>
                            </div>
                            <div id="trend-concluidos"></div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="total-concluidos-paletes">0</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Total Paletes Recebidos</p>
                    </div>

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
                            <div id="trend-reprovados"></div>
                        </div>
                        <h4 class="text-3xl font-bold dark:text-white" id="total-rejeitado">0</h4>
                        <p class="text-xs font-bold text-slate-400 uppercase tracking-tighter mt-1">Rejeições (Qualidade)</p>
                    </div>
                </div>

                <!-- Insights & Análise IA -->
                <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-white/20 rounded-lg">
                            <i data-lucide="sparkles" class="w-5 h-5 text-white"></i>
                        </div>
                        <h3 class="text-lg font-bold brand-font">Análise Automática & Insights</h3>
                    </div>
                    <div id="insights-content" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Carregado via JS -->
                    </div>
                </div>

                <!-- Gríficos Principais -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div class="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Recebimentos Diários</h4>
                        <div class="h-[250px]">
                            <canvas id="chart-paletes-dia"></canvas>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-rose-500">Reprovações Diárias</h4>
                        <div class="h-[250px]">
                            <canvas id="chart-rejeicoes-dia"></canvas>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 text-amber-500">Divergências Diárias</h4>
                        <div class="h-[250px]">
                            <canvas id="chart-divergencia-dia"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Lead Time Section -->
                <div class="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Lead Time Médio por Etapa</h3>
                    <div id="lead-time-cards" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <!-- Gerado via JS -->
                    </div>
                </div>
            </div>
        `;
        lucide.createIcons();
        if (typeof ChartDataLabels !== 'undefined') Chart.register(ChartDataLabels);
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

            const inicio = new Date(this.filters.inicio + 'T00:00:00');
            const fim = new Date(this.filters.fim + 'T23:59:59');
            const duracao = fim - inicio;

            const inicioAnterior = new Date(inicio.getTime() - duracao - (1000 * 60 * 60 * 24)); // -1 dia extra para segurança de range
            const fimAnterior = new Date(inicio.getTime() - 1);

            const currentMovs = movs.filter(m => {
                const data = m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : new Date(m.timestamps?.criacao);
                return data >= inicio && data <= fim;
            });

            const previousMovs = movs.filter(m => {
                const data = m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : new Date(m.timestamps?.criacao);
                return data >= inicioAnterior && data <= fimAnterior;
            });

            this.calculateMetrics(currentMovs, previousMovs);
            this.renderCharts(currentMovs);
            this.generateInsights(currentMovs, previousMovs);
        } catch (error) {
            console.error(error);
            Utils.notify('Erro ao carregar indicadores.', 'danger');
        }
    },

    calculateMetrics(current, previous) {
        let totalConcluidos = 0;
        let totalEmProcesso = 0;
        let totalRejeitado = 0;
        let totalDivergencia = 0;
        let totalCicloMs = 0;
        let totalCicloCount = 0;

        const etapaTimes = {
            'QUALIDADE': [], 'LOGISTICA': [], 'PCP': [], 'ARMAZENAGEM': [], 'RETRABALHO': []
        };

        current.forEach(m => {
            const paletes = parseInt(m.quantidade?.paletes || 0);

            if (m.fluxo?.etapa === 'FINALIZADO') totalConcluidos += paletes;
            else totalEmProcesso += paletes;

            if (m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE')) totalRejeitado += paletes;
            if (m.historico?.some(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA')) totalDivergencia += paletes;

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

        // UI Update
        document.getElementById('total-concluidos-paletes').innerText = totalConcluidos;
        document.getElementById('total-em-processo').innerText = totalEmProcesso;
        document.getElementById('total-rejeitado').innerText = totalRejeitado;
        document.getElementById('ciclo-medio').innerText = totalCicloCount > 0 ? this.formatDuration(totalCicloMs / totalCicloCount / 1000 / 60) : '-';

        // Trends
        const prevConcluidos = previous.reduce((acc, m) => acc + (m.fluxo?.etapa === 'FINALIZADO' ? parseInt(m.quantidade?.paletes || 0) : 0), 0);
        const prevReprovados = previous.reduce((acc, m) => acc + (m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE') ? parseInt(m.quantidade?.paletes || 0) : 0), 0);

        this.renderTrend('trend-concluidos', totalConcluidos, prevConcluidos, false);
        this.renderTrend('trend-reprovados', totalRejeitado, prevReprovados, true);

        this.renderLeadTimeCards(etapaTimes);
    },

    renderTrend(id, current, previous, inverse) {
        const el = document.getElementById(id);
        if (!el || previous === 0) return;
        const diff = ((current - previous) / previous) * 100;
        const isUp = diff >= 0;
        const color = isUp ? (inverse ? 'text-rose-500' : 'text-emerald-500') : (inverse ? 'text-emerald-500' : 'text-rose-500');
        const icon = isUp ? 'trending-up' : 'trending-down';

        el.innerHTML = `
            <div class="flex items-center gap-1 ${color} font-bold text-xs">
                <i data-lucide="${icon}" class="w-3 h-3"></i>
                ${Math.abs(diff).toFixed(1)}%
            </div>
        `;
        lucide.createIcons();
    },

    renderCharts(movs) {
        const dailyConcluidos = {};
        const dailyRejections = {};
        const dailyDivergences = {};

        movs.forEach(m => {
            const pals = parseInt(m.quantidade?.paletes || 0);

            if (m.fluxo?.etapa === 'FINALIZADO') {
                const date = new Date(m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : m.timestamps?.criacao).toLocaleDateString('pt-BR');
                dailyConcluidos[date] = (dailyConcluidos[date] || 0) + pals;
            }

            const hReprovado = (m.historico || []).find(h => h.acao === 'REPROVADO_QUALIDADE');
            if (hReprovado) {
                const date = new Date(hReprovado.data).toLocaleDateString('pt-BR');
                dailyRejections[date] = (dailyRejections[date] || 0) + pals;
            }

            const hDivergencia = (m.historico || []).find(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA');
            if (hDivergencia) {
                const date = new Date(hDivergencia.data).toLocaleDateString('pt-BR');
                dailyDivergences[date] = (dailyDivergences[date] || 0) + pals;
            }
        });

        const labels = Array.from(new Set([...Object.keys(dailyConcluidos), ...Object.keys(dailyRejections), ...Object.keys(dailyDivergences)]))
            .sort((a, b) => {
                const [da, ma, ya] = a.split('/');
                const [db, mb, yb] = b.split('/');
                return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
            });

        this.createChart('chart-paletes-dia', 'line', labels, [{
            label: 'Recebidos',
            data: labels.map(l => dailyConcluidos[l] || 0),
            backgroundColor: '#6366f122',
            borderColor: '#6366f1',
            tension: 0.4,
            fill: true
        }]);

        this.createChart('chart-rejeicoes-dia', 'line', labels, [{
            label: 'Reprovados',
            data: labels.map(l => dailyRejections[l] || 0),
            backgroundColor: '#ef444422',
            borderColor: '#ef4444',
            tension: 0.4,
            fill: true
        }]);

        this.createChart('chart-divergencia-dia', 'line', labels, [{
            label: 'Divergências',
            data: labels.map(l => dailyDivergences[l] || 0),
            backgroundColor: '#f59e0b22',
            borderColor: '#f59e0b',
            tension: 0.4,
            fill: true
        }]);
    },

    createChart(id, type, labels, datasets) {
        const canvas = document.getElementById(id);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (this[`chart_${id}`]) this[`chart_${id}`].destroy();

        this[`chart_${id}`] = new Chart(ctx, {
            type: type,
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: -2,
                        color: (ctx) => ctx.dataset.borderColor,
                        font: { weight: 'bold', size: 9 },
                        formatter: (val) => val > 0 ? val : ''
                    }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    },

    generateInsights(current, previous) {
        const container = document.getElementById('insights-content');
        if (!container) return;

        const prodQuality = {};
        const prodQuantity = {};

        current.forEach(m => {
            const desc = m.produto?.descricao || 'Outros';
            if (m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE')) prodQuality[desc] = (prodQuality[desc] || 0) + 1;
            if (m.historico?.some(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA')) prodQuantity[desc] = (prodQuantity[desc] || 0) + 1;
        });

        const topQuality = Object.entries(prodQuality).sort((a, b) => b[1] - a[1])[0];
        const topQuantity = Object.entries(prodQuantity).sort((a, b) => b[1] - a[1])[0];

        const totalCurrentProblems = Object.values(prodQuality).reduce((a, b) => a + b, 0) + Object.values(prodQuantity).reduce((a, b) => a + b, 0);

        let html = '';

        if (topQuality) {
            html += `
                <div class="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p class="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-2">Qualidade Crítica</p>
                    <p class="font-bold text-sm leading-tight">${topQuality[0]}</p>
                    <p class="text-xs mt-2 text-white/80">Este produto teve <b>${topQuality[1]}</b> reprovações no período.</p>
                </div>
            `;
        }

        if (topQuantity) {
            html += `
                <div class="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <p class="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-2">Erro de Apontamento</p>
                    <p class="font-bold text-sm leading-tight">${topQuantity[0]}</p>
                    <p class="text-xs mt-2 text-white/80">Maior incidência de divergência de quantidade (<b>${topQuantity[1]}</b> vezes).</p>
                </div>
            `;
        }

        const prevProblems = previous.filter(m => m.historico?.some(h => ['REPROVADO_QUALIDADE', 'ERRO_APONTAMENTO_LOGISTICA'].includes(h.acao))).length;
        const trendText = totalCurrentProblems > prevProblems ? 'aumentando' : 'reduzindo';
        const trendColor = totalCurrentProblems > prevProblems ? 'text-rose-300' : 'text-emerald-300';
        const trendIcon = totalCurrentProblems > prevProblems ? 'trending-up' : 'trending-down';

        html += `
            <div class="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                <p class="text-white/60 text-[10px] uppercase font-bold tracking-widest mb-2">Tendência de Erros</p>
                <div class="flex items-center gap-2 ${trendColor} mb-1">
                    <i data-lucide="${trendIcon}" class="w-4 h-4"></i>
                    <p class="font-bold text-sm">Taxa de erros em queda</p>
                </div>
                <p class="text-xs text-white/80">Total de ${totalCurrentProblems} problemas contra ${prevProblems} no período anterior.</p>
            </div>
        `;

        if (!html) html = '<p class="text-sm text-white/60 italic">Dados insuficientes para gerar insights automáticos.</p>';
        container.innerHTML = html;
        lucide.createIcons();
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
