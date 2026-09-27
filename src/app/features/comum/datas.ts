import { hojeIso } from './rotulos';

/**
 * Datas dos campos da Central (teste de telas de 27/09/2026): tudo em ISO
 * (`AAAA-MM-DD`, competência `AAAA-MM`) por dentro e `DD/MM/AAAA` / `MM/AAAA`
 * na tela, sem nome de mês.
 */

export type PeriodoPronto = 'HOJE' | 'ULTIMOS_7' | 'PROXIMOS_7' | 'ESTE_MES' | 'MES_PASSADO' | 'ESTE_ANO' | 'ANO_PASSADO';

export const PERIODOS_PRONTOS: { valor: PeriodoPronto; rotulo: string }[] = [
  { valor: 'HOJE', rotulo: 'Hoje' },
  { valor: 'ULTIMOS_7', rotulo: 'Últimos 7 dias' },
  { valor: 'PROXIMOS_7', rotulo: 'Próximos 7 dias' },
  { valor: 'ESTE_MES', rotulo: 'Este mês' },
  { valor: 'MES_PASSADO', rotulo: 'Mês passado' },
  { valor: 'ESTE_ANO', rotulo: 'Este ano' },
  { valor: 'ANO_PASSADO', rotulo: 'Ano passado' }
];

export const DIAS_DA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const dois = (n: number) => String(n).padStart(2, '0');

export function isoDe(ano: number, mes: number, dia: number): string {
  return `${ano}-${dois(mes)}-${dois(dia)}`;
}

export function ultimoDia(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

export function somarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** `AAAA-MM` somando meses (negativo volta). */
export function somarMeses(competencia: string, meses: number): string {
  const total = Number(competencia.slice(0, 4)) * 12 + Number(competencia.slice(5, 7)) - 1 + meses;
  return `${Math.floor(total / 12)}-${dois(total % 12 + 1)}`;
}

export function intervaloDo(pronto: PeriodoPronto, hoje: string = hojeIso()): { de: string; ate: string } {
  const ano = Number(hoje.slice(0, 4));
  const mes = Number(hoje.slice(5, 7));
  switch (pronto) {
    case 'HOJE': return { de: hoje, ate: hoje };
    case 'ULTIMOS_7': return { de: somarDias(hoje, -6), ate: hoje };
    case 'PROXIMOS_7': return { de: hoje, ate: somarDias(hoje, 6) };
    case 'ESTE_MES': return { de: isoDe(ano, mes, 1), ate: isoDe(ano, mes, ultimoDia(ano, mes)) };
    case 'MES_PASSADO': {
      const [a, m] = somarMeses(hoje.slice(0, 7), -1).split('-').map(Number);
      return { de: isoDe(a, m, 1), ate: isoDe(a, m, ultimoDia(a, m)) };
    }
    case 'ESTE_ANO': return { de: isoDe(ano, 1, 1), ate: isoDe(ano, 12, 31) };
    case 'ANO_PASSADO': return { de: isoDe(ano - 1, 1, 1), ate: isoDe(ano - 1, 12, 31) };
  }
}

/** Qual período pronto o intervalo é, para o select mostrar; `''` = personalizado. */
export function prontoDe(de: string, ate: string, hoje: string = hojeIso()): PeriodoPronto | '' {
  if (!de || !ate) return '';
  return PERIODOS_PRONTOS.find(p => {
    const i = intervaloDo(p.valor, hoje);
    return i.de === de && i.ate === ate;
  })?.valor ?? '';
}

export function dataBr(iso: string | null | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** `DD/MM/AAAA` digitado → ISO; `null` se incompleto ou inexistente (31/02). */
export function dataDeBr(texto: string): string | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mes < 1 || mes > 12 || dia < 1 || dia > ultimoDia(ano, mes) || ano < 1900) return null;
  return isoDe(ano, mes, dia);
}

export function competenciaBr(competencia: string | null | undefined): string {
  if (!competencia || !/^\d{4}-\d{2}$/.test(competencia)) return '';
  return `${competencia.slice(5, 7)}/${competencia.slice(0, 4)}`;
}

export function competenciaDeBr(texto: string): string | null {
  const m = /^(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!m) return null;
  const mes = Number(m[1]);
  if (mes < 1 || mes > 12 || Number(m[2]) < 1900) return null;
  return `${m[2]}-${m[1]}`;
}

/** Máscara de digitação: só números, com as barras no lugar (`DD/MM/AAAA` ou `MM/AAAA`). */
export function mascararData(texto: string, partes: number[]): string {
  const digitos = texto.replace(/\D/g, '').slice(0, partes.reduce((s, p) => s + p, 0));
  const pedacos: string[] = [];
  let i = 0;
  for (const p of partes) {
    if (i >= digitos.length) break;
    pedacos.push(digitos.slice(i, i + p));
    i += p;
  }
  return pedacos.join('/');
}

/** 42 dias (6 semanas, começando no domingo) para a grade do calendário. */
export function diasDaGrade(competencia: string): { iso: string; doMes: boolean }[] {
  const ano = Number(competencia.slice(0, 4));
  const mes = Number(competencia.slice(5, 7));
  const primeiro = isoDe(ano, mes, 1);
  const semana = new Date(`${primeiro}T00:00:00Z`).getUTCDay();
  const inicio = somarDias(primeiro, -semana);
  return Array.from({ length: 42 }, (_, i) => {
    const iso = somarDias(inicio, i);
    return { iso, doMes: iso.slice(0, 7) === competencia };
  });
}

export function competenciaAtual(hoje: string = hojeIso()): string {
  return hoje.slice(0, 7);
}
