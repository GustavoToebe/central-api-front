import { HttpErrorResponse } from '@angular/common/http';
import { codigoApi, mensagemApi } from './api-error';

describe('api-error', () => {
  const erro = (status: number, error: unknown) => new HttpErrorResponse({ status, error });

  it('usa o primeiro campo inválido antes da mensagem geral', () => {
    expect(mensagemApi(erro(400, { message: 'Dados inválidos', fieldErrors: [{ field: 'nome', message: 'Informe o nome.' }] }), 'x'))
      .toBe('Informe o nome.');
  });

  it('usa a mensagem da API', () => {
    expect(mensagemApi(erro(409, { message: 'Já existe instância com este slug neste produto.' }), 'x'))
      .toBe('Já existe instância com este slug neste produto.');
  });

  it('explica API fora do ar', () => {
    expect(mensagemApi(erro(0, null), 'x')).toContain('Não foi possível falar com a API');
  });

  it('cai no texto padrão', () => {
    expect(mensagemApi(erro(500, null), 'padrão')).toBe('padrão');
    expect(mensagemApi('???', 'padrão')).toBe('padrão');
  });

  it('lê o código estável do erro', () => {
    expect(codigoApi(erro(409, { codigo: 'PROVISIONAMENTO_NAO_EDITAVEL' }))).toBe('PROVISIONAMENTO_NAO_EDITAVEL');
    expect(codigoApi(erro(500, null))).toBeNull();
    expect(codigoApi(new Error('x'))).toBeNull();
  });
});
