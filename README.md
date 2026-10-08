STUDYTRACKER
Documentação do desenvolvimento
Do início do projeto até o estado atual
Projeto acadêmico — desenvolvimento individual

1. Visão geral do projeto
O StudyTracker é um aplicativo mobile criado com o objetivo de ajudar estudantes a organizar e acompanhar sua rotina de estudos. A proposta começou como um projeto acadêmico individual e foi sendo desenvolvida de forma incremental, partindo de uma ideia inicial simples até chegar a uma aplicação com cadastro, login, múltiplas contas, disciplinas, registro de estudos, histórico, calendário, perfil, metas, progresso e modo escuro.
2. Início do projeto e definição da proposta
No início, foi definido que o aplicativo seria simples o suficiente para ser desenvolvido individualmente, mas que também apresentasse quantidade suficiente de funcionalidades e componentes React Native para atender às exigências do professor.
Nome escolhido: StudyTracker.
Objetivo principal: organizar estudos e acompanhar o tempo dedicado a cada disciplina.
Plataforma planejada: Android.
Tecnologia principal: React Native com Expo.
Linguagem: JavaScript.
Armazenamento inicial planejado: AsyncStorage.
Navegação: React Navigation.
Desenvolvimento incremental, devido ao projeto ser individual e ao nível inicial de conhecimento em React Native.
3. Requisitos acadêmicos considerados
Durante a definição do projeto, foram considerados os requisitos solicitados pelo professor, principalmente a utilização de muitos componentes do React Native, documentação, requisitos funcionais e não funcionais, modelagem das entidades e relacionamentos, fluxo do sistema, cronograma, prototipação e entrega de um aplicativo funcional.
Utilização de todos ou quase todos os componentes trabalhados em React Native.
Definição de requisitos funcionais e não funcionais.
Modelagem de entidades e relacionamentos.
Representação do fluxo do aplicativo.
Protótipo das telas.
Desenvolvimento incremental.
Testes e correções.
Preparação de APK e apresentação final.
Organização do projeto e documentação.
4. Modelagem inicial das entidades
A modelagem definida para o projeto considerou principalmente as seguintes entidades:
Entidade	Principais atributos	Relacionamento
USUÁRIO	id, nome, e-mail	Um usuário possui várias disciplinas.
DISCIPLINA	id, nome, professor, descrição, usuário_id	Uma disciplina pertence a um usuário e possui várias sessões e lembretes.
SESSÃO DE ESTUDO	id, disciplina_id, data, duração, conteúdo	Pertence a uma disciplina.
LEMBRETE	id, disciplina_id, data, horário, descrição	Pertence a uma disciplina.
Observação: a implementação atual utiliza armazenamento local no aparelho, mas a modelagem foi pensada para representar a estrutura lógica dos dados do aplicativo.
5. Cronograma planejado
O cronograma inicial foi organizado em 14 etapas:
Semana 1 — Tema, objetivo, escopo e proposta.
Semana 2 — Requisitos funcionais e não funcionais.
Semana 3 — Entidades, relacionamentos e estrutura dos dados.
Semana 4 — Diagramas e fluxo do sistema.
Semana 5 — Fundamentos de JavaScript e React Native.
Semana 6 — Protótipo e telas iniciais.
Semana 7 — Disciplinas e navegação.
Semana 8 — Cadastro e histórico de estudos.
Semana 9 — Armazenamento local.
Semana 10 — Calendário, estatísticas e gráficos.
Semana 11 — Lembretes e modo escuro.
Semana 12 — Integração e componentes.
Semana 13 — Testes e correções.
Semana 14 — APK, documentação e apresentação.
6. Protótipo e identidade visual
Foi definida uma identidade visual simples e moderna para facilitar a utilização do aplicativo. O protótipo foi pensado no Figma e serviu como referência para a implementação das telas.
Cor principal: #4F46E5.
Cor secundária: #7C3AED.
Fundo claro: #F8FAFC.
Cards: #FFFFFF.
Texto principal: #1E293B.
Texto secundário: #64748B.
Verde de progresso: #22C55E.
Vermelho para ações de exclusão: #EF4444.
Foi priorizada uma interface limpa, com cards, botões arredondados e indicadores visuais.
7. Base técnica inicial
O projeto foi estruturado em Expo/React Native. Durante a configuração foram utilizados:
Expo SDK 57.
React 19.2.3.
React Native 0.86.3.
React Navigation.
AsyncStorage.
Expo Status Bar.
Expo Font.
@expo/vector-icons.
react-native-svg.
Expo Image Picker.
8. Principais etapas de implementação
A implementação foi realizada progressivamente. As principais etapas foram:
8.1. Estrutura inicial e navegação
Criação da estrutura do aplicativo StudyTracker.
Configuração do Expo.
Criação das principais telas.
Configuração do React Navigation.
Criação da navegação entre Início, Disciplinas, Calendário e Perfil.
Criação de telas secundárias para cadastro, histórico e detalhes.
8.2. Tela inicial / Dashboard
Criação do resumo dos estudos.
Exibição do total estudado.
Quantidade de disciplinas com registros.
Último estudo realizado.
Resumo semanal.
Indicador circular de progresso.
Meta diária de 4 horas no resumo de estudos do dia.
Nome do usuário carregado dinamicamente da conta.
8.3. Disciplinas
Cadastro de novas disciplinas.
Bloqueio de nomes duplicados.
Edição de disciplinas.
Alteração da meta de estudo.
Cálculo do progresso com base na meta personalizada.
Exibição das sessões relacionadas à disciplina.
Atualização do nome da disciplina nos registros quando a disciplina é renomeada.
8.4. Registro de estudos
Seleção da disciplina.
Informação da data.
Informação da duração.
Registro do conteúdo estudado.
Possibilidade de registrar estudos de datas anteriores.
Campo de data com preenchimento automático de barras.
Seletor de duração em horas e minutos.
Validação para impedir registros em datas futuras.
8.5. Histórico
Listagem das sessões registradas.
Filtro para estudos do dia.
Edição de registros.
Exclusão com confirmação.
Integração com o restante do aplicativo.
8.6. Calendário
Calendário próprio utilizando componentes React Native.
Navegação entre meses.
Indicação visual dos dias com estudos.
Seleção de um dia.
Resumo do dia selecionado.
Total de tempo estudado.
Percentual em relação à meta diária.
Quantidade de sessões.
Disciplinas estudadas no dia.
Acesso ao cadastro de estudo para a data selecionada.
Bloqueio correto de datas futuras.
8.7. Perfil
Exibição de nome, e-mail e avatar.
Estatísticas do usuário.
Quantidade de disciplinas.
Total de horas.
Quantidade de estudos.
Modo escuro.
Edição de nome e e-mail.
Seleção de foto pela galeria.
Remoção da foto.
Botão para sair da conta.
9. Sistema de contas
Uma das etapas mais importantes do desenvolvimento foi a evolução do sistema de usuário. Inicialmente o aplicativo armazenava uma única conta. Depois, foi identificado que ao cadastrar uma nova conta os dados da conta anterior eram substituídos. O sistema foi então alterado para suportar múltiplas contas.
Cadastro de várias contas no mesmo dispositivo.
Login por e-mail e senha.
Seleção da conta correta durante o login.
Perfil associado à conta logada.
Nome e e-mail carregados da conta atual.
Foto de perfil associada à conta.
Saída da conta.
Possibilidade de entrar em outra conta posteriormente.
10. Separação dos dados por usuário
Depois da implementação de múltiplas contas, foi identificado outro problema: os estudos cadastrados em uma conta apareciam em outra. A estrutura de armazenamento foi então alterada para separar os dados de cada usuário.
Disciplinas separadas por conta.
Sessões de estudo separadas por conta.
Histórico separado por conta.
Calendário separado por conta.
Progresso separado por conta.
Dados do perfil separados por conta.
Esse ajuste é importante porque garante que o aplicativo represente corretamente um ambiente com mais de um usuário no mesmo aparelho.
11. Modo escuro
Implementação de tema claro e escuro.
Preferência salva localmente.
Aplicação global nas principais telas.
Cores adaptadas para fundo, texto, cards, bordas e indicadores.
12. Navegação por gestos
Foi implementada navegação por deslize horizontal entre as principais abas. O objetivo foi deixar a utilização mais natural em dispositivos móveis.
Deslize para avançar entre as abas.
Deslize para voltar.
Animação ajustada para indicar a direção da navegação.
Controle da pilha de navegação para evitar histórico desnecessário.
13. Principais problemas encontrados e soluções
Problema	Solução
Erro do Metro/Babel durante a execução	Ajuste das dependências e instalação/configuração do babel-preset-expo.
react-native-svg não encontrado	Instalação da dependência compatível com Expo para o gráfico circular.
Calendário bloqueando datas de outros meses	Comparação corrigida para considerar dia, mês e ano completos.
Nome fixo na tela inicial	Nome passou a ser carregado da conta atualmente logada.
Nova conta substituía a conta antiga	Armazenamento alterado para permitir múltiplas contas.
Estudos de uma conta apareciam em outra	Dados passaram a ser associados à conta atual.
Login apresentando erro	Tela de login corrigida para utilizar corretamente os dados das contas.
Perfil não acompanhava corretamente a conta	Perfil passou a ser carregado conforme o usuário logado.
14. Requisitos funcionais principais
RF01 — Cadastrar usuário.
RF02 — Realizar login.
RF03 — Permitir múltiplas contas.
RF04 — Cadastrar e editar disciplinas.
RF05 — Definir metas por disciplina.
RF06 — Registrar sessões de estudo.
RF07 — Editar e excluir sessões.
RF08 — Consultar histórico.
RF09 — Visualizar progresso e tempo estudado.
RF10 — Consultar estudos pelo calendário.
RF11 — Editar perfil e foto.
RF12 — Sair da conta.
RF13 — Ativar modo escuro.
15. Requisitos não funcionais principais
RNF01 — Interface simples e fácil de utilizar.
RNF02 — Aplicação adaptada para dispositivos móveis.
RNF03 — Persistência dos dados localmente.
RNF04 — Identidade visual consistente.
RNF05 — Validação de entradas.
RNF06 — Funcionamento local sem necessidade de servidor nesta versão.
16. Componentes React Native utilizados
View
Text
TextInput
Button
Pressable
TouchableOpacity
ScrollView
FlatList
Image
Modal
Alert
Switch
ActivityIndicator
SafeAreaView
KeyboardAvoidingView
StatusBar
Animated
17. Estado atual do projeto
Atualmente o StudyTracker possui uma base funcional consideravelmente maior que a proposta inicial. O aplicativo já conta com autenticação local, múltiplas contas, separação dos dados por usuário, gerenciamento de disciplinas, metas, cadastro de estudos, histórico, calendário, dashboard, perfil editável, foto de perfil, modo escuro e navegação por gestos.
18. O que ainda precisa ser finalizado
Lembretes e notificações de estudo.
Revisão/finalização dos gráficos estatísticos, caso sejam exigidos na entrega.
Revisão da modelagem e dos diagramas para ficarem alinhados à implementação final.
Testes completos de todas as telas e fluxos.
Revisão dos componentes exigidos pelo professor e demonstração de seu uso.
Documentação final do projeto.
Organização do projeto no Git/GitHub.
Gerar e testar o APK final.
Preparar apresentação e demonstração do aplicativo.
19. Resumo para apresentação ao professor
O StudyTracker começou como uma proposta de aplicativo simples para controle de estudos. Ao longo do desenvolvimento, a aplicação foi ampliada para permitir o cadastro de usuários, login, múltiplas contas e isolamento dos dados de cada usuário. Foram implementadas disciplinas com metas, registro e histórico de estudos, calendário, acompanhamento de progresso, dashboard, perfil editável com foto, modo escuro e navegação por gestos. A aplicação utiliza React Native, Expo, React Navigation e AsyncStorage, com armazenamento local. As próximas etapas concentram-se em lembretes, testes, documentação final, Git/GitHub, APK e apresentação.
20. Observação sobre segurança
A autenticação atual foi criada para o protótipo acadêmico e utiliza armazenamento local. Ela não deve ser considerada uma autenticação de produção, pois não existe servidor remoto ou banco de dados externo para gerenciamento seguro das credenciais.
