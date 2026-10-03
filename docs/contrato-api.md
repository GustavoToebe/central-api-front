# Conferência do contrato da API — T17

`scripts/verificar-contrato-api.py` compara as chamadas HTTP do painel com `central-api-back/docs/contrato-api.json` (ou o arquivo indicado em `CONTRATO_API`). Rode depois de mexer em `CentralApiService` e depois de atualizar o contrato do back. Detalhes e limites: `docs/contrato-api.md` do back.

## Tipos gerados

`scripts/gerar-tipos-api.py` escreve `src/app/core/api/contrato-api.gerado.ts` (interfaces dos DTOs, enums e o mapa `ContratoRotas` por `"VERBO /caminho"`). Não edite o arquivo: mude o DTO no back, regenere o contrato lá e rode o script aqui; `--verificar` falha se estiver desatualizado.

`src/app/core/api/contrato-api.ts` traz `SemCamposInventados` e `Exigir`: um tipo escrito à mão que ganhe um campo que o back não tem deixa de compilar nos testes. O painel de instâncias já usa (`instancias-contrato.spec.ts`); os demais migram aos poucos. Campos anuláveis saem como `campo?: X | null`, então a checagem pega campo renomeado ou removido, não nulidade.
