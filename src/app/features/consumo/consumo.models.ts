export interface ItemConsumo {codigo:string;nome:string;usado:number;limite:number|null;disponivel:number|null;estado:string;unidade:string;pendentes:number;competencia:string|null;}
export interface ConsumoInstancia {contratacaoId:string;consumo:{planoNome:string|null;versaoDireitos:number|null;direitosConfirmadosEm:string|null;consultadoEm:string;itens:ItemConsumo[]};funcionalidades:string[];}
