import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ClientesListComponent } from './clientes-list.component';
import { CentralApiService } from '../../core/api/central-api.service';
import { Cliente } from '../../core/api/central.models';

const CLIENTE_MOCK: Cliente = {
  id: 'c1', sequencial: 101, tipo: 'PJ', nome: 'Empresa A', documento: '00.000.000/0001-00',
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: 'SP', uf: 'SP',
  contatos: []
};

describe('ClientesListComponent', () => {
  let fixture: ComponentFixture<ClientesListComponent>;
  let apiSpy: jasmine.SpyObj<CentralApiService>;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('CentralApiService', ['clientes']);
    apiSpy.clientes.and.returnValue(of([CLIENTE_MOCK]));

    await TestBed.configureTestingModule({
      imports: [ClientesListComponent],
      providers: [
        provideRouter([]),
        { provide: CentralApiService, useValue: apiSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientesListComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('clicar na linha navega para o cliente', () => {
    const navegar = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const linha = fixture.debugElement.query(By.css('tr.clicavel'));
    linha.nativeElement.click();
    expect(navegar).toHaveBeenCalledWith(['/clientes', 'c1']);
  });

  it('a busca filtra enquanto digita', () => {
    const campo = fixture.debugElement.query(By.css('[data-busca]')).nativeElement as HTMLInputElement;
    campo.value = 'nada disso';
    campo.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('tr.clicavel')).length).toBe(0);
  });
});
