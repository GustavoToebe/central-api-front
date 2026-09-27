import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CampoCompetenciaComponent } from './campo-competencia.component';
import { CampoDataComponent } from './campo-data.component';
import { intervaloDo } from './datas';
import { PeriodoComponent } from './periodo.component';

@Component({
  imports: [FormsModule, CampoDataComponent, CampoCompetenciaComponent, PeriodoComponent],
  template: `
    <div style="overflow: hidden; height: 40px">
      <app-campo-data name="d" [(ngModel)]="data" max="2026-12-31" />
      <app-campo-competencia name="c" [(ngModel)]="competencia" />
      <app-periodo [(de)]="de" [(ate)]="ate" (aplicado)="aplicacoes = aplicacoes + 1" />
    </div>
  `
})
class TelaComponent {
  data = '2026-09-05';
  competencia = '2026-09';
  de = '';
  ate = '';
  aplicacoes = 0;
}

describe('campos de data', () => {
  async function montar() {
    const fixture = TestBed.createComponent(TelaComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  function painel(): HTMLElement {
    return document.body.querySelector(':scope > .bo-flutuante') as HTMLElement;
  }

  afterEach(() => document.body.querySelectorAll(':scope > .bo-flutuante').forEach(e => e.remove()));

  it('data: mostra DD/MM/AAAA, aceita digitado e escolhe no calendário aberto no body', async () => {
    const fixture = await montar();
    const campo = fixture.nativeElement.querySelector('app-campo-data input') as HTMLInputElement;
    expect(campo.value).toBe('05/09/2026');

    campo.value = '10102026';
    campo.dispatchEvent(new Event('input'));
    expect(campo.value).toBe('10/10/2026');
    expect(fixture.componentInstance.data).toBe('2026-10-10');

    campo.click();
    fixture.detectChanges();
    expect(painel()).not.toBeNull();
    expect(fixture.nativeElement.contains(painel())).toBeFalse();
    expect((painel().querySelector('[data-dia="2027-01-01"]') as HTMLButtonElement | null)?.disabled ?? true).toBeTrue();
    (painel().querySelector('[data-dia="2026-10-20"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.data).toBe('2026-10-20');
    expect(painel()).toBeNull();
  });

  it('competência: mostra MM/AAAA e escolhe o mês pelo número', async () => {
    const fixture = await montar();
    const campo = fixture.nativeElement.querySelector('app-campo-competencia input') as HTMLInputElement;
    expect(campo.value).toBe('09/2026');

    campo.click();
    fixture.detectChanges();
    expect(painel().textContent).not.toContain('setembro');
    (painel().querySelector('[data-mes="11"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(fixture.componentInstance.competencia).toBe('2026-11');
    expect(campo.value).toBe('11/2026');
  });

  it('período: pronto "Este mês" só aplica no OK; Limpar tira o filtro', async () => {
    const fixture = await montar();
    const tela = fixture.componentInstance;
    const periodo = fixture.debugElement.query(c => c.componentInstance instanceof PeriodoComponent).componentInstance as PeriodoComponent;
    (fixture.nativeElement.querySelector('app-periodo button') as HTMLButtonElement).click();
    fixture.detectChanges();

    const select = painel().querySelector('select') as HTMLSelectElement;
    select.value = 'ESTE_MES';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(tela.de).toBe('');

    const botoes = Array.from(painel().querySelectorAll('button')) as HTMLButtonElement[];
    botoes.find(b => b.textContent?.trim() === 'OK')!.click();
    fixture.detectChanges();
    const mes = intervaloDo('ESTE_MES');
    expect([tela.de, tela.ate]).toEqual([mes.de, mes.ate]);
    expect(tela.aplicacoes).toBe(1);
    expect(periodo.resumo()).toContain('Este mês');

    periodo.abrir();
    fixture.detectChanges();
    (Array.from(painel().querySelectorAll('button')) as HTMLButtonElement[]).find(b => b.textContent?.trim() === 'Limpar')!.click();
    fixture.detectChanges();
    expect([tela.de, tela.ate]).toEqual(['', '']);
    expect(tela.aplicacoes).toBe(2);
  });

  it('período: dois cliques no calendário marcam início e fim, na ordem certa', async () => {
    const fixture = await montar();
    const periodo = fixture.debugElement.query(c => c.componentInstance instanceof PeriodoComponent).componentInstance as PeriodoComponent;
    periodo.abrir();
    periodo.escolherDia('2026-09-20');
    periodo.escolherDia('2026-09-10');
    expect([periodo.rascunhoDe(), periodo.rascunhoAte()]).toEqual(['2026-09-10', '2026-09-20']);
    periodo.aplicar();
    expect(periodo.resumo()).toBe('10/09/2026 a 20/09/2026');
  });
});
