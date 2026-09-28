import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { AuthService } from '../auth/auth.service';

describe('LayoutComponent — menu recolhível', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let comp: LayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { operador: () => ({ nome: 'Teste', email: 'teste@x.com' }), logout: async () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LayoutComponent);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    try { localStorage.removeItem('central.menuRecolhido'); } catch { /* noop */ }
  });

  it('botão alterna o estado recolhido', () => {
    const btn = fixture.debugElement.query(By.css('[data-menu="recolher"]'));
    expect(comp.recolhido()).toBeFalse();
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(comp.recolhido()).toBeTrue();
  });

  it('no desktop, recolhido aplica a largura de 64 no menu e no conteúdo', () => {
    comp.desktop.set(true);
    fixture.debugElement.query(By.css('[data-menu="recolher"]')).nativeElement.click();
    fixture.detectChanges();
    expect(comp.larguraMenu()).toBe(64);
    expect(fixture.nativeElement.querySelector('aside.bo-rail').classList).toContain('recolhido');
    expect(fixture.nativeElement.querySelector('main.bo-main').classList).toContain('recolhido');
  });

  it('no celular, recolhido não muda o menu (gaveta com rótulos)', () => {
    comp.desktop.set(false);
    comp.recolhido.set(true);
    fixture.detectChanges();
    expect(comp.larguraMenu()).toBe(220);
    expect(fixture.nativeElement.querySelector('aside.bo-rail').classList).not.toContain('recolhido');
  });

  it('grava true no localStorage ao recolher', () => {
    const btn = fixture.debugElement.query(By.css('[data-menu="recolher"]'));
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(localStorage.getItem('central.menuRecolhido')).toBe('true');
  });
});
