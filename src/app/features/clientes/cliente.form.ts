import { Cliente, Contato, SalvarClienteRequest, TipoCliente } from '../../core/api/central.models';
import {
  cepValido, cnpjValido, cpfValido, emailValido, formatarCep, formatarCnpj, formatarCpf, formatarTelefone,
  telefoneValido, ufValida
} from '../comum/formatos';
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
    tipo: c.tipo, documento: formatarDocumento(c.tipo, c.documento), nome: c.nome,
    cep: formatarCep(c.cep), logradouro: c.logradouro ?? '', numero: c.numero ?? '', complemento: c.complemento ?? '',
    bairro: c.bairro ?? '', cidade: c.cidade ?? '', uf: c.uf ?? '',
    contatos: c.contatos.map(ct => ({
      nome: ct.nome, email: ct.email ?? '', telefone: formatarTelefone(ct.telefone), principal: ct.principal
    }))
  };
}

export function formatarDocumento(tipo: TipoCliente, documento: string | null | undefined): string {
  return tipo === 'PJ' ? formatarCnpj(documento) : formatarCpf(documento);
}

/**
 * Mesmas regras da API (web/Formatos): o primeiro problema, ou null. Contato
 * sem nome não é conferido porque não vai para a API.
 */
export function problemaNoCliente(f: ClienteForm): string | null {
  const documentoOk = f.tipo === 'PJ' ? cnpjValido(f.documento) : cpfValido(f.documento);
  if (!documentoOk) return f.tipo === 'PJ' ? 'CNPJ inválido.' : 'CPF inválido.';
  if (f.cep.trim() && !cepValido(f.cep)) return 'CEP deve ter 8 números.';
  if (f.uf.trim() && !ufValida(f.uf)) return 'UF inválida.';
  for (const c of f.contatos.filter(ct => ct.nome.trim())) {
    if (c.email.trim() && !emailValido(c.email)) return `E-mail do contato ${c.nome.trim()} inválido.`;
    if (c.telefone.trim() && !telefoneValido(c.telefone)) {
      return `Telefone do contato ${c.nome.trim()} inválido. Informe o DDD e o número.`;
    }
  }
  return null;
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
