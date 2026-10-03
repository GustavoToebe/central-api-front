import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BuscaGlobalComponent } from './busca-global.component';
import { FavoritosService } from './favoritos.service';
import { MegaMenuComponent } from './mega-menu.component';
import { NavegacaoContextualComponent } from './navegacao-contextual.component';
import { TODAS_AS_TELAS } from './navegacao';

@Component({ template: '' })
class Vazio {}

const rotas = [{ path: 'financeiro', component: Vazio }, { path: 'clientes', component: Vazio }, { path: 'ajuda', component: Vazio }];

function limparFavoritos() { try { localStorage.removeItem('central.favoritos'); } catch { /* sem armazenamento */ } }

describe('Favoritos (Central)', () => {
  beforeEach(limparFavoritos);

  it('alterna, persiste e ignora armazenamento corrompido', () => {
    TestBed.configureTestingModule({});
    const f = TestBed.inject(FavoritosService);
    f.alternar('/clientes');
    expect(f.eFavorito('/clientes')).toBeTrue();
    expect(JSON.parse(localStorage.getItem('central.favoritos')!)).toEqual(['/clientes']);
    f.alternar('/clientes');
    expect(f.ids()).toEqual([]);
    localStorage.setItem('central.favoritos', '{não é json');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    expect(TestBed.inject(FavoritosService).ids()).toEqual([]);
  });
});

describe('Busca global (Central)', () => {
  beforeEach(() => { limparFavoritos(); TestBed.configureTestingModule({ imports: [BuscaGlobalComponent], providers: [provideRouter(rotas)] }); });

  function montar() {
    const f = TestBed.createComponent(BuscaGlobalComponent);
    f.componentRef.setInput('telas', TODAS_AS_TELAS);
    f.detectChanges();
    return f;
  }

  it('mostra resultados ao digitar e abre a tela com Enter', () => {
    const f = montar();
    f.componentInstance.digitou('plano de contas');
    f.detectChanges();
    expect((f.nativeElement.querySelector('[data-resultado]') as HTMLElement).textContent).toContain('Plano de contas');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    (f.nativeElement.querySelector('[data-busca-global]') as HTMLInputElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(router.navigate).toHaveBeenCalledWith(['/financeiro'], { queryParams: { aba: 'plano-de-contas' } });
  });

  it('sem resultado explica; sem texto mostra os favoritos; Ctrl+K foca', () => {
    const f = montar();
    f.componentInstance.digitou('zzzz');
    f.detectChanges();
    expect(f.nativeElement.querySelector('[data-sem-resultado]').textContent).toContain('Nenhuma tela encontrada');
    TestBed.inject(FavoritosService).alternar('/clientes');
    f.componentInstance.digitou('');
    f.detectChanges();
    expect((f.nativeElement.querySelector('[data-resultado]') as HTMLElement).textContent).toContain('Clientes');
    document.body.appendChild(f.nativeElement);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    expect(document.activeElement).toBe(f.nativeElement.querySelector('[data-busca-global]'));
    f.nativeElement.remove();
  });
});

describe('Menu completo (Central)', () => {
  beforeEach(() => { limparFavoritos(); TestBed.configureTestingModule({ imports: [MegaMenuComponent], providers: [provideRouter(rotas)] }); });

  function montar() {
    const f = TestBed.createComponent(MegaMenuComponent);
    f.componentRef.setInput('telas', TODAS_AS_TELAS);
    f.detectChanges();
    return f;
  }

  it('mostra as seções, favorita, pesquisa e fecha com Esc e com o X', () => {
    const f = montar();
    expect(f.nativeElement.querySelector('[data-secao="financeiro"]').textContent).toContain('Plano de contas');
    (f.nativeElement.querySelector('[data-secao="comercial"] [data-favoritar]') as HTMLElement).click();
    expect(TestBed.inject(FavoritosService).ids().length).toBe(1);
    f.componentInstance.termo.set('banco');
    f.detectChanges();
    expect(f.nativeElement.querySelector('[data-mega-resultados]')).not.toBeNull();
    f.componentInstance.termo.set('zzzz');
    f.detectChanges();
    expect(f.nativeElement.querySelector('[data-mega-sem-resultado]')).not.toBeNull();
    const fechou = jasmine.createSpy('fechou');
    f.componentInstance.fechar.subscribe(fechou);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    (f.nativeElement.querySelector('[data-mega-fechar]') as HTMLElement).click();
    expect(fechou).toHaveBeenCalledTimes(2);
  });

  it('escolher uma tela navega com a aba e fecha', () => {
    const f = montar();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    const fechou = jasmine.createSpy('fechou');
    f.componentInstance.fechar.subscribe(fechou);
    f.componentInstance.abrir(TODAS_AS_TELAS.find(t => t.id === 'financeiro?contas')!);
    expect(router.navigate).toHaveBeenCalledWith(['/financeiro'], { queryParams: { aba: 'contas' } });
    expect(fechou).toHaveBeenCalled();
  });
});

describe('Navegação contextual (Central)', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [NavegacaoContextualComponent], providers: [provideRouter(rotas)] }));

  async function montar(endereco: string) {
    const f = TestBed.createComponent(NavegacaoContextualComponent);
    f.componentRef.setInput('telas', TODAS_AS_TELAS);
    await TestBed.inject(Router).navigateByUrl(endereco);
    f.detectChanges();
    return f;
  }

  it('no financeiro mostra as abas e os relatórios como atalhos, sem repetir o item principal', async () => {
    const f = await montar('/financeiro?aba=plano-de-contas');
    expect(f.nativeElement.querySelector('[data-tela-atual]').textContent).toContain('Plano de contas');
    const chips = Array.from(f.nativeElement.querySelectorAll('[data-irma]') as NodeListOf<HTMLElement>).map(e => e.textContent!.trim());
    expect(chips).toContain('Lançamentos financeiros');
    expect(chips).toContain('Banco/caixa');
    expect(chips).not.toContain('Financeiro');
    expect(chips).toContain('Relatórios');
  });

  it('numa seção de uma tela só (Ajuda) a faixa some', async () => {
    const f = await montar('/ajuda');
    expect(f.nativeElement.querySelector('[data-navegacao-contextual]')).toBeNull();
  });
});
