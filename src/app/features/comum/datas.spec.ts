import {
  competenciaBr, competenciaDeBr, dataBr, dataDeBr, diasDaGrade, intervaloDo, mascararData, prontoDe, somarMeses
} from './datas';

describe('datas', () => {
  const hoje = '2026-09-27';

  it('períodos prontos a partir de hoje', () => {
    expect(intervaloDo('HOJE', hoje)).toEqual({ de: hoje, ate: hoje });
    expect(intervaloDo('ULTIMOS_7', hoje)).toEqual({ de: '2026-09-21', ate: hoje });
    expect(intervaloDo('PROXIMOS_7', hoje)).toEqual({ de: hoje, ate: '2026-10-03' });
    expect(intervaloDo('ESTE_MES', hoje)).toEqual({ de: '2026-09-01', ate: '2026-09-30' });
    expect(intervaloDo('MES_PASSADO', hoje)).toEqual({ de: '2026-08-01', ate: '2026-08-31' });
    expect(intervaloDo('MES_PASSADO', '2026-01-10')).toEqual({ de: '2025-12-01', ate: '2025-12-31' });
    expect(intervaloDo('ESTE_ANO', hoje)).toEqual({ de: '2026-01-01', ate: '2026-12-31' });
    expect(intervaloDo('ANO_PASSADO', hoje)).toEqual({ de: '2025-01-01', ate: '2025-12-31' });
  });

  it('reconhece o período pronto de um intervalo', () => {
    expect(prontoDe('2026-09-01', '2026-09-30', hoje)).toBe('ESTE_MES');
    expect(prontoDe('2026-09-02', '2026-09-30', hoje)).toBe('');
    expect(prontoDe('', '2026-09-30', hoje)).toBe('');
  });

  it('mostra e lê DD/MM/AAAA e MM/AAAA, sem nome de mês', () => {
    expect(dataBr('2026-09-05')).toBe('05/09/2026');
    expect(dataDeBr('05/09/2026')).toBe('2026-09-05');
    expect(dataDeBr('31/02/2026')).toBeNull();
    expect(dataDeBr('05/09/20')).toBeNull();
    expect(competenciaBr('2026-09')).toBe('09/2026');
    expect(competenciaDeBr('09/2026')).toBe('2026-09');
    expect(competenciaDeBr('13/2026')).toBeNull();
  });

  it('máscara põe as barras enquanto digita', () => {
    expect(mascararData('05092026', [2, 2, 4])).toBe('05/09/2026');
    expect(mascararData('0509', [2, 2, 4])).toBe('05/09');
    expect(mascararData('a092026x', [2, 4])).toBe('09/2026');
  });

  it('grade de 6 semanas começando no domingo e soma de meses', () => {
    const grade = diasDaGrade('2026-09');
    expect(grade.length).toBe(42);
    expect(grade[0]).toEqual({ iso: '2026-08-30', doMes: false }); // 01/09/2026 é terça
    expect(grade[2]).toEqual({ iso: '2026-09-01', doMes: true });
    expect(somarMeses('2026-12', 1)).toBe('2027-01');
    expect(somarMeses('2026-01', -1)).toBe('2025-12');
  });
});
