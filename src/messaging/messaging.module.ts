import { Module } from "@nestjs/common";
import { WebhookService } from "./service/webhook.service.js";

@Module({
    providers: [
        WebhookService,
    ],
    exports: [
        WebhookService,
    ]
})
export class MessagingModule {}