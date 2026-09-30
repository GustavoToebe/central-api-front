import { Injectable, signal } from '@angular/core';

export interface PaletaCentral {
  id: string;
  nome: string;
  descricao: string;
  brand: string;
  brandHover: string;
  brandGlow: string;
}

export const PALETAS_CENTRAL: PaletaCentral[] = [
  {
    id: 'vermelho-carmim',
    nome: 'Vermelho Carmim (Original)',
    descricao: 'Padrão de operação da Central com alta energia e contraste nítido',
    brand: '#e10600',
    brandHover: '#ff1f1a',
    brandGlow: 'rgba(225, 6, 0, 0.22)'
  },
  {
    id: 'azul-meianoite',
    nome: 'Azul Meia-Noite',
    descricao: 'Tons escuros de cobalto para foco analítico e estabilidade de infraestrutura',
    brand: '#3b82f6',
    brandHover: '#60a5fa',
    brandGlow: 'rgba(59, 130, 246, 0.22)'
  },
  {
    id: 'esmeralda-cyber',
    nome: 'Esmeralda Cyber',
    descricao: 'Verde esmeralda escuro inspirado em telemetria, uptime e monitoramento ativo',
    brand: '#10b981',
    brandHover: '#34d399',
    brandGlow: 'rgba(16, 185, 129, 0.22)'
  },
  {
    id: 'roxo-obsidiana',
    nome: 'Roxo Obsidiana',
    descricao: 'Violeta profundo para estética SaaS contemporânea e imersiva',
    brand: '#8b5cf6',
    brandHover: '#a78bfa',
    brandGlow: 'rgba(139, 92, 246, 0.22)'
  },
  {
    id: 'ambar-vulcanico',
    nome: 'Âmbar Vulcânico',
    descricao: 'Dourado escuro e âmbar para máxima visibilidade e leitura confortável',
    brand: '#f59e0b',
    brandHover: '#fbbf24',
    brandGlow: 'rgba(245, 158, 11, 0.22)'
  },
  {
    id: 'titanio-pro',
    nome: 'Titânio Pro',
    descricao: 'Cinza grafite e platina puro para minimalismo técnico e precisão',
    brand: '#94a3b8',
    brandHover: '#cbd5e1',
    brandGlow: 'rgba(148, 163, 184, 0.22)'
  }
];

export interface FonteCentral {
  id: 'normal' | 'medio' | 'grande' | 'extra';
  rotulo: string;
  detalhe: string;
  tamanhoPx: number;
}

export const FONTES_CENTRAL: FonteCentral[] = [
  { id: 'normal', rotulo: '14 px', detalhe: 'Padrão compacto', tamanhoPx: 14 },
  { id: 'medio', rotulo: '16 px', detalhe: 'Médio confortável', tamanhoPx: 16 },
  { id: 'grande', rotulo: '18 px', detalhe: 'Grande para leitura', tamanhoPx: 18 },
  { id: 'extra', rotulo: '20 px', detalhe: 'Extra acessível', tamanhoPx: 20 }
];

const CHAVE_STORAGE = 'central.tema';

interface TemaConfig {
  paletaId: string;
  fonteId: 'normal' | 'medio' | 'grande' | 'extra';
  vibrar: boolean;
}

const PADRAO: TemaConfig = {
  paletaId: 'vermelho-carmim',
  fonteId: 'normal',
  vibrar: true
};

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly paleta = signal<string>(PADRAO.paletaId);
  readonly fonte = signal<'normal' | 'medio' | 'grande' | 'extra'>(PADRAO.fonteId);
  readonly vibrar = signal<boolean>(PADRAO.vibrar);

  constructor() {
    this.carregar();
  }

  escolherPaleta(id: string): void {
    const achou = PALETAS_CENTRAL.find(p => p.id === id);
    if (!achou) return;
    this.paleta.set(achou.id);
    this.aplicarCss();
    this.salvar();
    this.notificarToque();
  }

  definirFonte(id: 'normal' | 'medio' | 'grande' | 'extra'): void {
    this.fonte.set(id);
    this.aplicarCss();
    this.salvar();
    this.notificarToque();
  }

  definirVibrar(ativo: boolean): void {
    this.vibrar.set(ativo);
    this.salvar();
    if (ativo) this.notificarToque();
  }

  restaurar(): void {
    this.paleta.set(PADRAO.paletaId);
    this.fonte.set(PADRAO.fonteId);
    this.vibrar.set(PADRAO.vibrar);
    this.aplicarCss();
    this.salvar();
    this.notificarToque();
  }

  private carregar(): void {
    if (typeof window === 'undefined') return;
    try {
      const salvo = localStorage.getItem(CHAVE_STORAGE);
      if (salvo) {
        const parsed = JSON.parse(salvo) as Partial<TemaConfig>;
        if (parsed.paletaId && PALETAS_CENTRAL.some(p => p.id === parsed.paletaId)) {
          this.paleta.set(parsed.paletaId);
        }
        if (parsed.fonteId && FONTES_CENTRAL.some(f => f.id === parsed.fonteId)) {
          this.fonte.set(parsed.fonteId);
        }
        if (typeof parsed.vibrar === 'boolean') {
          this.vibrar.set(parsed.vibrar);
        }
      }
    } catch {
      // Ignora erro de JSON corrompido
    }
    this.aplicarCss();
  }

  private salvar(): void {
    if (typeof window === 'undefined') return;
    try {
      const dados: TemaConfig = {
        paletaId: this.paleta(),
        fonteId: this.fonte(),
        vibrar: this.vibrar()
      };
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
    } catch {
      // Ignora erro de storage restrito
    }
  }

  private aplicarCss(): void {
    if (typeof document === 'undefined') return;
    const raiz = document.documentElement;
    const paleta = PALETAS_CENTRAL.find(p => p.id === this.paleta()) ?? PALETAS_CENTRAL[0];
    const fonte = FONTES_CENTRAL.find(f => f.id === this.fonte()) ?? FONTES_CENTRAL[0];

    raiz.style.setProperty('--brand', paleta.brand);
    raiz.style.setProperty('--brand-hover', paleta.brandHover);
    raiz.style.setProperty('--brand-glow', paleta.brandGlow);
    raiz.style.setProperty('--fonte-base', `${fonte.tamanhoPx}px`);

    raiz.classList.remove('fonte-normal', 'fonte-medio', 'fonte-grande', 'fonte-extra');
    raiz.classList.add(`fonte-${fonte.id}`);
  }

  private notificarToque(): void {
    if (!this.vibrar() || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(15);
    } catch {
      // Ignora navegadores que bloqueiam haptics
    }
  }
}
