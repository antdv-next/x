import type { Catalog } from "./runtime/types";

const catalogCache = new Map<string, Catalog>();

export function registerCatalog(catalog: Catalog): void {
  const catalogId = catalog.$id || catalog.catalogId;
  if (catalogId) {
    catalogCache.set(catalogId, catalog);
  }
}

export async function loadCatalog(catalogId: string): Promise<Catalog> {
  if (catalogCache.has(catalogId)) {
    return catalogCache.get(catalogId)!;
  }

  if (catalogId.startsWith("local://")) {
    return {
      $id: catalogId,
      components: {},
    };
  }

  const response = await fetch(catalogId);
  if (!response.ok) {
    throw new Error(
      `Failed to load catalog from ${catalogId}: ${response.statusText}`,
    );
  }

  const catalog = (await response.json()) as Catalog;
  catalogCache.set(catalogId, catalog);
  return catalog;
}

export function clearCatalogCache() {
  catalogCache.clear();
}
