# TODO (BlackboxAI) — Correção de Erros

## Status
- [x] Diagnosticar erro de chat (Failed to fetch em sendMessage)
- [x] Diagnosticar erro de GIF 404 (/gifs/*.gif1)
- [ ] Corrigir origem do erro no client e/ou nas funções edge
- [ ] Validar com `supabase functions deploy` e teste via DevTools

## Próximos Passos (alta prioridade)
- [x] Garantir que GIF handling não tente carregar arquivos inexistentes `.gif1` (modo silencioso)
- [ ] Validar que o chat-ai funciona (evitar Failed to fetch)
- [ ] Garantir que `chat-ai` retorne JSON compatível (reply)


## Checklist de validação
- [ ] Teste chat: envio de mensagem gera reply (sem fallback)
- [ ] Teste GIF: ao abrir exercício, carrega via `get-exercise-gif` ou mostra fallback sem 404 ruidoso

