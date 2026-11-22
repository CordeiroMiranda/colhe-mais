import { cn } from "@/shared/lib/cn";
import {
  ClipboardPenLine,
  HeartHandshake,
  MapPin,
  Search,
  Truck,
} from "lucide-react";
import type {
  PublicImpactMetricCard,
  PublicImpactMetricsStatus,
} from "@/shared/lib/usePublicImpactMetrics";
import { Check, ShieldCheck, TrendArrow } from "@/shared/ui/InlineIcons";
import {
  ActionButton,
  PublicBanner,
  PublicSectionIntro,
} from "@/shared/ui/PublicPagePatterns";
import styles from "./Home.module.css";

const workflowSteps = [
  {
    number: "01",
    title: "Cadastrar a doação",
    description:
      "Produtores, feirantes, comerciantes ou moradores cadastram seus alimentos excedentes e escolhem o ponto de coleta mais conveniente.",
    icon: ClipboardPenLine,
  },
  {
    number: "02",
    title: "Entrega e triagem",
    description:
      "O responsável pelo ponto de coleta recebe os alimentos, confere o código, avalia o estado de conservação e organiza os lotes.",
    icon: Search,
  },
  {
    number: "03",
    title: "Destinação transparente",
    description:
      "Os alimentos são organizados em pacotes e distribuídos a instituições sociais e famílias em vulnerabilidade em São José dos Campos.",
    icon: HeartHandshake,
  },
] as const;

const goodsCategories = [
  {
    title: "Alimentos Não Perecíveis",
    items: [
      "Arroz, feijão e grãos diversos",
      "Macarrão, farinhas e cereais",
      "Leite UHT e bebidas vegetais",
      "Óleo de cozinha e molhos prontos",
      "Legumes e frutas em conserva",
      "Café, chá e sucos integrais",
    ],
  },
  {
    title: "Hortifrúti e Excedentes",
    items: [
      "Frutas frescas da estação",
      "Legumes, batatas e raízes",
      "Verduras e hortaliças higienizadas",
      "Excedentes de colheita e feiras livres",
      "Lotes próximos à maturação",
      "Alimentos próprios para consumo imediato",
    ],
  },
  {
    title: "Higiene e Cuidados",
    items: [
      "Sabonete e xampu",
      "Creme dental e escovas de dente",
      "Absorventes e itens de higiene feminina",
      "Fraldas infantis e lenços umedecidos",
      "Fórmulas e mingaus infantis",
      "Desodorantes e sabão neutro",
    ],
  },
  {
    title: "Limpeza e Despensa",
    items: [
      "Detergente e sabão em barra",
      "Desinfetante e água sanitária",
      "Papel higiênico e papel toalha",
      "Sacos para lixo e caixas de transporte",
      "Luvas e esponjas de limpeza",
      "Embalagens para conservação de alimentos",
    ],
  },
] as const;

const goodsBannerBenefits = [
  "Localize pontos de coleta em São José dos Campos",
  "Cadastre os excedentes e gere seu código de entrega",
  "Triagem ágil e pesagem no ato do recebimento",
  "Acompanhamento transparente até a mesa de quem precisa",
] as const;

const uniqueCards = [
  {
    title: "1. Doação Recebida",
    description:
      "Geração de código de verificação para que o doador acompanhe a entrega com segurança e rastreabilidade total.",
    image: "/home-gallery/photo-1701914446310-8b63a547ab37",
  },
  {
    title: "2. Avaliação e Triagem",
    description:
      "O responsável pelo ponto de coleta avalia a qualidade e registra peso e validade para garantir a segurança alimentar.",
    image: "/home-gallery/photo-1603418735094-800d47a56ea1",
  },
  {
    title: "3. Organização de Estoque",
    description:
      "Alimentos organizados por categorias e lotes para distribuição eficiente, sem desperdício e com rotatividade adequada.",
    image: "/home-gallery/photo-1588822534638-028d5ddc07ac",
  },
  {
    title: "4. Encaminhamento Solidário",
    description:
      "Montagem de pacotes equilibrados destinados a instituições sociais parceiras e pessoas cadastradas na região.",
    image: "/home-gallery/photo-1758599668178-d9716bbda9d5",
  },
] as const;

type HomeDonationTier = {
  amount: string;
  description: string;
  cta: string;
  href: string;
  features: string[];
  featured?: boolean;
};

const donationTiers: HomeDonationTier[] = [
  {
    amount: "R$ 20",
    description: "Ajuda a custear embalagens ecológicas e insumos para higienização e triagem dos alimentos.",
    cta: "Apoiar com R$ 20 / mês",
    href: "/donate/cash?type=monthly&amount=20#donate-form",
    features: [
      "Recibo por e-mail com identificação da contribuição",
      "Assinatura mensal com cancelamento a qualquer momento",
      "Recursos direcionados à manutenção dos pontos de coleta",
      "Contribui com as metas públicas de impacto social",
    ],
  },
  {
    amount: "R$ 50",
    description: "Viabiliza a triagem, pesagem e logística de pacotes completos para famílias atendidas.",
    cta: "Apoiar com R$ 50 / mês",
    href: "/donate/cash?type=monthly&amount=50#donate-form",
    features: [
      "Recibo por e-mail com identificação da contribuição",
      "Assinatura mensal com cancelamento a qualquer momento",
      "Recursos direcionados à manutenção dos pontos de coleta",
      "Contribui com as metas públicas de impacto social",
    ],
    featured: true,
  },
  {
    amount: "R$ 100",
    description: "Fortalece a infraestrutura regional dos pontos de coleta em São José dos Campos.",
    cta: "Apoiar com R$ 100 / mês",
    href: "/donate/cash?type=monthly&amount=100#donate-form",
    features: [
      "Recibo por e-mail com identificação da contribuição",
      "Assinatura mensal com cancelamento a qualquer momento",
      "Recursos direcionados à manutenção dos pontos de coleta",
      "Contribui com as metas públicas de impacto social",
    ],
  },
];

const trustItems = [
  "Identificação de contribuição emitida",
  "Confirmação por e-mail",
  "Transparência total dos recursos",
] as const;

type HomeNavigationProps = { goTo: (path: string) => void };
type HomeScrollProps = { goToSection: (id: string) => void };
type HomeHeroProps = HomeNavigationProps & HomeScrollProps;
type HomeImpactSectionProps = {
  impactMetrics: PublicImpactMetricCard[];
  status: PublicImpactMetricsStatus;
};

const impactLoadingCardCount = 4;

function BannerCheckIcon() {
  return (
    <span className={styles.bannerCheckWrap}>
      <Check className={styles.bannerCheckIcon} size={16} strokeWidth={2} />
    </span>
  );
}

function StepCard({
  number,
  title,
  description,
  icon: Icon,
}: (typeof workflowSteps)[number]) {
  return (
    <div className={styles.stepCard}>
      <div className={styles.stepIconWrap}>
        <div className={styles.stepIconShell}>
          <div className={styles.stepIconCircle}>
            <Icon className={styles.stepIcon} aria-hidden="true" />
          </div>
          <div className={styles.stepNumberBadge}>
            <span className={styles.stepNumber}>{number}</span>
          </div>
        </div>
      </div>
      <h3 className={styles.stepTitle}>{title}</h3>
      <p className={styles.stepDescription}>{description}</p>
    </div>
  );
}

export function HomeHero({
  goTo,
  goToSection,
}: HomeHeroProps) {
  const actions = [
    {
      label: "Cadastrar Doação de Alimentos",
      onClick: () => goTo("/donate/goods"),
      tone: "primary" as const,
    },
    {
      label: "Localizar Pontos de Coleta",
      onClick: () => goTo("/find-foodbank"),
      tone: "outline" as const,
    },
    {
      label: "Apoiar o Projeto",
      onClick: () => goToSection("donate-cash"),
      tone: "outline" as const,
    },
    {
      label: "Painel de Impacto",
      onClick: () => goToSection("impact"),
      tone: "outline" as const,
    },
  ];

  return (
    <div className={styles.heroSection}>
      <div className={cn(styles.pageSection, styles.heroInner)}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.heroBadge}>
              <span>Projeto Solidário Etep • São José dos Campos</span>
            </div>
            <PublicSectionIntro
              title="Conectando Alimentos e Comunidades"
              description="Conectamos produtores rurais, comerciantes e moradores com excedentes de alimentos a pontos de coleta em São José dos Campos, garantindo refeições dignas e combatendo o desperdício."
              titleAs="h1"
              size="hero"
              align="left"
              className={styles.heroIntro}
            >
              <div className={styles.actions}>
                {actions.map((action, index) => (
                  <ActionButton
                    key={action.label}
                    onClick={action.onClick}
                    tone={action.tone}
                    className={cn(
                      styles.heroActionButton,
                      index === 0 && styles.heroActionWide,
                    )}
                  >
                    {action.label}
                  </ActionButton>
                ))}
              </div>
            </PublicSectionIntro>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroImageCard}>
              <div className={styles.heroImageWrap}>
                <img
                  src="/home-gallery/photo-1710092784814-4a6f158913b8"
                  alt="Ações solidárias de arrecadação do Colhe+"
                  className={styles.heroImage}
                />
                <div className={styles.heroImageOverlay}>
                  <p className={styles.heroImageCaption}>
                    Mais de centenas de famílias atendidas com alimentos frescos e de qualidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeImpactSection({
  impactMetrics,
  status,
}: HomeImpactSectionProps) {
  const hasImpactMetrics = impactMetrics.length > 0;
  const isLoadingWithoutMetrics = status === "loading" && !hasImpactMetrics;
  const isUnavailable = status === "error" && !hasImpactMetrics;

  const footnote =
    status === "error"
      ? hasImpactMetrics
        ? "Exibindo os dados consolidados mais recentes enquanto a conexão é restabelecida."
        : "Relatório de impacto temporariamente indisponível."
      : status === "loading"
        ? hasImpactMetrics
          ? "Atualizando indicadores em tempo real..."
          : "Carregando indicadores de impacto..."
        : "Dados atualizados automaticamente conforme novas doações são recebidas e distribuídas.";

  return (
    <div id="impact" className={styles.impactSection}>
      <div className={cn(styles.pageSection, styles.impactInner)}>
        <PublicSectionIntro
          title="Painel de Impacto Social"
          description="Transparência total sobre os alimentos arrecadados e o alcance das ações na comunidade de São José dos Campos."
          className={styles.sectionHeading}
        />
        <div className={styles.impactGrid}>
          {isLoadingWithoutMetrics
            ? Array.from({ length: impactLoadingCardCount }, (_, index) => (
                <div
                  key={`impact-loading-${index}`}
                  className={cn(styles.impactCard, styles.impactCardLoading)}
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      styles.impactSkeleton,
                      styles.impactSkeletonTrend,
                    )}
                  />
                  <span
                    className={cn(
                      styles.impactSkeleton,
                      styles.impactSkeletonValue,
                    )}
                  />
                  <span
                    className={cn(
                      styles.impactSkeleton,
                      styles.impactSkeletonLabel,
                    )}
                  />
                  <span
                    className={cn(
                      styles.impactSkeleton,
                      styles.impactSkeletonNote,
                    )}
                  />
                </div>
              ))
            : hasImpactMetrics
              ? impactMetrics.map((metric) => (
                  <div key={metric.label} className={styles.impactCard}>
                    <div
                      className={cn(
                        styles.impactTrend,
                        metric.positive === false
                          ? styles.impactTrendNegative
                          : styles.impactTrendPositive,
                      )}
                    >
                      <TrendArrow
                        positive={metric.positive}
                        className={styles.trendIcon}
                      />
                      {metric.change}
                    </div>
                    <div className={styles.impactValue}>{metric.value}</div>
                    <div className={styles.impactLabel}>{metric.label}</div>
                    <div className={styles.impactNote}>{metric.note}</div>
                  </div>
                ))
              : (
                <div className={cn(styles.impactCard, styles.impactStateCard)}>
                  <div className={styles.impactLabel}>
                    Indicadores em consolidação
                  </div>
                  <div className={styles.impactNote}>
                    Não foi possível carregar os números em tempo real no momento.
                  </div>
                  {isUnavailable ? (
                    <div className={styles.impactFootnoteInline}>
                      Por favor, tente novamente em alguns instantes.
                    </div>
                  ) : null}
                </div>
              )}
        </div>
        <div className={styles.impactFootnote}>{footnote}</div>
      </div>
    </div>
  );
}

export function HomeWorkflowSection() {
  return (
    <div id="how-it-works" className={styles.workflowSection}>
      <div className={cn(styles.pageSection, styles.workflowInner)}>
        <PublicSectionIntro
          title="Como Funciona o Colhe+"
          description="Um fluxo simples, seguro e transparente para conectar a solidariedade a quem mais precisa."
          className={styles.sectionHeading}
        />
        <div className={styles.workflowWrap}>
          <div className={styles.workflowLine}>
            <div className={styles.workflowLineGlow} />
          </div>
          <div className={styles.workflowGrid}>
            {workflowSteps.map((step) => (
              <StepCard key={step.number} {...step} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeAboutSection() {
  return (
    <div id="about" className={styles.aboutSection}>
      <div className={cn(styles.pageSection, styles.aboutInner)}>
        <PublicSectionIntro
          title="Transparência do Início ao Fim"
          description="Acompanhe a trajetória de cada doação: desde a chegada ao ponto de coleta até a entrega aos beneficiários."
          className={styles.sectionHeading}
        />
        <div className={styles.aboutGrid}>
          {uniqueCards.map((card) => (
            <div key={card.title} className={styles.aboutCard}>
              <div className={styles.aboutImageCard}>
                <div className={styles.aboutImageWrap}>
                  <img
                    src={card.image}
                    alt={card.title}
                    className={styles.aboutImage}
                  />
                </div>
              </div>
              <h3 className={styles.aboutCardTitle}>{card.title}</h3>
              <p className={styles.aboutCardDescription}>{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DonateGoodsSection({
  goTo,
}: HomeNavigationProps) {
  return (
    <div id="donate-goods" className={styles.goodsSection}>
      <div className={cn(styles.pageSection, styles.goodsInner)}>
        <PublicSectionIntro
          title="O Que Você Pode Doar?"
          description="Aceitamos desde excedentes de hortifrúti de produtores rurais até alimentos não perecíveis e itens básicos de higiene."
          className={styles.sectionHeading}
        />
        <div className={styles.goodsGrid}>
          {goodsCategories.map((category) => (
            <div key={category.title} className={styles.goodsCard}>
              <h3 className={styles.goodsCardTitle}>{category.title}</h3>
              <ul className={styles.goodsList}>
                {category.items.map((item) => (
                  <li key={item} className={styles.goodsListItem}>
                    <span className={styles.goodsListIcon} aria-hidden="true">
                      <Check
                        className={styles.checkIcon}
                        size={16}
                        strokeWidth={2}
                      />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <PublicBanner
          tone="warning"
          split
          className={styles.goodsBanner}
          title="Doe Diretamente a um Ponto de Coleta"
          actions={
            <ActionButton
              onClick={() => goTo("/donate/goods")}
              className={styles.goodsBannerButton}
            >
              Cadastrar Doação de Alimentos
            </ActionButton>
          }
        >
          <div className={styles.goodsBenefitsGrid}>
            {goodsBannerBenefits.map((benefit) => (
              <div key={benefit} className={styles.goodsBenefit}>
                <BannerCheckIcon />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </PublicBanner>
      </div>
    </div>
  );
}

export function DonateCashSection({
  goTo,
}: HomeNavigationProps) {
  return (
    <div id="donate-cash" className={styles.cashSection}>
      <div className={cn(styles.pageSection, styles.cashInner)}>
        <PublicSectionIntro
          title="Apoie Financeiramente o Projeto"
          description="Sua contribuição solidária ajuda a manter a logística, os pontos de coleta e a montagem dos pacotes para quem mais precisa."
          className={styles.sectionHeading}
        />
        <div className={styles.tierGrid}>
          {donationTiers.map((tier) => (
            <div
              key={tier.amount}
              className={cn(
                styles.tierCard,
                tier.featured && styles.tierCardFeatured,
              )}
            >
              {tier.featured ? (
                <div className={styles.tierBadgeWrap}>
                  <span className={styles.tierBadge}>Mais Escolhido</span>
                </div>
              ) : null}
              <div className={styles.tierAmount}>
                {tier.amount}
                <span className={styles.tierPeriod}>/ mês</span>
              </div>
              <div className={styles.tierDescription}>{tier.description}</div>
              <ActionButton
                onClick={() => goTo(tier.href)}
                tone={tier.featured ? "primary" : "outline"}
                className={styles.tierButton}
                fullWidth
              >
                {tier.cta}
              </ActionButton>
              <ul className={styles.tierFeatures}>
                {tier.features.map((feature) => (
                  <li key={feature} className={styles.tierFeature}>
                    <span className={styles.tierFeatureIcon} aria-hidden="true">
                      <Check
                        className={styles.checkIcon}
                        size={16}
                        strokeWidth={2}
                      />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className={styles.oneTimeCard}>
          <div className={styles.oneTimeRow}>
            <div className={styles.oneTimeContent}>
              <p className={styles.oneTimeTitle}>Prefere fazer uma contribuição única?</p>
              <p className={styles.oneTimeDescription}>
                Você também pode fazer uma doação avulsa de qualquer valor para apoiar as ações do Colhe+.
              </p>
            </div>
            <ActionButton
              onClick={() =>
                goTo("/donate/cash?type=onetime#donate-form")
              }
              tone="dark"
              className={styles.oneTimeButton}
            >
              Fazer Doação Única
            </ActionButton>
          </div>
        </div>
        <div className={styles.trustRow}>
          {trustItems.map((item) => (
            <div key={item} className={styles.trustItem}>
              <ShieldCheck className={styles.shieldIcon} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
