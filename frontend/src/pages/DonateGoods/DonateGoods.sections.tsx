import { scrollToId } from "@/shared/lib/scroll";
import { Check, X } from "@/shared/ui/InlineIcons";
import { ImageWithFallback } from "@/shared/ui/ImageWithFallback";
import {
  ActionButton,
  PublicPageSection,
  PublicSectionIntro,
} from "@/shared/ui/PublicPagePatterns";
import styles from "./DonateGoods.module.css";

type DonateGoodsFeatureCardContent = {
  title: string;
  description: string;
  image?: string;
};

const HERO_BENEFITS = [
  "Localize pontos de coleta por CEP ou bairro",
  "Cadastre seus excedentes de alimentos de forma rápida",
  "Entrega ou coleta combinada diretamente com a equipe local",
];

const STEP_FEATURES: DonateGoodsFeatureCardContent[] = [
  {
    title: "1. Escolha um ponto de coleta",
    description: "Pesquise por CEP para encontrar os pontos do Colhe+ em São José dos Campos.",
  },
  {
    title: "2. Cadastre os alimentos",
    description: "Descreva o que deseja doar, o estado de conservação, a quantidade e a data preferencial.",
  },
  {
    title: "3. Confirmação da equipe",
    description: "O responsável pelo ponto de coleta recebe o pedido, valida o código e organiza a recepção.",
  },
  {
    title: "4. Entrega e redistribuição",
    description: "Você entrega a doação, que é conferida, pesada e destinada a famílias em vulnerabilidade.",
  },
];

const FEATURE_STORIES: DonateGoodsFeatureCardContent[] = [
  {
    title: "Destinação direta e transparente",
    description:
      "Cada doação é vinculada ao ponto de coleta selecionado. O responsável visualiza tudo no painel e acompanha cada etapa com transparência.",
    image:
      "https://images.unsplash.com/photo-1765744893064-dce3184289ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXJlaG91c2UlMjBib3hlcyUyMG9yZ2FuaXplZHxlbnwxfHx8fDE3NzQ5MzU0OTV8MA&ixlib=rb-4.1.0&q=80&w=1080",
  },
  {
    title: "Segurança alimentar e controle",
    description:
      "Alimentos recebidos são triados, registrados por lote e validade, compondo pacotes equilibrados para entidades sociais e comunidades parceiras.",
    image:
      "https://images.unsplash.com/photo-1617080090911-91409e3496ad?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBzdXBwb3J0JTIwaGFuZHN8ZW58MXx8fHwxNzc0OTM1NDk1fDA&ixlib=rb-4.1.0&q=80&w=1080",
  },
];

const ACCEPTED_ITEMS = [
  {
    category: "Alimentos Não Perecíveis",
    items: [
      "Proteínas e enlatados: atum, sardinha, frango, milho e ervilha",
      "Legumes em conserva: seleta de legumes, palmito e molhos",
      "Grãos e cereais: arroz, feijão, lentilha, aveia e fubá",
      "Massas e farinhas: macarrão, farinha de trigo e mandioca",
      "Itens matinais: leite UHT, café, chá e achocolatado",
    ],
  },
  {
    category: "Hortifrúti e Excedentes",
    items: [
      "Frutas da estação: banana, maçã, laranja e mamão",
      "Legumes e tubérculos: batata, cenoura, mandioca e abóbora",
      "Hortaliças frescas: alface, couve, repolho e temperos",
      "Excedentes de feirantes e produtores rurais locais",
      "Alimentos próprios para consumo imediato",
    ],
  },
  {
    category: "Higiene e Limpeza Essencial",
    items: [
      "Higiene pessoal: sabonete, xampu, creme dental e escovas",
      "Cuidados íntimos: absorventes higiênicos femininos",
      "Cuidados com bebês: fraldas descartáveis e lenços umedecidos",
      "Produtos de limpeza: detergente, sabão em pó e água sanitária",
      "Descartáveis e embalagens: sacos de lixo e papel higiênico",
    ],
  },
];

const REJECTED_ITEMS = [
  "Alimentos preparados artesanalmente sem procedência e data",
  "Embalagens violadas, rasgadas ou abertas",
  "Latas estufadas, enferrujadas ou muito amassadas",
  "Produtos com prazo de validade expirado",
  "Alimentos congelados ou perecíveis fora da refrigeração necessária",
  "Embalagens de vidro quebradas ou trincadas",
];

function FeatureCard({
  title,
  description,
  image,
}: DonateGoodsFeatureCardContent) {
  if (image) {
    return (
      <article className={styles.featureImageCard}>
        <ImageWithFallback
          src={image}
          alt={title}
          className={styles.featureImage}
        />
        <div className={styles.featureImageOverlay}>
          <div className={styles.featureImageContent}>
            <h3 className={styles.featureImageTitle}>{title}</h3>
            <p className={styles.featureImageText}>{description}</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.featureCard}>
      <h3 className={styles.featureCardTitle}>{title}</h3>
      <p className={styles.featureCardText}>{description}</p>
    </article>
  );
}

export function DonateGoodsHeroSection() {
  return (
    <PublicPageSection id="home" width="page" innerClassName={styles.heroInner}>
      <PublicSectionIntro
        title="Doe alimentos para um ponto de coleta"
        description="Pesquise o ponto de coleta mais próximo por CEP, cadastre a lista de alimentos, a quantidade e a data preferencial para entrega ou retirada."
        descriptionExtraLine="Sua doação fica registrada e gera um código de identificação para conferência pelo responsável do local."
        titleAs="h1"
        size="hero"
        className={styles.heroIntro}
      >
        <div className={styles.heroBenefits}>
          {HERO_BENEFITS.map((benefit) => (
            <div key={benefit} className={styles.heroBenefit}>
              <Check className={styles.checkIcon} strokeWidth={3} />
              <span className={styles.heroBenefitText}>{benefit}</span>
            </div>
          ))}
        </div>
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1738618141234-1ee52c6475a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb29kJTIwYmFuayUyMHNoZWx2ZXMlMjBjYW5uZWQlMjBnb29kc3xlbnwxfHx8fDE3NzQ5Mzc1MDZ8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Prateleiras organizadas de doações do Colhe+"
          className={styles.heroImage}
        />
        <ActionButton
          onClick={() => scrollToId("donate")}
          className={styles.heroCta}
        >
          Doar Alimentos Agora
        </ActionButton>
      </PublicSectionIntro>
    </PublicPageSection>
  );
}

export function DonateGoodsHowItWorksSection() {
  return (
    <PublicPageSection tone="muted" width="page">
      <PublicSectionIntro
        title="Como funciona a doação"
        description="Um processo seguro e rastreado para que sua ajuda chegue com agilidade a quem mais necessita."
        className={styles.sectionHeader}
      />
      <div className={styles.featureGrid}>
        {STEP_FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
      <div className={styles.featureStoryGrid}>
        {FEATURE_STORIES.map((story) => (
          <FeatureCard
            key={story.title}
            title={story.title}
            description={story.description}
            image={story.image}
          />
        ))}
      </div>
    </PublicPageSection>
  );
}

export function DonateGoodsAcceptedItemsSection() {
  return (
    <PublicPageSection tone="muted" width="page">
      <PublicSectionIntro
        title="O que podemos receber"
        description="Todos os alimentos devem estar dentro da validade, com embalagem íntegra e próprios para consumo."
        className={styles.sectionHeader}
      />
      <div className={styles.acceptedGrid}>
        {ACCEPTED_ITEMS.map((group) => (
          <article key={group.category} className={styles.acceptedCard}>
            <h3 className={styles.acceptedCardTitle}>{group.category}</h3>
            <ul className={styles.acceptedList}>
              {group.items.map((item) => (
                <li key={item} className={styles.acceptedListItem}>
                  <Check className={styles.acceptedListIcon} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className={styles.noticeCardPrimary}>
        <Check className={styles.noticeIconSuccess} />
        <div>
          <p className={styles.noticeText}>
            <strong>Atenção:</strong> Todos os alimentos industrializados devem estar lacrados, na embalagem original e dentro do prazo de validade.
          </p>
        </div>
      </div>
      <div className={styles.noticeCardNeutral}>
        <X className={styles.noticeIconDanger} />
        <div>
          <p className={styles.noticeTitle}>
            <strong>Não podemos aceitar:</strong>
          </p>
          <ul className={styles.rejectedList}>
            {REJECTED_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </PublicPageSection>
  );
}

export { DonateGoodsFlowSection } from "./DonateGoods.flow";
