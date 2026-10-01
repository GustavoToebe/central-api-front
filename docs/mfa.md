# Autenticação em duas etapas

Meu perfil inclui a configuração do autenticador para o próprio operador.
Preparar exige senha e não ativa proteção. A chave é cadastrada manualmente em
aplicativo TOTP: Central, SHA-1, seis dígitos, 30 segundos. Confirmar em dez minutos.
Depois da confirmação, guardar os dez códigos de recuperação, marcar a confirmação
de guarda e concluir. Eles não podem ser reexibidos pelo painel.

Ativar/desativar encerra todas as sessões; entrar novamente. Aguardar o próximo
código do autenticador após ativar. Login protegido pede segundo fator somente
depois da recusa `MFA_NECESSARIO` da API, sem criar sessão com senha apenas.
Recuperação de 32 caracteres funciona uma vez e exige a senha. A proteção
continua ativa após entrar com recuperação; para desativar, outro código é exigido.

Senha, chave de configuração e códigos ficam apenas na memória da tela e são
limpos ao concluir/destruir, inclusive se a resposta chegar depois da destruição.
Nunca enviar a chave a gerador externo de QR code. Erros explícitos de confirmação
MFA não disparam refresh nem repetição automática pelo interceptor. Falha ao
carregar estado não é exibida como proteção inativa.

Contrato, variáveis de cifra, migration e limitações: `central-api-back/docs/mfa-operadores.md`
no repositório irmão. Sem chave configurada, a tela informa a indisponibilidade.
Sem chave/códigos guardados, recuperação assistida ainda exige procedimento
administrativo. MFA de usuários do Servirea não faz parte desta implementação.
