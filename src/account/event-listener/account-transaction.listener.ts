import { OnEvent } from "@nestjs/event-emitter";
import {
    EVENT_TRANSACTION_STATUS_CHANGED,
    EVENT_TRANSFER_STATUS_CHANGED,
    type TransactionStatusChangedEvent,
    transactionStatusMap, transactionTypeMap, TransferDirection,
    type TransferStatusChangedEvent, transferStatusMap
} from "../config.js";
import { TransactionService } from "../service/transaction.service.js";
import { Injectable } from "@nestjs/common";
import { AccountService } from "../service/account.service.js";
import { WebhookService } from "../../messaging/service/webhook.service.js";
import { TransferService } from "../service/transfer.service.js";

@Injectable()
export class AccountTransactionListener {

    constructor(
        private readonly transactionService: TransactionService,
        private readonly transferService: TransferService,
        private readonly accountService: AccountService,
        private readonly webhookService: WebhookService,
    ) {}

    @OnEvent(EVENT_TRANSACTION_STATUS_CHANGED)
    public async handleTransactionStatusChanged(payload: TransactionStatusChangedEvent) {
        const transaction = await this.transactionService.get(payload.transactionId);
        if (!transaction) {
            return;
        }

        const account = await this.accountService.get(transaction.accountId);
        if (!account || !account.webhookEndpoint) {
            return;
        }

        await this.webhookService.post(
            account.webhookEndpoint,
            {
                message: 'Transaction status changed',
                transactionId: transaction.id,
                transferId: transaction.transferId,
                status: transactionStatusMap[transaction.status],
                type: transactionTypeMap[transaction.type],
                date: transaction.updatedAt,
            }
        );
    }

    @OnEvent(EVENT_TRANSFER_STATUS_CHANGED)
    public async handleTransferStatusChanged(payload: TransferStatusChangedEvent) {
        const transfer = await this.transferService.get(payload.transferId);
        if (!transfer) {
            return;
        }

        const donor = await this.accountService.get(transfer.donorId);
        if (donor && donor.webhookEndpoint) {
            await this.webhookService.post(
                donor.webhookEndpoint,
                {
                    message: 'Transfer status changed',
                    transferId: transfer.id,
                    status: transferStatusMap[transfer.status],
                    type: TransferDirection.OUTGOING,
                    date: transfer.updatedAt,
                }
            );
        }

        const recipient = await this.accountService.get(transfer.recipientId);
        if (recipient && recipient.webhookEndpoint) {
            await this.webhookService.post(
                recipient.webhookEndpoint,
                {
                    message: 'Transfer status changed',
                    transferId: transfer.id,
                    status: transferStatusMap[transfer.status],
                    type: TransferDirection.INCOMING,
                    date: transfer.updatedAt,
                }
            );
        }
    }

}