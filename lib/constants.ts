export const GAME_TYPES = {
  LOTTERY: 'lottery',
  RAFFLE: 'raffle',
  TOURNAMENT: 'tournament',
} as const;

export const LOAN_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  REPAID: 'repaid',
  LIQUIDATED: 'liquidated',
  DEFAULTED: 'defaulted',
} as const;

export const GAME_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  DRAWING: 'drawing',
  COMPLETED: 'completed',
} as const;

export const SUPPORTED_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  { symbol: 'DAI', name: 'Dai Stablecoin', decimals: 18 },
];

export const COLLATERAL_RATIOS = {
  ETH: 150, // 150% collateralization ratio
  USDC: 110,
  USDT: 110,
  DAI: 120,
};

export const DEFAULT_LIQUIDATION_THRESHOLD = 120; // 120%

export const REPUTATION_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 100,
  GOLD: 500,
  PLATINUM: 1000,
  DIAMOND: 2500,
};

export const PLATFORM_FEE = 0.025; // 2.5%
export const VRF_SUBSCRIPTION_ID = process.env.NEXT_PUBLIC_VRF_SUBSCRIPTION_ID;
export const VRF_COORDINATOR_ADDRESS = process.env.NEXT_PUBLIC_VRF_COORDINATOR;
