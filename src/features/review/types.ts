export interface IReviewDTO {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  isOwn: boolean;
}

export interface IRatingSummaryDTO {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface IProductRatingDTO {
  average: number;
  count: number;
}