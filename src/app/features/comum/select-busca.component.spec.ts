import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectBuscaComponent, OpcaoSelectBusca } from './select-busca.component';

@Component({
  imports: [FormsModule, SelectBuscaComponent],
  template: `
    <app-select-busca [opcoes]="opcoes" [(ngModel)]="valor" name="sel" />
  `
})
class TestHostComponent {
  valor: string | null = null;
  opcoes: OpcaoSelectBusca[] = [
    { valor: '1', rotulo: 'João da Silva', detalhe: '123.456.789-00' },
    { valor: '2', rotulo: 'Maria Conceição', detalhe: '987.654.321-00' },
    { valor: '3', rotulo: 'Pedrão Araújo', detalhe: '111.222.333-44' },
  ];
}

describe('SelectBuscaComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  function abrirPainel(): HTMLInputElement {
    fixture.debugElement.query(By.css('button[data-ancora]')).nativeElement.click();
    fixture.detectChanges();
    return document.body.querySelector('[data-busca-opcao]') as HTMLInputElement;
  }

  it('filtra sem acento', () => {
    const input = abrirPainel();
    input.value = 'conceicao';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const itens = document.body.querySelectorAll('li[role="option"]');
    expect(itens.length).toBe(1);
    expect(itens[0].textContent).toContain('Maria Conceição');
  });

  it('Enter escolhe o item focado', () => {
    const input = abrirPainel();
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(host.valor).toBe('1');
    expect(document.body.querySelector('[data-busca-opcao]')).toBeNull();
  });

  it('✕ emite null', async () => {
    host.valor = '1';
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const x = fixture.debugElement.query(By.css('[aria-label="Limpar"]'));
    x.nativeElement.click();
    fixture.detectChanges();
    expect(host.valor).toBeNull();
  });
});
