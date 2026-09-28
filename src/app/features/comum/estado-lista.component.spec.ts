import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EstadoListaComponent } from './estado-lista.component';

describe('EstadoListaComponent', () => {
  let fixture: ComponentFixture<EstadoListaComponent>;
  let comp: EstadoListaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [EstadoListaComponent] }).compileComponents();
    fixture = TestBed.createComponent(EstadoListaComponent);
    comp = fixture.componentInstance;
  });

  it('exibe skeleton quando carregando', () => {
    fixture.componentRef.setInput('carregando', true);
    fixture.detectChanges();
    const esqueletos = fixture.debugElement.queryAll(By.css('[data-esqueleto]'));
    expect(esqueletos.length).toBe(5);
  });

  it('exibe mensagem padrão quando vazio', () => {
    fixture.componentRef.setInput('vazio', true);
    fixture.detectChanges();
    const msg = fixture.debugElement.query(By.css('.bo-sub'));
    expect(msg.nativeElement.textContent).toContain('Nenhum registro encontrado, tente outros filtros.');
  });

  it('exibe mensagem personalizada quando vazio', () => {
    fixture.componentRef.setInput('vazio', true);
    fixture.componentRef.setInput('mensagemVazio', 'Nenhum cliente.');
    fixture.detectChanges();
    const msg = fixture.debugElement.query(By.css('.bo-sub'));
    expect(msg.nativeElement.textContent).toContain('Nenhum cliente.');
  });

  it('não exibe nada quando não carregando e não vazio', () => {
    fixture.componentRef.setInput('carregando', false);
    fixture.componentRef.setInput('vazio', false);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[data-esqueleto]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.bo-sub'))).toBeNull();
  });
});
