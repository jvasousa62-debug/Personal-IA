# TODO — IRONFIT UX/IA Upgrade

## Ordem aprovada
1. Gamificação leve (HUD + XP persistente)
2. Onboarding inteligente (fluxo de steps + persistência)
3. Contrato e limites da IA (Edge Function + truncar histórico + render robusto)
4. Ajustes finais de animações sutis
5. Polimento de responsividade (chat/teclado/modais)

## Passos detalhados
### 1) Gamificação leve
- [ ] Definir esquema de XP (ações) e persistência em localStorage
- [ ] Criar HUD no chat (nível + XP + progresso da próxima badge)
- [ ] Integrar XP nas ações: enviar mensagem, completar onboarding, salvar treino, check-in
- [ ] Ajustar CSS do HUD com animação sutil

### 2) Onboarding inteligente
- [ ] Implementar estado do onboarding (step atual) em localStorage
- [ ] Transformar chips em ações de step (objetivo/nivel/tempo/equipamentos)
- [ ] Enviar mensagem contextual padronizada no avanço do step
- [ ] Quando concluir, ocultar onboarding e liberar input livre

### 3) Contrato e limites da IA
- [ ] No backend: reforçar saída com formato rígido (seções fixas) e reduzir “respostas absurdas”
- [ ] Truncar histórico enviado para o Edge Function
- [ ] No frontend: sanitizar/renderizar com regras mais seguras

### 4) Animações sutis
- [ ] Reajustar animações para opacidade/transform (evitar filtros caros)
- [ ] Harmonizar com prefers-reduced-motion
- [ ] Pequenos ajustes nos estados de botões (pressed/thinking)

### 5) Responsividade
- [ ] Ajustes no chat para mobile keyboard (dvh/safe-area)
- [ ] Revisar modais (overflow no iPhone/Android)
- [ ] Testar breakpoints principais e remover conflitos

