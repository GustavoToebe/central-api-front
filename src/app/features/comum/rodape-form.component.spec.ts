import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RodapeFormComponent } from './rodape-form.component';

@Component({
  imports: [RodapeFormComponent],
  template: `
    <app-rodape-form [carregando]="carregando" (cancelar)="cancelado = true">
      <span>extra</span>
    </app-rodape-form>
  `
})
class TestHostComponent {
  carregando = false;
  cancelado = false;
}

describe('RodapeFormComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Cancelar emite o evento', () => {
    fixture.debugElement.query(By.css('button.bo-btn-ghost')).nativeElement.click();
    expect(host.cancelado).toBeTrue();
  });

  it('Salvar fica desabilitado com carregando', () => {
    host.carregando = true;
    fixture.detectChanges();
    const btn = fixture.debugElement.query(By.css('button[type="submit"]'));
    expect(btn.nativeElement.disabled).toBeTrue();
    expect(btn.nativeElement.textContent).toContain('Salvando');
  });
});
