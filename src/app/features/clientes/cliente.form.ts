import { Cliente, Contato, SalvarClienteRequest, TipoCliente } from '../../core/api/central.models';
import { textoOuNulo } from '../comum/rotulos';

export interface ClienteForm {
  tipo: TipoCliente;
  documento: string;
  nome: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  contatos: { nome: string; email: string; telefone: string; principal: boolean }[];
}

export function clienteFormVazio(): ClienteForm {
  return {
    tipo: 'PJ', documento: '', nome: '', cep: '', logradouro: '', numero: '', complemento: '',
    bairro: '', cidade: '', uf: '', contatos: []
  };
}

export function clienteFormDe(c: Cliente): ClienteForm {
  return {
    tipo: c.tipo, documento: c.documento, nome: c.nome,
    cep: c.cep ?? '', logradouro: c.logradouro ?? '', numero: c.numero ?? '', complemento: c.complemento ?? '',
    bairro: c.bairro ?? '', cidade: c.cidade ?? '', uf: c.uf ?? '',
    contatos: c.contatos.map(ct => ({ nome: ct.nome, email: ct.email ?? '', telefone: ct.telefone ?? '', principal: ct.principal }))
  };
}

/**
 * Corpo do POST/PUT /clientes: textos aparados, vazio vira nulo, UF em
 * maiúsculas, contato sem nome fica de fora e, se sobrar contato sem
 * nenhum marcado, o primeiro vira o principal.
 */
export function montarClienteRequest(f: ClienteForm): SalvarClienteRequest {
  const contatos: Contato[] = f.contatos
    .filter(c => c.nome.trim())
    .map(c => ({ nome: c.nome.trim(), email: textoOuNulo(c.email), telefone: textoOuNulo(c.telefone), principal: c.principal }));
  if (contatos.length && !contatos.some(c => c.principal)) contatos[0].principal = true;
  if (contatos.filter(c => c.principal).length > 1) {
    let achou = false;
    for (const c of contatos) {
      if (c.principal && achou) c.principal = false;
      if (c.principal) achou = true;
    }
  }
  const uf = textoOuNulo(f.uf);
  return {
    tipo: f.tipo,
    documento: f.documento.trim(),
    nome: f.nome.trim(),
    logradouro: textoOuNulo(f.logradouro),
    numero: textoOuNulo(f.numero),
    complemento: textoOuNulo(f.complemento),
    bairro: textoOuNulo(f.bairro),
    cidade: textoOuNulo(f.cidade),
    uf: uf ? uf.toUpperCase() : null,
    cep: textoOuNulo(f.cep),
    contatos
  };
}
