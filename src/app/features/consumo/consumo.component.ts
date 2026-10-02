import { ChangeDetectionStrategy, Component, OnDestroy, OnChanges, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CentralApiService } from '../../core/api/central-api.service';
import { mensagemApi } from '../../core/api/api-error';
import { CabecalhoPaginaComponent } from '../comum/cabecalho-pagina.component';
import { ConsumoInstancia, ItemConsumo } from './consumo.models';
/** Consulta explícita de uma contratação, sem varrer apps nem guardar dados pessoais. */
@Component({selector:'app-consumo',imports:[CommonModule,RouterLink,CabecalhoPaginaComponent],changeDetection:ChangeDetectionStrategy.OnPush,template:`
 <div class="space-y-5">
 <app-cabecalho-pagina titulo="Consumo da instância" subtitulo="Contagens atuais do aplicativo. Nenhum dado pessoal é importado."><div acoes><button class="bo-btn" type="button" [disabled]="carregando()" (click)="carregar()">Atualizar consumo</button></div></app-cabecalho-pagina>
 <a class="bo-link" [routerLink]="['/contratacoes',id()]">← Contratação</a>
 @if(erro()){<div class="bo-erro" role="alert">{{erro()}}</div>}
 @if(carregando()){<div class="bo-card p-5" role="status">Consultando o aplicativo…</div>}
 @if(dados();as d){
 <section class="bo-card space-y-2 p-5"><h2 class="bo-label">Plano confirmado no aplicativo</h2><p>{{d.consumo.planoNome || 'Sem nome informado'}} · direitos v{{d.consumo.versaoDireitos}}</p><p class="bo-sub">Consultado em {{d.consumo.consultadoEm | date:'dd/MM/yyyy HH:mm:ss'}} · Direitos confirmados em {{d.consumo.direitosConfirmadosEm | date:'dd/MM/yyyy HH:mm:ss'}}</p></section>
 <div class="bo-card bo-table-rolagem"><table class="bo-table w-full"><thead><tr><th>Recurso</th><th>Utilizado</th><th>Limite</th><th>Disponível</th><th>Estado</th></tr></thead><tbody>
 @for(i of d.consumo.itens;track i.codigo){<tr><td>{{i.nome}}@if(i.competencia){<div class="bo-sub">Competência {{i.competencia}}</div>}</td><td>{{quantidade(i.usado,i.unidade)}}</td><td>{{quantidade(i.limite,i.unidade)}}</td><td>{{quantidade(i.disponivel,i.unidade)}}</td><td><span class="bo-chip" [class]="tons[i.estado] || 'bo-mute'">{{rotulos[i.estado] || i.estado}}</span>@if(i.pendentes){<p class="bo-sub">{{i.pendentes}} fotos sem tamanho confirmado</p>}</td></tr>}
 </tbody></table></div>
 <section class="bo-card space-y-2 p-5"><h2 class="bo-label">Funcionalidades liberadas</h2><div class="flex flex-wrap gap-2">@for(f of d.funcionalidades;track f){<span class="bo-chip bo-ok">{{f}}</span>}@empty{<p class="bo-sub">Nenhuma funcionalidade contratada.</p>}</div></section>
 <p class="bo-sub">Armazenamento considera arquivos vinculados e anexos retidos, não todo o bucket. Inventário pendente impede afirmar espaço disponível. E-mails e WhatsApp contam reservas da fila; tentativas e mensagens diretas de autenticação não entram. Falha de consulta não representa consumo zero.</p>
 }
 <section class="bo-card space-y-3 p-5"><button type="button" class="bo-btn-line" [disabled]="carregandoHistorico()" (click)="buscarHistorico()">Ver histórico de 90 dias</button><p class="bo-sub">Última consulta bem-sucedida por dia. Dias ausentes não representam zero. Sem coleta automática de todas as instâncias.</p>@if(erroHistorico()){<p class="bo-erro" role="alert">{{erroHistorico()}}</p>}@for(p of historico();track p.dia){<details><summary>{{p.dia | date:'dd/MM/yyyy':'UTC'}} · {{p.consumo.planoNome}}</summary>@for(i of p.consumo.itens;track i.codigo){<p>{{i.nome}}: {{quantidade(i.usado,i.unidade)}} · <span [class]="tons[i.estado]||'bo-mute'">{{rotulos[i.estado]||i.estado}}</span> @if(i.competencia){ · {{i.competencia}}}</p>}</details>}@if(historicoConsultado()&&!historico().length&&!erroHistorico()){<p class="bo-sub">Nenhuma consulta registrada.</p>}</section>
 </div>`})
export class ConsumoComponent implements OnChanges,OnDestroy {
 readonly id=input.required<string>();private readonly api=inject(CentralApiService);private consulta?:Subscription;
 readonly dados=signal<ConsumoInstancia|null>(null);readonly erro=signal('');readonly carregando=signal(false);
 readonly tons:Record<string,string>={DISPONIVEL:'bo-ok',ATINGIDO:'bo-warn',ATENCAO:'bo-warn',EXCEDIDO:'bo-bad',INVENTARIO_PENDENTE:'bo-warn',SEM_LIMITE_CONFIGURADO:'bo-mute'};
 readonly rotulos:Record<string,string>={DISPONIVEL:'Disponível',ATINGIDO:'Atingido',ATENCAO:'Atenção',EXCEDIDO:'Excedido',INVENTARIO_PENDENTE:'Inventário pendente',SEM_LIMITE_CONFIGURADO:'Sem limite configurado'};
 readonly historico=signal<{dia:string;consumo:ConsumoInstancia['consumo']}[]>([]);readonly erroHistorico=signal('');readonly carregandoHistorico=signal(false);readonly historicoConsultado=signal(false);private historicoCarga?:Subscription;
 buscarHistorico(){this.historicoCarga?.unsubscribe();this.erroHistorico.set('');this.carregandoHistorico.set(true);this.historicoCarga=this.api.historicoConsumo(this.id()).subscribe({next:r=>{this.historico.set(r);this.carregandoHistorico.set(false);this.historicoConsultado.set(true);},error:e=>{this.historico.set([]);this.carregandoHistorico.set(false);this.erroHistorico.set(mensagemApi(e,'Histórico indisponível.'));}});}
 ngOnChanges(){this.historicoCarga?.unsubscribe();this.historico.set([]);this.erroHistorico.set('');this.historicoConsultado.set(false);this.carregandoHistorico.set(false);this.carregar();}
 carregar(){this.consulta?.unsubscribe();this.dados.set(null);this.erro.set('');this.carregando.set(true);this.consulta=this.api.consumoInstancia(this.id()).subscribe({next:d=>{this.dados.set(d);this.carregando.set(false);},error:e=>{this.carregando.set(false);this.erro.set(mensagemApi(e,'Consumo indisponível. Tente novamente.'));}});}
 quantidade(valor:number|null,unidade:string){return valor===null?'—':unidade==='bytes'?`${(valor/1048576).toLocaleString('pt-BR',{maximumFractionDigits:2})} MB`:valor.toLocaleString('pt-BR');}
 ngOnDestroy(){this.consulta?.unsubscribe();this.historicoCarga?.unsubscribe();}
}
