// Shared by the portfolio editor, the public page, admin and exports (no server-only imports).

/** Most images a portfolio can hold. */
export const PORTFOLIO_MAX = 20;

/** Path of a user's public portfolio page. */
export const portfolioPath = (token: string) => `/portfolio/${token}`;

/** Path of one image on that page; only served while the image belongs to that link. */
export const portfolioImagePath = (token: string, imageId: string) => `/portfolio/${token}/${imageId}`;
