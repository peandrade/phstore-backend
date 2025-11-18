export type ProductListItem = {
  id: number;
  label: string;
  price: number;
  image: string | null;
};

export type ProductDetail = {
  id: number;
  label: string;
  price: number;
  description: string | null;
  categoryId: number;
  images: string[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type ProductFilters = {
  metadata?: { [key: string]: string };
  order?: string;
  limit?: number;
};

export type ProductListResponse = {
  error: null;
  products: Array<ProductListItem & { liked: boolean }>;
};

export type ProductDetailResponse = {
  error: null;
  product: ProductDetail;
  category: Category | null;
};

export type ErrorResponse = {
  error: string;
};
