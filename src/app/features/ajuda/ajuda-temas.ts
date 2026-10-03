import { SecaoId } from '../../core/layout/navegacao';

/** Orientações estáticas: revisar junto com a funcionalidade, sem buscar dados de clientes. */
export interface PerguntaAjuda { pergunta: string; resposta: string; }
export interface TemaAjuda {
  id: string;
  titulo: string;
  /** Seção do menu sob a qual o tema aparece na página de Ajuda. */
  secao: SecaoId;
  url: string;
  /** Para que serve a tela, em uma ou duas frases. */
  resumo: string;
  passos: readonly string[];
  cuidados?: readonly string[];
  perguntas?: readonly PerguntaAjuda[];
  relacionados?: readonly string[];
}

export const TEMAS: readonly TemaAjuda[] = [
  {
    id: 'primeiros-passos', titulo: 'Primeiros passos: do catálogo à contratação', secao: 'orientacoes', url: '/catalogo/produtos',
    resumo: 'O caminho completo para colocar uma paróquia no ar: catálogo configurado, cliente cadastrado, contratação criada e instância provisionada.',
    passos: [
      'Confira o produto, seus recursos, planos, preços e adicionais no Catálogo antes de contratar.',
      'Cadastre o cliente e crie sua contratação escolhendo produto, plano, periodicidade e vencimento.',
      'Abra a contratação e confira os dados de provisionamento antes de criar a instância. Acompanhe o resultado na ficha.',
      'Depois do provisionamento, confira situação, cobranças e consumo na contratação. As permissões dos usuários da paróquia são configuradas no Servirea.',
    ],
    perguntas: [{ pergunta: 'Onde encontro qualquer tela rapidamente?', resposta: 'Use a barra "O que você deseja fazer?" no topo (ou Ctrl+K), o botão Todas as telas ou as estrelas para favoritar o que mais usa.' }],
    relacionados: ['catalogo', 'clientes', 'contratacoes'],
  },
  {
    id: 'clientes', titulo: 'Clientes e dados de contato', secao: 'comercial', url: '/clientes',
    resumo: 'O cadastro comercial de quem contrata: paróquia ou entidade, documento e contatos. Cada cliente pode ter várias contratações.',
    passos: [
      'Busque o cliente antes de cadastrar outro. Confira nome, documento e contatos.',
      'Use a ficha do cliente para consultar suas contratações. O cliente é o cadastro comercial; cada contratação identifica o produto e o plano.',
      'Mantenha o contato comercial atualizado. As fichas de pessoas da paróquia são administradas no aplicativo.',
    ],
    cuidados: ['Documento e e-mail corretos evitam cobranças e avisos para o destino errado.'],
    perguntas: [{ pergunta: 'Cadastrei duas vezes o mesmo cliente.', resposta: 'Mantenha a ficha mais antiga e transfira o uso para ela. Antes de cadastrar, sempre busque pelo nome ou documento.' }],
    relacionados: ['contratacoes'],
  },
  {
    id: 'contratacoes', titulo: 'Contratações, provisionamento e troca de plano', secao: 'comercial', url: '/contratacoes',
    resumo: 'Liga cliente, produto e plano, define periodicidade e vencimento e cria a instância do aplicativo para a paróquia.',
    passos: [
      'Confira cliente, produto, plano, periodicidade e dia de vencimento na ficha.',
      'Revise os dados de provisionamento antes de iniciar. Se houver falha, leia a situação e só use Tentar novamente quando disponível.',
      'Na troca de plano, confira a data de início e o valor. Use as ações disponíveis na ficha para atualizar adicionais.',
      'Recarregue a ficha se houver conflito de atualização antes de tentar uma nova alteração.',
    ],
    cuidados: ['Bloquear, desbloquear e cancelar afetam o acesso da paróquia à instância. Confira o motivo antes.'],
    perguntas: [{ pergunta: 'O provisionamento falhou. E agora?', resposta: 'Leia a mensagem na ficha, corrija o que ela indica e use Tentar novamente. Os logs mostram o detalhe técnico.' }],
    relacionados: ['cobrancas', 'consumo', 'situacoes', 'instancias'],
  },
  {
    id: 'instancias', titulo: 'Instâncias: visão geral dos ambientes', secao: 'comercial', url: '/instancias',
    resumo: 'Lista as instâncias criadas por contratação, com situação e acesso rápido à ficha e ao consumo.',
    passos: [
      'Filtre por situação ou busque pelo nome do cliente.',
      'Abra a contratação para ver provisionamento, consumo e ações de suporte.',
      'Uma instância indisponível não significa contratação cancelada: confira a situação na ficha e nos logs.',
    ],
    relacionados: ['consumo', 'suporte', 'contratacoes'],
  },
  {
    id: 'cobrancas', titulo: 'Cobranças, pagamentos e isenções', secao: 'comercial', url: '/cobrancas',
    resumo: 'Acompanha o que cada contratação deve, o que foi pago e o que foi isentado, competência por competência.',
    passos: [
      'Filtre a competência e a situação desejadas. Abra a cobrança para conferir plano, adicionais, vencimento e valor.',
      'Registre pagamento manual somente quando o recebimento estiver confirmado, conferindo valor e data.',
      'Isenção mantém o histórico e não conta como dinheiro recebido. Confira o motivo e o período antes de isentar a contratação.',
      'A situação da contratação e a situação de cada cobrança são informações diferentes. Confira ambas na ficha.',
    ],
    cuidados: ['Pagamento manual e pagamento do checkout são conciliados à parte: não registre duas vezes o mesmo recebimento.'],
    perguntas: [{ pergunta: 'Onde vejo o quanto recebi no mês?', resposta: 'Em Relatórios, abra o Relatório de receitas ou o Demonstrativo do resultado do exercício do período.' }],
    relacionados: ['mercado-pago', 'relatorios', 'financeiro'],
  },
  {
    id: 'mercado-pago', titulo: 'Mercado Pago e acompanhamento do checkout', secao: 'comercial', url: '/cobrancas',
    resumo: 'Como acompanhar o pagamento online de uma cobrança e conciliar o resultado.',
    passos: [
      'O checkout está associado a uma cobrança. Abra seu detalhe para usar as ações disponíveis.',
      'A volta do navegador após o checkout não comprova pagamento. Confira a situação conciliada da cobrança.',
      'Se o pagamento ainda não aparecer, confira as ações de consulta e conciliação disponíveis antes de registrar outro recebimento.',
      'O checkout por cobrança não ativa débito recorrente automático. A assinatura automática ainda não está disponível.',
    ],
    relacionados: ['cobrancas'],
  },
  {
    id: 'financeiro', titulo: 'Financeiro: plano de contas, lançamentos e saldos', secao: 'financeiro', url: '/financeiro',
    resumo: 'Controla o dinheiro da Central: despesas (VPS, e-mail, serviços), receitas manuais, contas ou bancos e plano de contas.',
    passos: [
      'Em Financeiro › Contas bancárias, use Nova conta para cadastrar o Caixa e cada conta do banco: tipo, banco, agência, conta, titular, chaves PIX, saldo inicial e a data dele. Em conta corrente ou poupança, banco, agência, conta e titular são obrigatórios.',
      'Em Plano de contas, crie os grupos (por exemplo Infraestrutura, Serviços) e, dentro de cada grupo, as contas contábeis (VPS, E-mail). Só a conta contábil recebe lançamento e ela herda o tipo do grupo (entrada ou saída).',
      'Em Lançamentos, registre a despesa ou receita com valor em reais, vencimento, a conta/banco e a conta contábil. Pendente é previsão, não dinheiro movimentado.',
      'Depois de pagar ou receber, use Dar baixa informando a data correta. Para corrigir uma baixa manual, estorne primeiro.',
      'O resumo considera provisões pelo vencimento e valores realizados pela data da baixa. Confira o período antes de comparar.',
    ],
    cuidados: [
      'As receitas das assinaturas entram automaticamente nos relatórios. Não as duplique como receitas manuais.',
      'Saldo por conta considera os lançamentos manuais; as cobranças não têm conta bancária vinculada.',
      'O tipo de um grupo ou conta não muda enquanto houver lançamentos ou contas ligados a eles.',
    ],
    perguntas: [
      { pergunta: 'Qual a diferença entre conta e conta contábil?', resposta: 'Conta (ou banco) é onde o dinheiro está: Caixa, Banco. Conta contábil é a classificação: VPS, E-mail. Cada lançamento usa as duas.' },
      { pergunta: 'Por que o Novo lançamento está desabilitado?', resposta: 'Falta ao menos uma conta/banco ativa e uma conta contábil ativa dentro de um grupo ativo.' },
    ],
    relacionados: ['relatorios', 'cobrancas'],
  },
  {
    id: 'relatorios', titulo: 'Relatórios financeiros', secao: 'financeiro', url: '/relatorios',
    resumo: 'Quatro relatórios do período: banco/caixa, demonstrativo do resultado do exercício, despesas e receitas, com exportação e impressão.',
    passos: [
      'Em Relatórios, use Pesquisar relatório para achar pelo nome (por exemplo "dre" ou "caixa") e abra o cartão do relatório desejado.',
      'Escolha o período (data inicial e final) e atualize. Os totais e as linhas mudam conforme o período.',
      'Relatório de banco/caixa mostra as movimentações e o saldo por conta. Despesas e receitas listam os valores por conta contábil.',
      'O Demonstrativo do resultado do exercício soma receitas e subtrai despesas, por grupo e conta contábil, e mostra o resultado do período.',
      'Use Exportar CSV para abrir na planilha ou Imprimir para uma versão limpa em papel ou PDF.',
    ],
    cuidados: [
      'Valores realizados usam a data da baixa; provisões, o vencimento. O relatório indica de qual dos dois está falando.',
      'Lançamentos antigos cujo tipo não combina com o do plano de contas aparecem sinalizados: corrija-os no Financeiro.',
      'Receitas de assinaturas entram automaticamente; as manuais são somadas à parte.',
    ],
    perguntas: [
      { pergunta: 'O resultado do período não fecha com o que eu esperava.', resposta: 'Confira se há lançamentos pendentes sem baixa e se o período inclui o mês inteiro. Depois compare o relatório de receitas com o de despesas.' },
      { pergunta: 'Posso levar o relatório para o contador?', resposta: 'Sim: exporte o CSV ou use Imprimir e salve como PDF.' },
    ],
    relacionados: ['financeiro', 'cobrancas'],
  },
  {
    id: 'consumo', titulo: 'Consumo, limites e inventário pendente', secao: 'operacao', url: '/contratacoes',
    resumo: 'Mostra quanto da instância a paróquia usa e o que o plano limita, sem expor dados de pessoas.',
    passos: [
      'Abra uma contratação provisionada e use Ver consumo da instância. Atualizar consumo refaz a consulta.',
      'Confira a data da consulta, funcionalidades e limites. O painel mostra contagens, sem fichas ou nomes de pessoas.',
      'Armazenamento considera arquivos vinculados e anexos retidos. Inventário pendente indica que ainda faltam tamanhos conhecidos.',
      'Erro de consulta não significa consumo zero. Confira a conexão e tente atualizar quando a instância estiver disponível.',
    ],
    relacionados: ['contratacoes', 'catalogo'],
  },
  {
    id: 'suporte', titulo: 'Suporte à instância e registro de ações', secao: 'operacao', url: '/contratacoes',
    resumo: 'Permite entrar na instância de uma paróquia para atendimento, com motivo registrado e acesso de curta duração.',
    passos: [
      'Abra a contratação correta e use Entrar em suporte quando a ação estiver disponível.',
      'Informe o motivo do atendimento. O acesso e as ações feitas no aplicativo são registrados na auditoria.',
      'O código de suporte tem validade curta e uso único. Solicite outro se o acesso expirar; não compartilhe código ou link.',
      'Confira os logs da Central para acompanhar operações e falhas.',
    ],
    cuidados: ['Entre apenas quando houver um atendimento aberto e descreva o motivo com clareza: ele fica na auditoria.'],
    relacionados: ['logs', 'contratacoes'],
  },
  {
    id: 'logs', titulo: 'Logs: operações e falhas', secao: 'operacao', url: '/logs',
    resumo: 'Histórico técnico das operações da Central, para investigar um erro ou conferir o que foi feito e por quem.',
    passos: [
      'Filtre por período, nível ou texto. Se tiver o código da requisição (requestId) que a tela mostrou ao falhar, busque por ele.',
      'Abra uma linha para ver os detalhes. Eles não trazem senhas ou dados sensíveis.',
      'Ao pedir ajuda técnica, informe o requestId e o horário.',
    ],
    cuidados: ['Um erro isolado pode ser temporário; se repetir, anote o requestId antes de tentar de novo.'],
    relacionados: ['suporte', 'contratacoes'],
  },
  {
    id: 'situacoes', titulo: 'Situações, bloqueio e histórico', secao: 'operacao', url: '/contratacoes',
    resumo: 'O significado de cada situação de cobrança e contratação e quando bloquear, desbloquear ou cancelar.',
    passos: [
      'Confira o texto da situação, além da cor. Cobrança aberta, vencida, paga e isenta têm significados diferentes.',
      'Use bloqueio, desbloqueio e cancelamento somente depois de conferir a contratação e o motivo.',
      'Bloquear uma contratação afeta o acesso à instância. Cancelar não é uma forma de corrigir pagamento.',
      'Consulte a ficha e os logs para acompanhar o resultado das operações.',
    ],
    relacionados: ['contratacoes', 'cobrancas', 'logs'],
  },
  {
    id: 'catalogo', titulo: 'Produtos, recursos, planos e adicionais', secao: 'catalogo', url: '/catalogo/planos',
    resumo: 'O que a Central vende: aplicativos (produtos), o que cada um oferece (recursos), os pacotes (planos e preços) e os extras (adicionais).',
    passos: [
      'Produto identifica o aplicativo. Recursos definem funcionalidades ou limites oferecidos.',
      'Configure os recursos incluídos no plano e revise os preços por periodicidade.',
      'Adicionais são itens contratados separadamente. Confira a quantidade escolhida na contratação.',
      'Depois de uma alteração comercial, confira os direitos e o consumo da contratação. Ter uma funcionalidade no plano não concede permissão de usuário no Servirea.',
    ],
    cuidados: ['Mudar um plano já contratado pode alterar o que a paróquia consegue usar: confira o consumo depois.'],
    relacionados: ['contratacoes', 'consumo'],
  },
  {
    id: 'seguranca', titulo: 'Meu perfil, senha e autenticação em duas etapas', secao: 'conta', url: '/meu-perfil',
    resumo: 'Como trocar a senha e proteger a sua conta de operador com o autenticador.',
    passos: [
      'Abra Meus dados no menu do perfil para trocar sua senha ou configurar o autenticador.',
      'Preparar o autenticador não ativa a proteção. Cadastre a chave no seu aplicativo e confirme o código no prazo mostrado.',
      'Guarde os códigos de recuperação antes de concluir: eles são mostrados uma vez e cada código pode ser usado uma única vez.',
      'Ativar ou desativar a proteção encerra as sessões. Entre novamente e use o código atual do autenticador.',
      'Se a configuração estiver indisponível, o ambiente precisa ser preparado pelo administrador. Não compartilhe senha, chave ou códigos.',
    ],
    relacionados: ['ajustes'],
  },
  {
    id: 'ajustes', titulo: 'Ajustes de aparência', secao: 'conta', url: '/ajustes',
    resumo: 'Tema, contraste e outras preferências visuais deste navegador.',
    passos: [
      'Escolha as opções de aparência. Elas ficam salvas somente neste navegador.',
      'Se algo ficar difícil de ler, use o maior contraste e aumente o texto.',
    ],
    relacionados: ['seguranca'],
  },
];
