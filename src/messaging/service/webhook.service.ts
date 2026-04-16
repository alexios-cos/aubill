import { Logger } from "@nestjs/common";

export class WebhookService {

    private readonly logger = new Logger(WebhookService.name);

    public async post<P extends Object>(url: string, payload: P): Promise<void> {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new Error(`Webhook failed with status ${response.status}`);
            }
        } finally {
            clearTimeout(timeout);
        }
    }

}