import { TestBed } from '@angular/core/testing';
import { ThemeService, PALETAS_CENTRAL, FONTES_CENTRAL } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('inicia com paleta vermelha e fonte normal por padrão', () => {
    expect(service.paleta()).toBe('vermelho-carmim');
    expect(service.fonte()).toBe('normal');
    expect(service.vibrar()).toBeTrue();
  });

  it('troca para outra paleta de cor', () => {
    service.escolherPaleta('esmeralda-cyber');
    expect(service.paleta()).toBe('esmeralda-cyber');
  });

  it('troca o tamanho da fonte', () => {
    service.definirFonte('grande');
    expect(service.fonte()).toBe('grande');
  });

  it('restaura padrões', () => {
    service.escolherPaleta('azul-meianoite');
    service.definirFonte('extra');
    service.restaurar();
    expect(service.paleta()).toBe('vermelho-carmim');
    expect(service.fonte()).toBe('normal');
  });
});
