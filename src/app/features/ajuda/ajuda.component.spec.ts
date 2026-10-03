import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Route, convertToParamMap, provideRouter } from '@angular/router';
import { AjudaComponent } from './ajuda.component';
import { TEMAS } from './ajuda-temas';
import { ajudaDaRota } from './ajuda-da-rota';
import { SECOES } from '../../core/layout/navegacao';
import { routes } from '../../app.routes';

function montar(tema = 'financeiro') {
  TestBed.configureTestingModule({ imports: [AjudaComponent], providers: [provideRouter([]),
    { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ tema })), snapshot: { queryParamMap: convertToParamMap({ tema }) } } }] });
  const fixture = TestBed.createComponent(AjudaComponent);
  fixture.detectChanges();
  return fixture;
}

describe('AjudaComponent (Central)', () => {
  it('abre o tema pedido e mostra resumo, cuidados, perguntas e relacionados por seção', () => {
    const fixture = montar();
    const tema = fixture.nativeElement.querySelector('[data-tema="financeiro"]') as HTMLElement;
    expect(tema.hasAttribute('open')).toBeTrue();
    expect(tema.querySelector('[data-resumo]')!.textContent).toContain('Central');
    expect(tema.querySelector('[data-cuidados]')).not.toBeNull();
    expect(tema.querySelector('[data-perguntas]')!.textContent).toContain('conta contábil');
    expect(tema.querySelector('[data-relacionado]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[data-secao-ajuda="financeiro"]')).not.toBeNull();
  });

  it('busca sem acento também nos cuidados e perguntas', () => {
    const fixture = montar();
    fixture.componentInstance.busca.set('demonstrativo'); fixture.detectChanges();
    expect(fixture.componentInstance.temas().map(t => t.id)).toContain('relatorios');
    fixture.componentInstance.busca.set('zzzz'); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma orientação encontrada');
  });
});

describe('Conteúdo da Ajuda (Central)', () => {
  const ids = TEMAS.map(t => t.id);

  it('cada tema é completo e consistente', () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const t of TEMAS) {
      expect(SECOES.some(s => s.id === t.secao)).withContext(t.id).toBeTrue();
      expect(t.resumo.length).withContext(t.id + ' resumo').toBeGreaterThan(30);
      expect(t.passos.length).withContext(t.id + ' passos').toBeGreaterThanOrEqual(2);
      expect((t.relacionados ?? []).every(r => ids.includes(r) && r !== t.id)).withContext(t.id + ' relacionados').toBeTrue();
    }
  });

  it('o financeiro explica o plano de contas e os relatórios existem', () => {
    const f = TEMAS.find(t => t.id === 'financeiro')!;
    expect(f.titulo).toContain('plano de contas');
    expect(JSON.stringify(f)).not.toContain('ategoria');
    expect(TEMAS.find(t => t.id === 'relatorios')!.passos.join(' ')).toContain('Demonstrativo do resultado do exercício');
  });

  it('toda tela do painel aponta para um tema que existe', () => {
    const filhas = (rs: Route[]): Route[] => rs.flatMap(r => [r, ...(r.children ? filhas(r.children) : [])]);
    const caminhos = filhas(routes as Route[]).filter(r => r.loadComponent && r.path && !['login', '**'].includes(r.path))
      .map(r => '/' + r.path!.replace(/:id/g, '123').replace(/:tipo/g, 'despesas'));
    expect(caminhos.length).toBeGreaterThan(15);
    for (const c of caminhos) {
      if (c === '/ajuda') { expect(ajudaDaRota(c)).toBeNull(); continue; }
      const tema = ajudaDaRota(c);
      expect(tema).withContext(c).not.toBeNull();
      expect(ids).withContext(c).toContain(tema!);
    }
  });

  it('resolve consumo, nova contratação e ignora consulta e barra final', () => {
    expect(ajudaDaRota('/contratacoes/5/consumo')).toBe('consumo');
    expect(ajudaDaRota('/contratacoes/5')).toBe('contratacoes');
    expect(ajudaDaRota('/contratacoes/nova')).toBe('primeiros-passos');
    expect(ajudaDaRota('/relatorios/dre/')).toBe('relatorios');
    expect(ajudaDaRota('/financeiro?aba=plano-de-contas')).toBe('financeiro');
    expect(ajudaDaRota('/ajuda?tema=x')).toBeNull();
  });
});
