import { useState, useMemo } from "react";
import { ProviderRegistry } from "./provider-registry";
import type { PlatformProvider, PlatformId } from "./types";

export type PlatformsState = ReturnType<typeof usePlatforms>;

export function usePlatforms() {
  const registry = useMemo(() => ProviderRegistry.getInstance(), []);

  const [providers] = useState<PlatformProvider[]>(() => registry.getProviders());
  const [selectedProviderId, setSelectedProviderId] = useState<PlatformId | null>(null);

  const activeProvider = useMemo(() => {
    if (selectedProviderId) return registry.getProvider(selectedProviderId) || null;
    return null;
  }, [registry, selectedProviderId]);

  return {
    providers,
    activeProvider,
    selectedProviderId,
    setSelectedProviderId,
  };
}
