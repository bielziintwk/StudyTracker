# StudyTracker — Modo escuro global

Esta versão mantém as funcionalidades anteriores e adiciona modo escuro global.

- Ative/desative o modo escuro em Perfil.
- A escolha é salva no AsyncStorage e continua ao trocar de aba e reabrir o app.
- Início, Disciplinas, Calendário, Perfil, Histórico, Cadastro de estudo e detalhes de disciplina acompanham o mesmo tema.
- Barra de status do iPhone também acompanha o tema.
- Nenhuma biblioteca nova foi adicionada.

Após substituir os arquivos no projeto principal:

```bash
npx expo start --clear
```


### Perfil e conta
- Nome e e-mail do cadastro aparecem automaticamente no perfil.
- Perfil permite editar nome/e-mail e foto.
- Foto usa `expo-image-picker` e fica salva localmente.
- Há opção para sair da conta.
