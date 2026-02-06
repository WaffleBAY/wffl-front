export interface Participant {
  id: string;
  lotteryId: string;
  address: string;                 // 지갑 주소
  entryDate: string;               // ISO 8601
  isWinner: boolean;
  claimStatus?: 'pending' | 'claimed' | 'expired';
}
