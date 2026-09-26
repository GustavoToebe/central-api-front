import { clienteFormDe, clienteFormVazio, formatarDocumento, montarClienteRequest, problemaNoCliente } from './cliente.form';

describe('montarClienteRequest', () => {
  it('apara textos, vazio vira nulo e UF vai em maiúsculas', () => {
    const corpo = montarClienteRequest({
      ...clienteFormVazio(), tipo: 'PF', documento: ' 123.456.789-00 ', nome: ' Lucas Fernando ', cidade: ' Cascavel ', uf: 'pr', cep: ' '
    });
    expect(corpo.documento).toBe('123.456.789-00');
    expect(corpo.nome).toBe('Lucas Fernando');
    expect(corpo.cidade).toBe('Cascavel');
    expect(corpo.uf).toBe('PR');
    expect(corpo.cep).toBeNull();
    expect(corpo.logradouro).toBeNull();
    expect(corpo.contatos).toEqual([]);
  });

  it('descarta contato sem nome e garante exatamente um principal', () => {
    const semPrincipal = montarClienteRequest({
      ...clienteFormVazio(), documento: '1', nome: 'X',
      contatos: [
        { nome: ' ', email: 'a@x.com', telefone: '', principal: true },
        { nome: 'Ana', email: ' ', telefone: '4599', principal: false },
        { nome: 'Bia', email: 'b@x.com', telefone: '', principal: false }
      ]
    });
    expect(semPrincipal.contatos.map(c => c.nome)).toEqual(['Ana', 'Bia']);
    expect(semPrincipal.contatos[0]).toEqual({ nome: 'Ana', email: null, telefone: '4599', principal: true });
    expect(semPrincipal.contatos.filter(c => c.principal).length).toBe(1);

    const doisPrincipais = montarClienteRequest({
      ...clienteFormVazio(), documento: '1', nome: 'X',
      contatos: [{ nome: 'A', email: '', telefone: '', principal: true }, { nome: 'B', email: '', telefone: '', principal: true }]
    });
    expect(doisPrincipais.contatos.map(c => c.principal)).toEqual([true, false]);
  });

  it('carrega o cliente da API no formulário', () => {
    const form = clienteFormDe({
      id: 'c1', tipo: 'PJ', documento: '1', nome: 'Mitra', logradouro: null, numero: null, complemento: null,
      bairro: null, cidade: 'Toledo', uf: 'PR', cep: null,
      contatos: [{ id: 'k', nome: 'Ana', email: null, telefone: null, principal: true }]
    });
    expect(form.cidade).toBe('Toledo');
    expect(form.logradouro).toBe('');
    expect(form.contatos[0]).toEqual({ nome: 'Ana', email: '', telefone: '', principal: true });
  });

  it('abre o cadastro antigo já formatado', () => {
    const form = clienteFormDe({
      id: 'c2', tipo: 'PF', documento: '52998224725', nome: 'Maria', logradouro: null, numero: null, complemento: null,
      bairro: null, cidade: null, uf: null, cep: '85800000',
      contatos: [{ id: 'k', nome: 'Maria', email: null, telefone: '45999998888', principal: true }]
    });
    expect(form.documento).toBe('529.982.247-25');
    expect(form.cep).toBe('85800-000');
    expect(form.contatos[0].telefone).toBe('(45) 99999-8888');
    expect(formatarDocumento('PJ', '12abc34501de35')).toBe('12.ABC.345/01DE-35');
  });
});

describe('problemaNoCliente', () => {
  const valido = { ...clienteFormVazio(), tipo: 'PF' as const, documento: '529.982.247-25', nome: 'Maria' };

  it('aceita cadastro válido, inclusive CNPJ alfanumérico', () => {
    expect(problemaNoCliente(valido)).toBeNull();
    expect(problemaNoCliente({ ...valido, tipo: 'PJ', documento: '12.ABC.345/01DE-35' })).toBeNull();
  });

  it('confere documento conforme o tipo, CEP, UF e contatos com nome', () => {
    expect(problemaNoCliente({ ...valido, documento: '101.175' })).toBe('CPF inválido.');
    expect(problemaNoCliente({ ...valido, tipo: 'PJ' })).toBe('CNPJ inválido.');
    expect(problemaNoCliente({ ...valido, cep: '8580' })).toBe('CEP deve ter 8 números.');
    expect(problemaNoCliente({ ...valido, uf: 'XX' })).toBe('UF inválida.');
    expect(problemaNoCliente({ ...valido, contatos: [{ nome: 'Ana', email: 'ana@paroquia', telefone: '', principal: true }] }))
      .toBe('E-mail do contato Ana inválido.');
    expect(problemaNoCliente({ ...valido, contatos: [{ nome: 'Ana', email: '', telefone: '9999-8888', principal: true }] }))
      .toContain('Telefone do contato Ana inválido');
    expect(problemaNoCliente({ ...valido, contatos: [{ nome: ' ', email: 'x', telefone: 'x', principal: true }] })).toBeNull();
  });
});
