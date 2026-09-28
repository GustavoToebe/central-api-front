import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  imports: [ModalComponent],
  template: `
    <app-modal [aberto]="aberto" titulo="Teste" [fecharNoFundo]="fecharNoFundo"
      (fechar)="fechamentos.push(1)">
      <p>Conteúdo</p>
      <div rodape>
        <button type="button">Ação</button>
      </div>
    </app-modal>
  `
})
class TestHostComponent {
  aberto = true;
  fecharNoFundo = true;
  fechamentos: number[] = [];
}

describe('ModalComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHostComponent] }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Esc emite fechar', () => {
    const painel = fixture.debugElement.query(By.css('[role="dialog"]'));
    painel.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(host.fechamentos.length).toBe(1);
  });

  it('fundo só fecha com fecharNoFundo=true', () => {
    // fecharNoFundo = true → clicar no fundo deve fechar
    const fundo = fixture.debugElement.query(By.css('.fixed.inset-0'));
    fundo.nativeElement.click();
    expect(host.fechamentos.length).toBe(1);
  });

  it('fundo não fecha com fecharNoFundo=false', () => {
    host.fecharNoFundo = false;
    fixture.detectChanges();
    const fundo = fixture.debugElement.query(By.css('.fixed.inset-0'));
    fundo.nativeElement.click();
    expect(host.fechamentos.length).toBe(0);
  });

  it('não renderiza quando fechado', () => {
    host.aberto = false;
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="dialog"]'))).toBeNull();
  });
});
