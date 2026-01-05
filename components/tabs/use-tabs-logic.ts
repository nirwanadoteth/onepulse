import { useMiniAppContext } from "@/components/providers/miniapp-provider";

const BASE_APP_CLIENT_FID = 309_857;

export function useTabsLogic() {
  const miniAppContext = useMiniAppContext();

  const isBaseApp =
    miniAppContext?.context?.client?.clientFid === BASE_APP_CLIENT_FID;

  return {
    isBaseApp,
  };
}
