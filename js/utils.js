/**
 * LOGAPONT - Utilitários
 */

const Utils = {
    /**
     * Exibe uma notificação estilo Toast
     */
    notify(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-2xl transition-all duration-300 transform translate-y-10 opacity-0 flex items-center gap-2 text-white`;
        
        const colors = {
            success: 'bg-emerald-500',
            warning: 'bg-amber-500',
            danger: 'bg-red-500',
            info: 'bg-indigo-500'
        };
        
        const icons = {
            success: 'check-circle',
            warning: 'alert-triangle',
            danger: 'x-circle',
            info: 'info'
        };
        
        toast.classList.add(colors[type] || colors.info);
        toast.innerHTML = `<i data-lucide="${icons[type] || icons.info}" class="w-5 h-5"></i><span>${message}</span>`;
        
        document.body.appendChild(toast);
        lucide.createIcons({ props: { class: 'w-5 h-5' } });
        
        // Show
        setTimeout(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);
        
        // Hide and Remove
        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    /**
     * Formata data para exibição PT-BR
     */
    formatDate(date) {
        if (!date) return '-';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Calcula tempo restante ou atraso para SLA
     */
    getSLATime(creationDate) {
        if (!creationDate) return { text: '-', color: 'text-slate-400' };
        
        const start = new Date(creationDate);
        const now = new Date();
        const diffMs = now - start;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return { text: `${diffMins}min`, color: 'text-emerald-500', code: 'safe' };
        if (diffMins < 120) return { text: `${Math.floor(diffMins/60)}h ${diffMins%60}min`, color: 'text-amber-500', code: 'warning' };
        return { text: `${Math.floor(diffMins/60)}h ${diffMins%60}min`, color: 'text-red-500', code: 'danger' };
    },

    /**
     * Gera um ID simples se necessário (o Firestore gera IDs automaticamente)
     */
    generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
};
