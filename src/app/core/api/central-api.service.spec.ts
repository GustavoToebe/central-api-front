import { Movimento, MovimentoRequest } from '../../features/financeiro/financeiro.models';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CentralApiService } from './central-api.service';
import {
  AlterarPlanoRequest, AtualizarProvisionamentoRequest, CriarContratacaoRequest, NovoPrecoRequest,
  RegistrarPagamentoRequest, SalvarAdicionalRequest, SalvarClienteRequest, SalvarPlanoRequest,
  SalvarProdutoRequest, SalvarRecursoRequest
} from './central.models';

describe('CentralApiService', () => {
  let api: CentralApiService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;

  const cliente: SalvarClienteRequest = {
    tipo: 'PF', documento: '123', nome: 'Lucas', logradouro: null, numero: null, complemento: null,
    bairro: null, cidade: null, uf: null, cep: null, contatos: []
  };
  const produto: SalvarProdutoRequest = { codigo: 'SERVIREA', nome: 'Servirea', urlBaseIntegracao: null, ativo: true };
  const recurso: SalvarRecursoRequest = { produtoId: 'p1', codigo: 'VOLUNTARIOS', nome: 'Voluntários', tipo: 'LIMITE', unidade: null, valorPadrao: 100 };
  const plano: SalvarPlanoRequest = { produtoId: 'p1', codigo: 'PRO', nome: 'Profissional', ativo: true, recursos: [], precos: [{ periodicidade: 'TRIMESTRAL', valor: 140 }] };
  const preco: NovoPrecoRequest = { periodicidade: 'MENSAL', valor: 49.9, vigenteDesde: '2026-10-01' };
  const adicional: SalvarAdicionalRequest = { produtoId: 'p1', recursoId: 'r1', codigo: 'MAIS50', nome: '+50', quantidade: 50, preco: 15, ativo: true };
  const contratacao = { clienteId: 'c1' } as CriarContratacaoRequest;
  const prov: AtualizarProvisionamentoRequest = { nomeInstancia: 'São José', slugInstancia: 'sao-jose', adminNome: 'Lucas', adminEmail: 'l@x.com' };
  const troca: AlterarPlanoRequest = { planoId: 'pl2', periodicidade: 'ANUAL', valor: null, diaVencimento: 5, aPartirDe: '2026-10-01', motivo: null };
  const pagamento: RegistrarPagamentoRequest = { cobrancaIds: ['cb1'], pagoEm: '2026-09-25', formaPagamento: 'PIX', valorPago: null, observacao: null };

  const contaFinanceira = { nome:'Caixa', saldoInicial:0, dataSaldoInicial:'2026-10-01', ativo:true };
  const categoriaFinanceira = { nome:'Infraestrutura', ativo:true };
  const movimentoFinanceiro: MovimentoRequest = {descricao:'VPS',tipo:'DESPESA',valor:89.9,vencimento:'2026-10-01',contaId:'c',categoriaId:'g',observacoes:null,versao:2};
  const movimento = {id:'m',versao:2} as Movimento;
  const casos: [string, (s: CentralApiService) => Observable<unknown>, string, string, unknown][] = [
    ['contasFinanceiras', s => s.contasFinanceiras(), 'GET', '/financeiro/contas', null],
    ['categoriasFinanceiras', s => s.categoriasFinanceiras(), 'GET', '/financeiro/categorias', null],
    ['resumoOperacional', s => s.resumoOperacional('2026-10-01','2026-10-31'), 'GET', '/financeiro/resumo?de=2026-10-01&ate=2026-10-31', null],
    ['movimentosFinanceiros', s => s.movimentosFinanceiros({de:'2026-10-01',ate:'2026-10-31',nome:'',contaId:'',categoriaId:'',situacao:'',tipo:'',pagina:0,tamanho:30}), 'GET', '/financeiro/movimentos?de=2026-10-01&ate=2026-10-31&pagina=0&tamanho=30', null],
    ['criarContaFinanceira', s => s.salvarContaFinanceira(null,contaFinanceira), 'POST', '/financeiro/contas', contaFinanceira],
    ['alterarContaFinanceira', s => s.salvarContaFinanceira('c',contaFinanceira), 'PUT', '/financeiro/contas/c', contaFinanceira],
    ['criarCategoriaFinanceira', s => s.salvarCategoriaFinanceira(null,categoriaFinanceira), 'POST', '/financeiro/categorias', categoriaFinanceira],
    ['alterarCategoriaFinanceira', s => s.salvarCategoriaFinanceira('g',categoriaFinanceira), 'PUT', '/financeiro/categorias/g', categoriaFinanceira],
    ['criarMovimentoFinanceiro', s => s.salvarMovimentoFinanceiro(null,movimentoFinanceiro), 'POST', '/financeiro/movimentos', movimentoFinanceiro],
    ['alterarMovimentoFinanceiro', s => s.salvarMovimentoFinanceiro('m',movimentoFinanceiro), 'PUT', '/financeiro/movimentos/m', movimentoFinanceiro],
    ['baixarMovimentoFinanceiro', s => s.baixarMovimentoFinanceiro(movimento,'2026-10-01'), 'POST', '/financeiro/movimentos/m/baixar', {versao:2,dataPagamento:'2026-10-01'}],
    ['estornarMovimentoFinanceiro', s => s.acaoMovimentoFinanceiro(movimento,'estornar'), 'POST', '/financeiro/movimentos/m/estornar', {versao:2}],
    ['cancelarMovimentoFinanceiro', s => s.acaoMovimentoFinanceiro(movimento,'cancelar'), 'POST', '/financeiro/movimentos/m/cancelar', {versao:2}],
    ['mfaStatus', s => s.mfaStatus(), 'GET', '/operadores/eu/mfa', null],
    ['mfaPreparar', s => s.mfaPreparar('senha'), 'POST', '/operadores/eu/mfa/preparar', { senha: 'senha' }],
    ['mfaAtivar', s => s.mfaAtivar('senha', '123456'), 'POST', '/operadores/eu/mfa/ativar', { senha: 'senha', codigo: '123456' }],
    ['mfaDesativar', s => s.mfaDesativar('senha', 'codigo'), 'POST', '/operadores/eu/mfa/desativar', { senha: 'senha', codigo: 'codigo' }],
    ['clientes', s => s.clientes(), 'GET', '/clientes', null],
    ['cliente', s => s.cliente('c1'), 'GET', '/clientes/c1', null],
    ['criarCliente', s => s.criarCliente(cliente), 'POST', '/clientes', cliente],
    ['atualizarCliente', s => s.atualizarCliente('c1', cliente), 'PUT', '/clientes/c1', cliente],
    ['produtos', s => s.produtos(), 'GET', '/produtos', null],
    ['criarProduto', s => s.criarProduto(produto), 'POST', '/produtos', produto],
    ['atualizarProduto', s => s.atualizarProduto('p1', produto), 'PUT', '/produtos/p1', produto],
    ['recursosDoApp', s => s.recursosDoApp('p1'), 'GET', '/produtos/p1/recursos-do-app', null],
    ['recursos', s => s.recursos(), 'GET', '/recursos', null],
    ['recursos do produto', s => s.recursos('p1'), 'GET', '/recursos?produtoId=p1', null],
    ['criarRecurso', s => s.criarRecurso(recurso), 'POST', '/recursos', recurso],
    ['atualizarRecurso', s => s.atualizarRecurso('r1', recurso), 'PUT', '/recursos/r1', recurso],
    ['planos do produto', s => s.planos('p1'), 'GET', '/planos?produtoId=p1', null],
    ['criarPlano', s => s.criarPlano(plano), 'POST', '/planos', plano],
    ['atualizarPlano', s => s.atualizarPlano('pl1', plano), 'PUT', '/planos/pl1', plano],
    ['adicionarPreco', s => s.adicionarPreco('pl1', preco), 'POST', '/planos/pl1/precos', preco],
    ['adicionais do produto', s => s.adicionais('p1'), 'GET', '/adicionais?produtoId=p1', null],
    ['criarAdicional', s => s.criarAdicional(adicional), 'POST', '/adicionais', adicional],
    ['atualizarAdicional', s => s.atualizarAdicional('a1', adicional), 'PUT', '/adicionais/a1', adicional],
    ['contratacoes', s => s.contratacoes(), 'GET', '/contratacoes', null],
    ['contratacao', s => s.contratacao('k1'), 'GET', '/contratacoes/k1', null],
    ['criarContratacao', s => s.criarContratacao(contratacao), 'POST', '/contratacoes', contratacao],
    ['atualizarProvisionamento', s => s.atualizarProvisionamento('k1', prov), 'PUT', '/contratacoes/k1', prov],
    ['alterarPlano', s => s.alterarPlano('k1', troca), 'PUT', '/contratacoes/k1/plano', troca],
    ['substituirAdicionais', s => s.substituirAdicionais('k1', [{ adicionalId: 'a1', quantidade: 2 }], 'mais'), 'PUT',
      '/contratacoes/k1/adicionais', { adicionais: [{ adicionalId: 'a1', quantidade: 2 }], motivo: 'mais' }],
    ['bloquear', s => s.bloquear('k1', 'atraso'), 'POST', '/contratacoes/k1/bloquear', { motivo: 'atraso' }],
    ['desbloquear sem motivo', s => s.desbloquear('k1', null), 'POST', '/contratacoes/k1/desbloquear', null],
    ['desbloquear com motivo', s => s.desbloquear('k1', 'pagou'), 'POST', '/contratacoes/k1/desbloquear', { motivo: 'pagou' }],
    ['cancelar', s => s.cancelar('k1', 'fim'), 'POST', '/contratacoes/k1/cancelar', { motivo: 'fim' }],
    ['tentarProvisionamento', s => s.tentarProvisionamento('k1'), 'POST', '/contratacoes/k1/tentar-provisionamento', {}],
    ['suporte', s => s.suporte('k1', 'ajuda na escala'), 'POST', '/contratacoes/k1/suporte', { motivo: 'ajuda na escala' }],
    ['financeiro', s => s.financeiro('k1'), 'GET', '/contratacoes/k1/financeiro', null],
    ['gerarAdiantadas', s => s.gerarAdiantadas('k1', '2026-11', '2026-12'), 'POST', '/contratacoes/k1/cobrancas/adiantadas', { de: '2026-11', ate: '2026-12' }],
    ['registrarPagamento', s => s.registrarPagamento('k1', pagamento), 'POST', '/contratacoes/k1/pagamentos', pagamento],
    ['estornar', s => s.estornar('k1', 'cb1'), 'POST', '/contratacoes/k1/cobrancas/cb1/estornar', {}],
    ['isentar', s => s.isentar('k1', 'cb1', 'cortesia'), 'POST', '/contratacoes/k1/cobrancas/cb1/isentar', { motivo: 'cortesia' }],
    ['reemitir', s => s.reemitir('k1', 'cb1'), 'POST', '/contratacoes/k1/cobrancas/cb1/reemitir', {}],
    ['cobrancas sem filtro', s => s.cobrancas({ produtoId: '', situacao: '', busca: '  ' }), 'GET', '/cobrancas', null],
    ['cobrancas com filtros', s => s.cobrancas({ situacao: 'VENCIDA', competencia: '2026-10', busca: ' Ana ' }), 'GET',
      '/cobrancas?situacao=VENCIDA&competencia=2026-10&busca=Ana', null],
    ['cobranca', s => s.cobranca('cb1'), 'GET', '/cobrancas/cb1', null],
    ['pagarCobrancas', s => s.pagarCobrancas(pagamento), 'POST', '/cobrancas/pagamentos', pagamento],
    ['erros', s => s.erros({ contratacaoId: 'k1', de: '2026-09-01', busca: ' storage ' }), 'GET',
      '/erros?contratacaoId=k1&de=2026-09-01&busca=storage', null]
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(CentralApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('produtos fica em cache: duas chamadas fazem uma requisição; salvar invalida', () => {
    api.produtos().subscribe();
    api.produtos().subscribe();
    httpMock.expectOne(`${base}/produtos`).flush([]);
    api.criarProduto(produto).subscribe();
    httpMock.expectOne(r => r.method === 'POST').flush({});
    api.produtos().subscribe();
    httpMock.expectOne(`${base}/produtos`).flush([]);
  });

  for (const [nome, chamar, metodo, caminho, corpo] of casos) {
    it(`${nome}: ${metodo} ${caminho}`, () => {
      chamar(api).subscribe();
      const req = httpMock.expectOne(r => r.urlWithParams === `${base}${caminho}`);
      expect(req.request.method).toBe(metodo);
      if (metodo !== 'GET') expect(req.request.body).toEqual(corpo);
      req.flush({});
    });
  }
});
