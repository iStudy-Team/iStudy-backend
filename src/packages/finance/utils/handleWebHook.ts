import { PAYMENT_SYSTEM_CODE } from '../config';

export function getPaymentIdFromWebhook(transactionContent: string): string {
    const regex = new RegExp(`${PAYMENT_SYSTEM_CODE}-?([a-fA-F0-9]{24})`);
    const match = transactionContent.match(regex);

    if (match && match[1]) {
        return match[1];
    }
    return '';
}
