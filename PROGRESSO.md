# Progresso da Transformação Colhe+

Projeto: **Colhe+** (Etep São José dos Campos)
Slogan: "Conectando alimentos e comunidades"

## Status dos Blocos

- [x] **Bloco 0: Identidade Visual e Componentes Base**
  - Configuração de tokens em `tokens.css` (cores `#1B4D2A`, `#2F7D32`, `#F67C01`, fontes Nunito/Poppins, raios e sombras).
  - Componente único `Logo` com variantes header e footer.
  - Favicon e título pt-BR ("Colhe+ | Conectando alimentos e comunidades").
  - Tradução e padronização de `PublicPageShell`, `PublicSiteFooter`, `LoginModal`, `AdminLayout`, `workspaceTabs`, `adminScope` e `nativeValidation`.
  - Menu mobile com botão hambúrguer responsivo (mínimo 44px).
  - Rodapé com fundo verde escuro do tema (`--color-brand-dark`), sem referências ao Reino Unido, endereço "São José dos Campos – SP".

- [x] **Bloco 1: Página Inicial (Home)**
  - Destaques do Colhe+: cadastrar doação, localizar pontos de coleta, acompanhar a doação até a destinação final (recebida → avaliada → organizada → encaminhada) e painel de impacto.
  - Tradução integral de todos os textos, categorias e chamadas para pt-BR.
  - Correção de legibilidade e contraste com sobreposição escura com gradiente nas imagens.
  - Valores dos planos de apoio financeiro em R$ (R$ 20, R$ 50, R$ 100).
  - Mapeamento pt-BR das métricas e notas de impacto em `usePublicImpactMetrics.ts`.

- [x] **Bloco 2: Localizar Pontos de Coleta (FindFoodBank)**
  - Tradução completa para pt-BR ("Pontos de Coleta", "Buscar por CEP").
  - Placeholder de CEP brasileiro ("Ex: 12245-000").
  - Mapa Leaflet centralizado em São José dos Campos – SP, com popups e legendas em português.
  - Listagem com botões táteis mínimos de 44px e estilo Colhe+.

- [x] **Bloco 3: Doar Alimentos (DonateGoods)**
  - Cadastro de doação por produtor, comerciante ou morador.
  - Formulário, seleção de ponto de coleta, geração de código de doação e acompanhamento da entrega.
  - Tradução completa para pt-BR, CEP brasileiro e estilo acolhedor Colhe+.

- [x] **Bloco 4: Doar Dinheiro / Apoiar Projeto (DonateCash)**
  - Exibição de valores em R$ (R$ 20, R$ 50, R$ 100, R$ 200).
  - Correção definitiva do corte de título no topo com espaçamento seguro sob o cabeçalho fixo e altura de linha ajustada.
  - Tradução integral para pt-BR e adaptação ao tom solidário do Colhe+.
  - Botões táteis acessíveis (mínimo 44px) e paleta verde/dourado da identidade visual.

- [ ] **Bloco 5: Pacotes de Alimentos (FoodPackages)**
  - Solicitação e acompanhamento da destinação e retirada de alimentos.
  - Tradução pt-BR e mensagens de status legíveis.

- [ ] **Bloco 6: Supermercado / Comércio Parceiro (Supermarket)**
  - Registro de excedentes comerciais em lote.
  - Tradução e adequação aos termos do Colhe+.

- [ ] **Bloco 7: Telas Admin (Gestão de Alimentos e Estatísticas/Impacto)**
  - Verificação de código de doação, triagem, avaliação e estoque.
  - Painel de impacto com gráficos Recharts traduzidos e formatados em pt-BR.

- [ ] **Bloco 8: Varredura de Textos em Inglês, Acessibilidade e Build Final**
  - Busca por termos remanescentes em inglês.
  - Validação de contrastes, tamanhos mínimos de botões (44px).
  - Execução única de `npm run build`.
