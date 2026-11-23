import type {
  DonorQuote,
  GallerySlide,
  GivingMode,
  InfoCardCopy,
  ModeCopy,
} from './model'

export const presetAmounts = [20, 50, 100, 200]
export const gbp = 'R$'

export const copyByMode: Record<GivingMode, ModeCopy> = {
  monthly: {
    heading: 'Apoio Mensal Recorrente',
    subtext: 'Você está configurando uma contribuição mensal para manter a rede ativa. Todos os campos são obrigatórios.',
    submitLabel: 'Confirmar Apoio Mensal',
  },
  one_time: {
    heading: 'Doação Financeira Avulsa',
    subtext: 'Você está realizando uma contribuição pontual para o Colhe+. Todos os campos são obrigatórios.',
    submitLabel: 'Confirmar Doação Avulsa',
  },
}

export const heroChecks = [
  'Contribuição pontual ou recorrente mensal',
  'Opcional: direcione para um ponto de coleta específico',
  'Comprovante por e-mail e identificador da transação',
]

export const helpCards: InfoCardCopy[] = [
  {
    title: 'Manutenção da rede e logística',
    description: 'Os recursos auxiliam no transporte, combustível, caixas térmicas e triagem para manter os pontos de coleta operando.',
  },
  {
    title: 'Repasse para pontos de coleta',
    description: 'Escolha um ponto de coleta específico ou deixe como padrão para a coordenação geral do Colhe+ destinar onde for mais urgente.',
  },
  {
    title: 'Transparência no painel público',
    description: 'Toda contribuição confirmada é refletida nos totais públicos de impacto e na prestação de contas da plataforma.',
  },
]

export const galleryCards: GallerySlide[] = [
  {
    image:
      'https://images.unsplash.com/photo-1593113630400-ea4288922497?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHZvbHVudGVlcnMlMjBkaXN0cmlidXRpbmd8ZW58MXx8fHwxNzc0OTI4OTU3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Voluntários distribuindo alimentos na comunidade',
    title: 'Distribuição Comunitária',
  },
  {
    image:
      'https://images.unsplash.com/photo-1584614207146-a64524f5806a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBoZWxwaW5nJTIwZ3JvY2VyaWVzfGVufDF8fHx8MTc3NDkyODk1OHww&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Comunidade colaborando na arrecadação',
    title: 'Coleta de Alimentos',
  },
  {
    image:
      'https://images.unsplash.com/photo-1648090229186-6188eaefcc6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHZlZ2V0YWJsZXMlMjBmb29kJTIwZG9uYXRpb258ZW58MXx8fHwxNzc0OTI4OTU4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    alt: 'Legumes e hortaliças frescas para doação',
    title: 'Alimentos Frescos',
  },
]

export const donorQuotes: DonorQuote[] = []
