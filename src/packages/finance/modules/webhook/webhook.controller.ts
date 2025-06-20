import { Body, Controller, Post } from '@nestjs/common';

import { Webhook } from '../../types/webhook';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @Post('payment')
    async webhook(@Body() webhookData: Webhook) {
        if (!webhookData) {
            return { success: false, message: 'No data' };
        }
        return this.webhookService.processWebhook(webhookData);
    }
}
