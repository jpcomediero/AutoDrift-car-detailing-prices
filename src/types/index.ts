export interface CarSizeType {
  id: string;
  name: string;
  examples: string;
  imageUrl?: string | null;
  imagePath?: string | null;
  sortOrder: number;
  active: boolean;
}

export interface ServicePriceType {
  id?: string;
  serviceId?: string;
  carSizeId: string;
  price: number;
  salePrice?: number | null;
  saleStart?: string | Date | null;
  saleEnd?: string | Date | null;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  sortOrder: number;
  active: boolean;
  prices?: ServicePriceType[];
  priceForSelectedSize?: number;
  salePriceForSelectedSize?: number | null;
  saleActive?: boolean;
}

export interface ComboPriceType {
  id?: string;
  comboId?: string;
  carSizeId: string;
  price: number;
  salePrice?: number | null;
  saleStart?: string | Date | null;
  saleEnd?: string | Date | null;
}

export interface ComboType {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  active: boolean;
  services: ServiceType[];
  prices?: ComboPriceType[];
  priceForSelectedSize?: number;
  salePriceForSelectedSize?: number | null;
  saleActive?: boolean;
  regularTotalForSelectedSize?: number;
  savingsForSelectedSize?: number;
}

export interface PublicPricingData {
  sizes: CarSizeType[];
  services: ServiceType[];
  combos: ComboType[];
  lastUpdated: string;
}

export interface PriceHistoryItem {
  id: string;
  itemType: "SERVICE" | "COMBO";
  itemId: string;
  itemName?: string;
  carSizeId: string;
  carSizeName?: string;
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  changedAt: string;
}

export interface AnalyticsSummary {
  mostViewedServices: { id: string; name: string; count: number }[];
  mostSelectedServices: { id: string; name: string; count: number }[];
  mostViewedCombos: { id: string; name: string; count: number }[];
  mostChosenCarSizes: { id: string; name: string; count: number }[];
  totalViews: number;
  totalSelections: number;
}
