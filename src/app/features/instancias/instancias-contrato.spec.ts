import type { InstanciasVisaoService_Pagina } from '../../core/api/contrato-api.gerado';
import type { Exigir, RespostaApi, SemCamposInventados } from '../../core/api/contrato-api';
import type { AlertaInstancia, Instancia, PaginaInstancias, ResultadoAtualizacao } from './instancias.models';

type Pagina = RespostaApi<'GET /instancias'>;
type Varredura = RespostaApi<'POST /instancias/atualizacao'>;

// Cada linha abaixo deixa de compilar se o back renomear ou remover um campo que o painel usa (T17).
export type VerificacoesDeContrato = [
  Exigir<SemCamposInventados<PaginaInstancias, Pagina>>,
  Exigir<SemCamposInventados<Instancia, NonNullable<InstanciasVisaoService_Pagina['itens']>[number]>>,
  Exigir<SemCamposInventados<ResultadoAtualizacao, Varredura>>,
];

describe('contrato do painel de instâncias', () => {
  it('os tipos do painel acompanham os DTOs gerados do back', () => {
    const alerta: Pick<AlertaInstancia, 'codigo'> = { codigo: 'x' };
    const pagina: Pagina = { defasadas: 0, pagina: 0, tamanho: 20, total: 0 };
    expect(alerta.codigo).toBe('x');
    expect(pagina.total).toBe(0);
  });
});
