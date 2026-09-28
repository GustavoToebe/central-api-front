import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { BarraFiltrosComponent, FiltroAtivo, OpcaoMenu } from './barra-filtros.component';

@Component({
  imports: [BarraFiltrosComponent],
  template: `
    <app-barra-filtros
      [(termo)]="termo"
      [opcoes]="opcoes"
      [filtrosAtivos]="filtrosAtivos"
      (buscar)="buscas.push(1)"
      (opcao)="opcoesEmitidas.push($event)"
      (removerFiltro)="filtrosRemovidos.push($event)"
      (removerTodos)="todosRemovidos = true">
      <input class="bo-field" placeholder="filtro avancado" />
    </app-barra-filtros>
  `
})
class TestHostComponent {
  termo = '';
  opcoes: OpcaoMenu[] = [
    { id: 'exportar', rotulo: 'Exportar' },
    { id: 'desabilitado', rotulo: 'Indisponível', desabilitada: true, dica: 'Sem permissão' }
  ];
  filtrosAtivos: FiltroAtivo[] = [{ chave: 'situacao', rotulo: 'Aberta' }];
  buscas: number[] = [];
  opcoesEmitidas: string[] = [];
  filtrosRemovidos: string[] = [];
  todosRemovidos = false;
}

describe('BarraFiltrosComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('a seta abre o painel', () => {
    const btn = fixture.debugElement.query(By.css('[data-alternar-filtros]'));
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.bo-card'))).toBeTruthy();
  });

  it('Cancelar fecha o painel sem emitir buscar', () => {
    // abre painel
    fixture.debugElement.query(By.css('[data-alternar-filtros]')).nativeElement.click();
    fixture.detectChanges();
    // clica em Cancelar (o Buscar vira Cancelar com o painel aberto)
    const cancelar = fixture.debugElement.query(By.css('[data-buscar]')).nativeElement as HTMLButtonElement;
    expect(cancelar.textContent).toContain('Cancelar');
    cancelar.click();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.bo-card'))).toBeNull();
    expect(host.buscas.length).toBe(0);
  });

  it('Buscar do painel emite buscar e fecha', () => {
    fixture.debugElement.query(By.css('[data-alternar-filtros]')).nativeElement.click();
    fixture.detectChanges();
    const btnBuscar = fixture.debugElement.query(By.css('[data-buscar-painel]'));
    btnBuscar.nativeElement.click();
    fixture.detectChanges();
    expect(host.buscas.length).toBe(1);
    expect(fixture.debugElement.query(By.css('.bo-card'))).toBeNull();
  });

  it('Buscar sem abrir o painel emite buscar', () => {
    fixture.debugElement.query(By.css('[data-buscar]')).nativeElement.click();
    expect(host.buscas.length).toBe(1);
  });

  it('opção desabilitada não emite', () => {
    fixture.debugElement.query(By.css('[data-opcoes]')).nativeElement.click();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('[data-opcao="desabilitado"]')).nativeElement.click();
    fixture.detectChanges();
    expect(host.opcoesEmitidas.length).toBe(0);
  });

  it('× emite a chave do filtro', () => {
    const btn = fixture.debugElement.query(By.css('[data-remover-filtro="situacao"]'));
    btn.nativeElement.click();
    expect(host.filtrosRemovidos).toContain('situacao');
  });
});
