import PublicPageShell from "@/shared/ui/PublicPageShell";
import { useFoodPackagesPageModel } from "./foodPackages.pageModel";
import {
  FoodPackagesEmptyState,
  FoodPackagesReadyState,
} from "./FoodPackages.sections";
import styles from "./FoodPackages.module.css";
export default function FoodPackages() {
  const model = useFoodPackagesPageModel();
  const { foodBank, isBootstrapping } = model;
  // 将初始引导阶段与"真正没有关联食物银行"的状态区分开来,
  // 使空状态文案能准确反映当前是加载中还是确实没有数据。
  if (isBootstrapping && !foodBank) {
    return (
      <PublicPageShell>
        <FoodPackagesEmptyState
          title="Carregando opções de apoio alimentar"
          message="Conectando esta página ao servidor e ao banco de dados."
        />
      </PublicPageShell>
    );
  }
  if (!foodBank) {
    return (
      <PublicPageShell>
        <FoodPackagesEmptyState
          title="Nenhum ponto de coleta conectado disponível"
          message="O servidor não retornou um ponto de coleta para solicitações online."
        />
      </PublicPageShell>
    );
  }
  return (
    <PublicPageShell mainClassName={styles.pageWrap}>
      <FoodPackagesReadyState model={model} />
    </PublicPageShell>
  );
}
