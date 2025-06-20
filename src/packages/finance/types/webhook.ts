export interface Webhook {
  id: string;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  subAccount: string;
  transferType: string;
  transferAmount: number;
  accumulated: number;
  code: string;
  content: string;
  referenceCode: string;
  description: string;
}
