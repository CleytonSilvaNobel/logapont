## [1.1.0] - 2026-05-28
### Adicionado
- **Fluxo de Divergência**: Novo botão "Divergência" na etapa de Logística para reportar erros da Arte Final com registro obrigatório de motivo.
- **Indicadores de Retrabalho**: Adicionado card e gráfico de "Divergências por Dia" para monitorar a qualidade dos apontamentos da Arte Final.
- **Esqueci minha Senha**: Funcionalidade nativa do Firebase Auth para redefinição de senha na tela de login.
- **Filtros de Pesquisa**: Adicionada barra de busca na lista de movimentações (por Data, ID Sequencial ou Produto).
- **Paginação**: Implementada paginação de 20 registros por vez na lista de movimentações para ganho de performance.

### Fix
- **Login e Compatibilidade**: Corrigido bug que impedia o login após a atualização do `Store.list`. O método agora é retrocompatível com chamadas antigas que esperam um array simples.
- **Botão Esqueci minha Senha**: Ajustado para não interferir no fluxo de autenticação padrão.
- **Unificação de Setores**: Removida a opção de setor "Armazenagem" no cadastro. Operadores agora são centralizados no setor **Logística**, mas o workflow mantém as etapas de logística e armazenagem separadas.
- **Otimização de Banco**: Consultas ao Firestore agora utilizam limites e filtros no servidor (`store.js`) em vez de processamento total no cliente.

## [1.0.1] - 2026-05-27
### Ajustado
- **Cálculo de Indicadores**: Refinada a lógica do BI para contar "Paletes Recebidos" baseando-se no carimbo de tempo do histórico em vez da data de criação, garantindo precisão nos dados de produção diária.
- **Métricas em Processo**: Adicionado indicador de paletes atualmente em fluxo (etapas pendentes).

## [1.0.0] - Versão Inicial
- Lançamento do MVP com Kanban operacional, Gestão de Produtos e Dashboard de BI básico.
