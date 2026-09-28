import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { CabecalhoPaginaComponent } from './cabecalho-pagina.component';

@Component({
  imports: [CabecalhoPaginaComponent],
  template: `
    <app-cabecalho-pagina titulo="Clientes" subtitulo="Subtítulo de teste">
      <button acoes>Novo</button>
    </app-cabecalho-pagina>
  `
})
class TestHostComponent {}

describe('CabecalhoPaginaComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('renderiza o título', () => {
    const h1 = fixture.debugElement.query(By.css('h1'));
    expect(h1.nativeElement.textContent).toContain('Clientes');
  });

  it('renderiza o subtítulo', () => {
    const p = fixture.debugElement.query(By.css('p.bo-sub'));
    expect(p.nativeElement.textContent).toContain('Subtítulo de teste');
  });

  it('projeta o conteúdo de ações', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.textContent).toContain('Novo');
  });
});
