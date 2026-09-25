import { clienteFormDe, clienteFormVazio, montarClienteRequest } from './cliente.form';

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
});
