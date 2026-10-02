# Ajuda da Central

Módulo F11, 02/10/2026. Menu Orientações → Ajuda, rota /ajuda dentro da área autenticada. Conteúdo estático em src/app/features/ajuda/ajuda-temas.ts; tela OnPush com busca local por título/passos, ignorando caixa e acentos, contador de resultados, estado vazio, limpeza da busca e tópicos expansíveis pelo teclado.

Onze temas: primeiros passos; clientes; catálogo; contratações/provisionamento/troca de plano; cobranças/pagamentos/isenções; Mercado Pago; financeiro operacional; consumo; suporte; segurança/MFA; situações/bloqueio/histórico. Links apontam para módulos reais. O financeiro abre ajuda contextual em /ajuda?tema=financeiro. Parâmetro tema reage às mudanças da rota e só compara IDs do catálogo estático, sem HTML dinâmico ou URLs fornecidas pelo usuário.

Não faz chamadas de negócio, não lê fichas, não ativa recursos nem configura credenciais. Explica limites atuais, como checkout por cobrança sem recorrência automática, receitas de assinatura sem duplicação manual e saldo por conta apenas manual. MFA e suporte são apresentados como funcionalidades da própria aplicação, sem copiar chaves/códigos para a ajuda. Orientações são versionadas junto ao código; revisar ao alterar o fluxo real. Não é onboarding automatizado, documentação jurídica ou chatbot.

Validação: executar npm test, npm run build:prod e python scripts/verificar-docs.py antes de commitar. Homologação visual em staging permanece independente dessas verificações. Sem alteração de API, migration ou implantação.

## Validação executada em 02/10/2026

222 testes aprovados; build de produção, checagem documental e git diff --check aprovados. IDs únicos e atalhos com rotas existentes conferidos. Backends sem alteração e sem reexecução de testes nesta etapa. Homologação visual em staging pendente.
