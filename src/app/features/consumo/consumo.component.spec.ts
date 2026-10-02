import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { ConsumoComponent } from './consumo.component';
import { CentralApiService } from '../../core/api/central-api.service';
import { ConsumoInstancia } from './consumo.models';
describe('Painel de consumo',()=>{
 let api:jasmine.SpyObj<CentralApiService>;
 const dados:ConsumoInstancia={contratacaoId:'a',funcionalidades:['MURAL'],consumo:{planoNome:'Inicial',versaoDireitos:2,direitosConfirmadosEm:'2026-10-01T00:00:00Z',consultadoEm:'2026-10-01T01:00:00Z',itens:[{codigo:'armazenamento_mb',nome:'Arquivos',usado:1048576,limite:2097152,disponivel:null,estado:'INVENTARIO_PENDENTE',unidade:'bytes',pendentes:1,competencia:null}]}};
 beforeEach(()=>{api=jasmine.createSpyObj('api',['consumoInstancia']);api.consumoInstancia.and.returnValue(of(dados));TestBed.configureTestingModule({imports:[ConsumoComponent],providers:[provideRouter([]),{provide:CentralApiService,useValue:api}]});});
 it('mostra inventário pendente sem afirmar espaço livre',()=>{const f=TestBed.createComponent(ConsumoComponent);f.componentRef.setInput('id','a');f.detectChanges();expect(f.nativeElement.textContent).toContain('Inventário pendente');expect(f.componentInstance.quantidade(null,'bytes')).toBe('—');expect(f.componentInstance.quantidade(1048576,'bytes')).toBe('1 MB');});
 it('falha apaga dados anteriores e mostra indisponibilidade',()=>{const f=TestBed.createComponent(ConsumoComponent);f.componentRef.setInput('id','a');f.detectChanges();api.consumoInstancia.and.returnValue(throwError(()=>new Error('rede')));f.componentInstance.carregar();f.detectChanges();expect(f.componentInstance.dados()).toBeNull();expect(f.nativeElement.querySelector('[role=alert]')).toBeTruthy();});
 it('troca de contratação cancela a consulta antiga',()=>{const antiga=new Subject<ConsumoInstancia>();api.consumoInstancia.and.returnValue(antiga);const f=TestBed.createComponent(ConsumoComponent);f.componentRef.setInput('id','a');f.detectChanges();api.consumoInstancia.and.returnValue(of({...dados,contratacaoId:'b'}));f.componentRef.setInput('id','b');f.detectChanges();antiga.next(dados);expect(f.componentInstance.dados()?.contratacaoId).toBe('b');expect(api.consumoInstancia).toHaveBeenCalledWith('b');f.destroy();});
});
