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
                <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-wrap items-end gap-4 overflow-hidden">
                    <div class="flex-1 min-w-[180px]">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Data Inicial</label>
                        <input type="date" id="filtro-inicio" class="form-input" value="${this.filters.inicio}" onchange="IndicadoresModule.updateFilters()">
                    </div>
                    <div class="flex-1 min-w-[180px]">
                        <label class="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Data Final</label>
                        <input type="date" id="filtro-fim" class="form-input" value="${this.filters.fim}" onchange="IndicadoresModule.updateFilters()">
                    </div>
                    <button onclick="IndicadoresModule.updateFilters()" class="btn btn-primary px-8">
                        <i data-lucide="refresh-cw"></i> Atualizar
                    </button>
                    <p class="w-full text-[10px] text-slate-400 font-medium italic mt-2 ml-1">
                        * Tendências comparam com o período imediatamente anterior de mesma duração.
                    </p>
                </div>

                <!-- 5 Cards Gerais (Top Row) -->
                <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-3">
                            <div class="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600"><i data-lucide="package-check" class="w-5 h-5"></i></div>
                            <div id="trend-concluidos"></div>
                        </div>
                        <h4 class="text-2xl font-bold dark:text-white" id="total-concluidos-paletes">0</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Paletes Recebidos</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-3">
                            <div class="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600"><i data-lucide="truck" class="w-5 h-5"></i></div>
                        </div>
                        <h4 class="text-2xl font-bold dark:text-white" id="total-em-processo">0</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Em Processo</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-3">
                            <div class="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600"><i data-lucide="timer" class="w-5 h-5"></i></div>
                        </div>
                        <h4 class="text-2xl font-bold dark:text-white" id="ciclo-medio">-</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Ciclo Médio</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-3">
                            <div class="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600"><i data-lucide="alert-octagon" class="w-5 h-5"></i></div>
                            <div id="trend-reprovados"></div>
                        </div>
                        <h4 class="text-2xl font-bold dark:text-white" id="total-rejeitado">0</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Reprovações (Qualidade)</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <div class="flex justify-between items-start mb-3">
                            <div class="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600"><i data-lucide="alert-triangle" class="w-5 h-5"></i></div>
                            <div id="trend-divergencias"></div>
                        </div>
                        <h4 class="text-2xl font-bold dark:text-white" id="total-divergencia">0</h4>
                        <p class="text-[10px] font-bold text-slate-400 uppercase mt-1">Divergências (AF)</p>
                    </div>
                </div>

                <!-- Novos KPIs de Eficiência -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-6">
                        <div id="chart-pie-qualidade" class="w-24 h-24"></div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Taxa de Qualidade Final</p>
                            <h4 class="text-3xl font-bold dark:text-white" id="val-taxa-qualidade">0%</h4>
                            <p class="text-[10px] text-slate-400 mt-1">Aprovados de primeira pela Qualidade</p>
                        </div>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-6">
                        <div id="chart-pie-assertividade" class="w-24 h-24"></div>
                        <div>
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Assertividade de Apontamento</p>
                            <h4 class="text-3xl font-bold dark:text-white" id="val-taxa-assertividade">0%</h4>
                            <p class="text-[10px] text-slate-400 mt-1">Movimentações sem divergência de Logística</p>
                        </div>
                    </div>
                </div>

                <!-- Insights & Análise IA -->
                <div class="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20">
                    <div class="flex items-center gap-3 mb-6">
                        <div class="p-2 bg-white/20 rounded-lg"><i data-lucide="sparkles" class="w-5 h-5 text-white"></i></div>
                        <h3 class="text-lg font-bold brand-font">Análise Automática & Insights</h3>
                    </div>
                    <div id="insights-content" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <!-- Conteúdo JS -->
                    </div>
                </div>

                <!-- Gráficos Combinados e Diários -->
                <div class="space-y-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm h-[320px]">
                            <h4 class="text-xs font-bold uppercase text-slate-400 mb-4">Recebimentos Diários</h4>
                            <div class="h-full pb-10"><canvas id="chart-paletes-dia"></canvas></div>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm h-[320px]">
                            <h4 class="text-xs font-bold uppercase text-slate-400 mb-4 text-rose-500">Reprovações Diárias</h4>
                            <div class="h-full pb-10"><canvas id="chart-rejeicoes-dia"></canvas></div>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm h-[320px]">
                            <h4 class="text-xs font-bold uppercase text-slate-400 mb-4 text-amber-500">Divergências Diárias</h4>
                            <div class="h-full pb-10"><canvas id="chart-divergencia-dia"></canvas></div>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h4 class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Visão Combinada: Recebimento vs Problemas (Escala Única)</h4>
                        <div class="h-[400px]">
                            <canvas id="chart-combinado-geral"></canvas>
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

            const inicioAnterior = new Date(inicio.getTime() - duracao - (1000 * 60 * 60 * 24));
            const fimAnterior = new Date(inicio.getTime() - 1);

            const filtered = movs.filter(m => {
                const data = m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : new Date(m.timestamps?.criacao);
                return data >= inicio && data <= fim;
            });

            const previous = movs.filter(m => {
                const data = m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : new Date(m.timestamps?.criacao);
                return data >= inicioAnterior && data <= fimAnterior;
            });

            this.calculateMetrics(filtered, previous);
            this.renderCharts(filtered);
            this.generateInsights(filtered, previous);
        } catch (error) {
            console.error(error);
            Utils.notify('Erro ao carregar indicadores.', 'danger');
        }
    },

    calculateMetrics(current, previous) {
        let totalConcluidos = 0;
        let totalEmProcesso = 0;
        let totalReprovados = 0;
        let totalDivergencias = 0;
        let totalPaletes = 0;
        let totalCicloMs = 0;
        let totalCicloCount = 0;

        const etapaTimes = { 'QUALIDADE': [], 'LOGISTICA': [], 'PCP': [], 'ARMAZENAGEM': [], 'RETRABALHO': [] };

        current.forEach(m => {
            const paletes = parseInt(m.quantidade?.paletes || 0);
            totalPaletes += paletes;

            if (m.fluxo?.etapa === 'FINALIZADO') totalConcluidos += paletes;
            else totalEmProcesso += paletes;

            if (m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE')) totalReprovados += paletes;
            if (m.historico?.some(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA')) totalDivergencias += paletes;

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

        // UI Cards
        document.getElementById('total-concluidos-paletes').innerText = totalConcluidos;
        document.getElementById('total-em-processo').innerText = totalEmProcesso;
        document.getElementById('total-rejeitado').innerText = totalReprovados;
        document.getElementById('total-divergencia').innerText = totalDivergencias;
        document.getElementById('ciclo-medio').innerText = totalCicloCount > 0 ? this.formatDuration(totalCicloMs / totalCicloCount / 1000 / 60) : '-';

        // Eficiência KPIs
        const totalDocs = current.length || 1;
        const taxaQualidade = ((totalDocs - current.filter(m => m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE')).length) / totalDocs * 100).toFixed(1);
        const taxaAssertividade = ((totalDocs - current.filter(m => m.historico?.some(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA')).length) / totalDocs * 100).toFixed(1);

        document.getElementById('val-taxa-qualidade').innerText = `${taxaQualidade}%`;
        document.getElementById('val-taxa-assertividade').innerText = `${taxaAssertividade}%`;

        // Trends
        const prevConcluidos = previous.reduce((acc, m) => acc + (m.fluxo?.etapa === 'FINALIZADO' ? parseInt(m.quantidade?.paletes || 0) : 0), 0);
        const prevReprovados = previous.reduce((acc, m) => acc + (m.historico?.some(h => h.acao === 'REPROVADO_QUALIDADE') ? parseInt(m.quantidade?.paletes || 0) : 0), 0);
        const prevDivergencias = previous.reduce((acc, m) => acc + (m.historico?.some(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA') ? parseInt(m.quantidade?.paletes || 0) : 0), 0);

        this.renderTrend('trend-concluidos', totalConcluidos, prevConcluidos, false);
        this.renderTrend('trend-reprovados', totalReprovados, prevReprovados, true);
        this.renderTrend('trend-divergencias', totalDivergencias, prevDivergencias, true);

        this.renderLeadTimeCards(etapaTimes);
    },

    renderTrend(id, current, previous, inverse) {
        const el = document.getElementById(id);
        if (!el || previous === 0) return;
        const diff = ((current - previous) / previous) * 100;
        if (isNaN(diff)) return;
        const isUp = diff >= 0;
        const color = isUp ? (inverse ? 'text-rose-500' : 'text-emerald-500') : (inverse ? 'text-emerald-500' : 'text-rose-500');
        const icon = isUp ? 'trending-up' : 'trending-down';

        el.innerHTML = `<div class="flex items-center gap-1 ${color} font-bold text-[10px]"><i data-lucide="${icon}" class="w-3 h-3"></i>${Math.abs(diff).toFixed(1)}%</div>`;
        lucide.createIcons();
    },

    renderCharts(movs) {
        const dailyConcluidos = {};
        const dailyRejections = {};
        const dailyDivergences = {};

        movs.forEach(m => {
            const pals = parseInt(m.quantidade?.paletes || 0);
            const dateC = new Date(m.timestamps?.criacao?.toDate ? m.timestamps.criacao.toDate() : m.timestamps?.criacao).toLocaleDateString('pt-BR');

            if (m.fluxo?.etapa === 'FINALIZADO') dailyConcluidos[dateC] = (dailyConcluidos[dateC] || 0) + pals;

            const hRep = (m.historico || []).find(h => h.acao === 'REPROVADO_QUALIDADE');
            if (hRep) {
                const d = new Date(hRep.data).toLocaleDateString('pt-BR');
                dailyRejections[d] = (dailyRejections[d] || 0) + pals;
            }

            const hDiv = (m.historico || []).find(h => h.acao === 'ERRO_APONTAMENTO_LOGISTICA');
            if (hDiv) {
                const d = new Date(hDiv.data).toLocaleDateString('pt-BR');
                dailyDivergences[d] = (dailyDivergences[d] || 0) + pals;
            }
        });

        const labels = Array.from(new Set([...Object.keys(dailyConcluidos), ...Object.keys(dailyRejections), ...Object.keys(dailyDivergences)]))
            .sort((a, b) => {
                const [da, ma, ya] = a.split('/');
                const [db, mb, yb] = b.split('/');
                return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
            });

        // Gráficos Individuais (Linha)
        this.createChart('chart-paletes-dia', 'line', labels, [{ label: 'Recebidos', data: labels.map(l => dailyConcluidos[l] || 0), borderColor: '#6366f1', tension: 0.4, fill: true, backgroundColor: '#6366f111' }], false);
        this.createChart('chart-rejeicoes-dia', 'line', labels, [{ label: 'Reprovados', data: labels.map(l => dailyRejections[l] || 0), borderColor: '#ef4444', tension: 0.4, fill: true, backgroundColor: '#ef444411' }], false);
        this.createChart('chart-divergencia-dia', 'line', labels, [{ label: 'Divergências', data: labels.map(l => dailyDivergences[l] || 0), borderColor: '#f59e0b', tension: 0.4, fill: true, backgroundColor: '#f59e0b11' }], false);

        // Gráfico Combinado Geral
        this.createChart('chart-combinado-geral', 'bar', labels, [
            { type: 'bar', label: 'Recebimentos (Barras)', data: labels.map(l => dailyConcluidos[l] || 0), backgroundColor: '#6366f122', borderColor: '#6366f1', borderWidth: 1, borderRadius: 5 },
            { type: 'line', label: 'Reprovações (Linha)', data: labels.map(l => dailyRejections[l] || 0), borderColor: '#ef4444', borderDash: [5, 5], tension: 0.3, pointStyle: 'circle', pointRadius: 5 },
            { type: 'line', label: 'Divergências (Linha)', data: labels.map(l => dailyDivergences[l] || 0), borderColor: '#f59e0b', tension: 0.3, pointStyle: 'rect', pointRadius: 5 }
        ], true);
    },

    createChart(id, type, labels, datasets, showLegend) {
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
                    legend: { display: showLegend, position: 'top', labels: { boxWidth: 10, font: { size: 10, weight: 'bold' } } },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        offset: -2,
                        color: (ctx) => ctx.dataset.borderColor || ctx.dataset.backgroundColor,
                        font: { weight: 'bold', size: 9 },
                        display: (ctx) => ctx.dataset.data[ctx.dataIndex] > 0
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

        const totalCurrentPrb = Object.values(prodQuality).reduce((a, b) => a + b, 0) + Object.values(prodQuantity).reduce((a, b) => a + b, 0);
        const prevPrb = previous.filter(m => m.historico?.some(h => ['REPROVADO_QUALIDADE', 'ERRO_APONTAMENTO_LOGISTICA'].includes(h.acao))).length;

        const trendText = totalCurrentPrb > prevPrb ? 'aumento' : 'redução';
        const trendColor = totalCurrentPrb > prevPrb ? 'text-rose-300' : 'text-emerald-300';

        let html = '';
        if (topQuality) html += `<div class="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm"><p class="text-white/60 text-[10px] uppercase font-bold mb-2">Qualidade Crítica</p><p class="font-bold text-sm leading-tight">${topQuality[0]}</p><p class="text-[10px] mt-2 text-white/80">${topQuality[1]} reprovações este mês.</p></div>`;
        if (topQuantity) html += `<div class="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm"><p class="text-white/60 text-[10px] uppercase font-bold mb-2">Erro de Apontamento</p><p class="font-bold text-sm leading-tight">${topQuantity[0]}</p><p class="text-[10px] mt-2 text-white/80">${topQuantity[1]} divergências encontradas.</p></div>`;
        html += `<div class="bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm"><p class="text-white/60 text-[10px] uppercase font-bold mb-2">Tendência Geral</p><p class="font-bold text-sm ${trendColor}">${trendText === 'aumento' ? 'Alerta de' : 'Meta de'} ${trendText} de erros.</p><p class="text-[10px] mt-2 text-white/80">${totalCurrentPrb} problemas vs ${prevPrb} anteriores.</p></div>`;

        container.innerHTML = html;
        lucide.createIcons();
    },

    renderLeadTimeCards(times) {
        const container = document.getElementById('lead-time-cards');
        if (!container) return;
        container.innerHTML = Object.keys(times).map(etapa => {
            const values = times[etapa];
            const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            let color = 'text-indigo-600';
            if (avg > 120) color = 'text-rose-500';
            else if (avg > 60) color = 'text-amber-500';
            return `
                <div class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-center">
                    <p class="text-[10px] font-bold text-slate-400 uppercase mb-2">${etapa}</p>
                    <p class="text-lg font-bold ${color}">${avg > 0 ? this.formatDuration(avg) : '-'}</p>
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
