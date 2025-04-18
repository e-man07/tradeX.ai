export interface SwapData {
  from: string;
  to: string;
  amount: string;
}

export interface TransferData {
  recipient: string;
  amount: string;
  token: string;
}
export interface pumpFunTokenData {
  tokenName: string;
  tokenTicker: string;
  tokenDescription: string;
  tokenImage: any;
}

export interface NFTMintData {
  name: string;
  description: string;
  image: any;
  collectionMint: string;
  symbol?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export interface CollectionData {
  name: string;
  symbol: string;
  description: string;
  image: string | File | Uint8Array;
  royaltyBasisPoints?: number;
  creators?: Array<{
    address: string;
    percentage: number;
  }>;
}

export interface CreateCollectionData {
  interface: "createCollection";
  type: "createCollection";
  data: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    royaltyBasisPoints?: number;
    creators?: Array<{
      address: string;
      percentage: number;
    }>;
  };
}