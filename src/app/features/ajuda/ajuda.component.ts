import { ChangeDetectionStrategy,Component,computed,inject,signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute,RouterLink } from '@angular/router';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { BarraFiltrosComponent } from '../comum/barra-filtros.component';
import { TEMAS } from './ajuda-temas';
const normalizar=(texto:string)=>texto.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
@Component({
 selector:'app-ajuda',imports:[RouterLink,CabecalhoPaginaComponent,BarraFiltrosComponent],changeDetection:ChangeDetectionStrategy.OnPush,
 template:`
 <div class="space-y-6">
  <app-cabecalho-pagina titulo="Ajuda" subtitulo="Orientações para a gestão comercial e financeira dos aplicativos." />
  <app-barra-filtros placeholder="Buscar uma orientação" [termo]="busca()" (termoChange)="busca.set($event)" [temFiltros]="false" />
  <p class="bo-sub" role="status">{{temas().length}} orientações encontradas</p>
  @if(busca()){<button type="button" class="bo-btn-ghost" (click)="busca.set('')">Limpar busca</button>}
  @for(tema of temas();track tema.id){
   <details class="bo-card p-5" [open]="tema.id===temaInicial()" [attr.data-tema]="tema.id">
    <summary class="cursor-pointer text-lg font-bold">{{tema.titulo}}</summary>
    <ol class="mt-4 list-decimal space-y-3 pl-5 text-sm text-neutral-300">@for(passo of tema.passos;track $index){<li>{{passo}}</li>}</ol>
    <a class="bo-btn-line mt-4 inline-flex" [routerLink]="tema.url" [attr.aria-label]="'Abrir módulo: '+tema.titulo">Abrir módulo</a>
   </details>
  }@empty{<p class="bo-card p-6 text-neutral-400">Nenhuma orientação encontrada para esta busca.</p>}
 </div>`
})
export class AjudaComponent {
 private readonly route=inject(ActivatedRoute);
 private readonly parametros=toSignal(this.route.queryParamMap,{initialValue:this.route.snapshot.queryParamMap});
 readonly temaInicial=computed(()=>this.parametros().get('tema'));
 readonly busca=signal('');
 readonly temas=computed(()=>{const termo=normalizar(this.busca().trim());return TEMAS.filter(t=>!termo||normalizar(t.titulo+' '+t.passos.join(' ')).includes(termo));});
}
