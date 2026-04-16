import { BadRequestException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Account } from "../entity/account.js";
import { Transfer } from "../entity/transfer.js";
import {
    EVENT_TRANSACTION_STATUS_CHANGED,
    EVENT_TRANSFER_STATUS_CHANGED,
    TRANSACTION_REPOSITORY,
    TransactionStatus,
    TransactionStatusChangedEvent,
    TransactionType,
    TRANSFER_REPOSITORY,
    TransferDirection,
    TransferStatus,
    TransferStatusChangedEvent
} from "../config.js";
import { DataSource, EntityManager, FindOptionsRelations, FindOptionsWhere, Repository } from "typeorm";
import { DATA_SOURCE } from "../../database/config.js";
import { Transaction } from "../entity/transaction.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";
import { PageMetaDto } from "../../kernel/dto/page/page-meta.dto.js";

export interface GetOptions {
    withDonor?: boolean
    withRecipient?: boolean
}

@Injectable()
export class TransferService {

    constructor(
        @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
        @Inject(TRANSFER_REPOSITORY) private readonly transferRepository: Repository<Transfer>,
        @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: Repository<Transaction>,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async get(id: number, options?: GetOptions): Promise<Transfer|null> {
        const where: FindOptionsWhere<Transfer> = { id };

        const relations: FindOptionsRelations<Transfer> = {};

        if (options?.withDonor) {
            relations.donor = true;
        }

        if (options?.withRecipient) {
            relations.recipient = true;
        }

        return this.transferRepository.findOne({
            where,
            relations,
        });
    }

    public async getByAccountAndId(accountId: number, id: number, options?: GetOptions): Promise<Transfer|null> {
        const relations: FindOptionsRelations<Transfer> = {};

        if (options?.withDonor) {
            relations.donor = true;
        }

        if (options?.withRecipient) {
            relations.recipient = true;
        }

        return this.transferRepository.findOne({
            where: [
                {
                    id,
                    donor: {
                        id: accountId,
                    }
                },
                {
                    id,
                    recipient: {
                        id: accountId,
                    }
                }
            ],
            relations
        })
    }

    public async paginate(options: PageOptionsDto, accountId?: number): Promise<PageDto<Transfer>> {
        const queryBuilder = this.transferRepository.createQueryBuilder('transfer');

        queryBuilder
            .orderBy('transfer.updatedAt', options.order)
            .skip(options.skip)
            .take(options.take);

        if (accountId) {
            queryBuilder.where('transfer.donor = :accountId OR transfer.recipient = :accountId', { accountId });

            queryBuilder.addSelect(
                `
                    CASE
                        WHEN transfer.donor = :accountId THEN '${TransferDirection.OUTGOING}'
                        WHEN transfer.recipient = :accountId THEN '${TransferDirection.INCOMING}'
                        ELSE NULL
                    END
                `,
                'direction'
            );
        }

        const result = await queryBuilder.getRawAndEntities();

        const items: Transfer[] = result.entities.map((item, index) => {
            item.direction = result.raw[index].direction;
            return item;
        });

        const itemCount = await queryBuilder.getCount();

        const meta = new PageMetaDto({ options, itemCount });

        return new PageDto(items, meta);
    }

    public async create(donor: Account, recipient: Account, amount: number): Promise<Transfer> {
        const transfer = new Transfer();

        transfer.donor = donor;
        transfer.recipient = recipient;
        transfer.amount = amount;
        transfer.status = TransferStatus.PENDING;

        const debit = new Transaction();
        debit.account = donor;
        debit.transfer = transfer;
        debit.amount = amount;
        debit.type = TransactionType.WITHDRAW;
        debit.status = TransactionStatus.PENDING;

        const credit = new Transaction();
        credit.account = recipient;
        credit.transfer = transfer;
        credit.amount = amount;
        credit.type = TransactionType.DEPOSIT;
        credit.status = TransactionStatus.PENDING;

        try {
            await this.dataSource.transaction(async (em: EntityManager) => {
                await em.save(transfer);
                await em.save(debit);
                await em.save(credit);
            })
        } catch {
            throw new InternalServerErrorException();
        }

        try {
            await this.dataSource.transaction(async (em: EntityManager) => {
                donor.balance -= amount;
                await em.save(donor);

                debit.status = TransactionStatus.SUCCESS;
                await em.save(debit);

                recipient.balance += amount;
                await em.save(recipient);

                credit.status = TransactionStatus.SUCCESS;
                await em.save(credit);

                transfer.status = TransferStatus.SUCCESS;
                await em.save(transfer);
            });
        } catch {
            debit.status = TransactionStatus.FAILED;
            await this.transactionRepository.save(debit);

            credit.status = TransactionStatus.FAILED;
            await this.transactionRepository.save(credit);

            transfer.status = TransferStatus.FAILED;
            await this.transferRepository.save(transfer);
        } finally {
            await this.emitEvents(transfer, [debit, credit]);
        }

        return transfer;
    }

    public async cancel(transfer: Transfer): Promise<Transfer> {
        if (transfer.status !== TransferStatus.SUCCESS) {
            throw new BadRequestException('Only successful transfers can be cancelled');
        }

        const donor = transfer.donor;
        const recipient = transfer.recipient;

        if (!donor || !recipient) {
            throw new InternalServerErrorException('Failed to load transfer');
        }

        const debitRevert = new Transaction();
        debitRevert.account = donor;
        debitRevert.transfer = transfer;
        debitRevert.amount = transfer.amount;
        debitRevert.type = TransactionType.WITHDRAW_REVERT;
        debitRevert.status = TransactionStatus.PENDING;

        const creditRevert = new Transaction();
        creditRevert.account = recipient;
        creditRevert.transfer = transfer;
        creditRevert.amount = transfer.amount;
        creditRevert.type = TransactionType.DEPOSIT_REVERT;
        creditRevert.status = TransactionStatus.PENDING;

        try {
            await this.dataSource.transaction(async (em: EntityManager) => {
                await em.save(debitRevert);
                await em.save(creditRevert);
            });
        } catch {
            throw new InternalServerErrorException();
        }

        try {
            await this.dataSource.transaction(async (em: EntityManager) => {
                donor.balance += transfer.amount;
                await em.save(donor);

                debitRevert.status = TransactionStatus.SUCCESS;
                await em.save(debitRevert);

                recipient.balance -= transfer.amount;
                await em.save(recipient);

                creditRevert.status = TransactionStatus.SUCCESS;
                await em.save(creditRevert);

                transfer.status = TransferStatus.CANCELLED;
                await em.save(transfer);
            })
        } catch {
            debitRevert.status = TransactionStatus.FAILED;
            await this.transactionRepository.save(debitRevert);

            creditRevert.status = TransactionStatus.FAILED;
            await this.transactionRepository.save(creditRevert);
        } finally {
            await this.emitEvents(transfer, [debitRevert, creditRevert]);
        }

        return transfer;
    }

    private async emitEvents(transfer: Transfer, transactions: Transaction[]): Promise<void> {
        for (const transaction of transactions) {
            void this.eventEmitter.emitAsync(
                EVENT_TRANSACTION_STATUS_CHANGED,
                {
                    transactionId: transaction.id,
                } as TransactionStatusChangedEvent
            );
        }

        void this.eventEmitter.emitAsync(
            EVENT_TRANSFER_STATUS_CHANGED,
            {
                transferId: transfer.id,
            } as TransferStatusChangedEvent
        );
    }

}