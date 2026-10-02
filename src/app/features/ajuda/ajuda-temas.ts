/** Orientações estáticas: revisar junto com a funcionalidade, sem buscar dados de clientes. */
export interface TemaAjuda { id:string; titulo:string; url:string; passos:readonly string[]; }
export const TEMAS:readonly TemaAjuda[] = [
 {id:'primeiros-passos',titulo:'Primeiros passos: do catálogo à contratação',url:'/catalogo/produtos',passos:[
  'Confira o produto, seus recursos, planos, preços e adicionais no Catálogo antes de contratar.',
  'Cadastre o cliente e crie sua contratação escolhendo produto, plano, periodicidade e vencimento.',
  'Abra a contratação e confira os dados de provisionamento antes de criar a instância. Acompanhe o resultado na ficha.',
  'Depois do provisionamento, confira situação, cobranças e consumo na contratação. As permissões dos usuários da paróquia são configuradas no Servirea.']},
 {id:'clientes',titulo:'Clientes e dados de contato',url:'/clientes',passos:[
  'Busque o cliente antes de cadastrar outro. Confira nome, documento e contatos.',
  'Use a ficha do cliente para consultar suas contratações. O cliente é o cadastro comercial; cada contratação identifica o produto e o plano.',
  'Mantenha o contato comercial atualizado. As fichas de pessoas da paróquia são administradas no aplicativo.']},
 {id:'catalogo',titulo:'Produtos, recursos, planos e adicionais',url:'/catalogo/planos',passos:[
  'Produto identifica o aplicativo. Recursos definem funcionalidades ou limites oferecidos.',
  'Configure os recursos incluídos no plano e revise os preços por periodicidade.',
  'Adicionais são itens contratados separadamente. Confira a quantidade escolhida na contratação.',
  'Depois de uma alteração comercial, confira os direitos e o consumo da contratação. Ter uma funcionalidade no plano não concede permissão de usuário no Servirea.']},
 {id:'contratacoes',titulo:'Contratações, provisionamento e troca de plano',url:'/contratacoes',passos:[
  'Confira cliente, produto, plano, periodicidade e dia de vencimento na ficha.',
  'Revise os dados de provisionamento antes de iniciar. Se houver falha, leia a situação e só use Tentar novamente quando disponível.',
  'Na troca de plano, confira a data de início e o valor. Use as ações disponíveis na ficha para atualizar adicionais.',
  'Recarregue a ficha se houver conflito de atualização antes de tentar uma nova alteração.']},
 {id:'cobrancas',titulo:'Cobranças, pagamentos e isenções',url:'/cobrancas',passos:[
  'Filtre a competência e a situação desejadas. Abra a cobrança para conferir plano, adicionais, vencimento e valor.',
  'Registre pagamento manual somente quando o recebimento estiver confirmado, conferindo valor e data.',
  'Isenção mantém o histórico e não conta como dinheiro recebido. Confira o motivo e o período antes de isentar a contratação.',
  'A situação da contratação e a situação de cada cobrança são informações diferentes. Confira ambas na ficha.']},
 {id:'mercado-pago',titulo:'Mercado Pago e acompanhamento do checkout',url:'/cobrancas',passos:[
  'O checkout está associado a uma cobrança. Abra seu detalhe para usar as ações disponíveis.',
  'A volta do navegador após o checkout não comprova pagamento. Confira a situação conciliada da cobrança.',
  'Se o pagamento ainda não aparecer, confira as ações de consulta e conciliação disponíveis antes de registrar outro recebimento.',
  'O checkout por cobrança não ativa débito recorrente automático. A assinatura automática ainda não está disponível.']},
 {id:'financeiro',titulo:'Financeiro: VPS, despesas, receitas e provisões',url:'/financeiro',passos:[
  'Cadastre contas e categorias. Registre VPS, e-mail e outros serviços como despesas, com valor em reais e vencimento.',
  'Uma despesa pendente é uma previsão. Dê baixa depois de pagar, informando a data correta.',
  'O resumo considera provisões pelo vencimento e valores realizados pela data da baixa. Confira o período antes de comparar.',
  'As receitas das assinaturas entram automaticamente no resumo. Não as duplique em receitas manuais.',
  'Saldo por conta considera lançamentos manuais; cobranças não têm conta bancária vinculada. Para corrigir uma baixa manual, estorne primeiro.']},
 {id:'consumo',titulo:'Consumo, limites e inventário pendente',url:'/contratacoes',passos:[
  'Abra uma contratação provisionada e use Ver consumo da instância. Atualizar consumo refaz a consulta.',
  'Confira a data da consulta, funcionalidades e limites. O painel mostra contagens, sem fichas ou nomes de pessoas.',
  'Armazenamento considera arquivos vinculados e anexos retidos. Inventário pendente indica que ainda faltam tamanhos conhecidos.',
  'Erro de consulta não significa consumo zero. Confira a conexão e tente atualizar quando a instância estiver disponível.']},
 {id:'suporte',titulo:'Suporte à instância e registro de ações',url:'/contratacoes',passos:[
  'Abra a contratação correta e use Entrar em suporte quando a ação estiver disponível.',
  'Informe o motivo do atendimento. O acesso e as ações feitas no aplicativo são registrados na auditoria.',
  'O código de suporte tem validade curta e uso único. Solicite outro se o acesso expirar; não compartilhe código ou link.',
  'Confira os logs da Central para acompanhar operações e falhas.']},
 {id:'seguranca',titulo:'Meu perfil, senha e autenticação em duas etapas',url:'/meu-perfil',passos:[
  'Abra Meus dados no menu do perfil para trocar sua senha ou configurar o autenticador.',
  'Preparar o autenticador não ativa a proteção. Cadastre a chave no seu aplicativo e confirme o código no prazo mostrado.',
  'Guarde os códigos de recuperação antes de concluir: eles são mostrados uma vez e cada código pode ser usado uma única vez.',
  'Ativar ou desativar a proteção encerra as sessões. Entre novamente e use o código atual do autenticador.',
  'Se a configuração estiver indisponível, o ambiente precisa ser preparado pelo administrador. Não compartilhe senha, chave ou códigos.']},
 {id:'situacoes',titulo:'Situações, bloqueio e histórico',url:'/contratacoes',passos:[
  'Confira o texto da situação, além da cor. Cobrança aberta, vencida, paga e isenta têm significados diferentes.',
  'Use bloqueio, desbloqueio e cancelamento somente depois de conferir a contratação e o motivo.',
  'Bloquear uma contratação afeta o acesso à instância. Cancelar não é uma forma de corrigir pagamento.',
  'Consulte a ficha e os logs para acompanhar o resultado das operações.']}
];
