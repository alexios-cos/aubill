import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
    EVENT_TRANSACTION_STATUS_CHANGED,
    TRANSACTION_REPOSITORY,
    TransactionStatus, TransactionStatusChangedEvent,
    TransactionType
} from "../config.js";
import { Transaction } from "../entity/transaction.js";
import { DataSource, EntityManager, FindOptionsRelations, FindOptionsWhere, IsNull, Repository } from "typeorm";
import { Account } from "../entity/account.js";
import { Transfer } from "../entity/transfer.js";
import { DATA_SOURCE } from "../../database/config.js";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageMetaDto } from "../../kernel/dto/page/page-meta.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";

export interface GetOptions {
    withAccount?: boolean
}

@Injectable()
export class TransactionService {

    constructor(
        @Inject(DATA_SOURCE) private readonly dataSource: DataSource,
        @Inject(TRANSACTION_REPOSITORY) private readonly transactionRepository: Repository<Transaction>,
        private readonly eventEmitter: EventEmitter2,
    ) {}

    public async get(id: number, options?: GetOptions): Promise<Transaction|null> {
        const where: FindOptionsWhere<Transaction> = { id };

        const relations: FindOptionsRelations<Transaction> = {};

        if (options?.withAccount) {
            relations.account = true;
        }

        return this.transactionRepository.findOne({
            where,
            relations
        });
    }

    public async getDeposit(id: number, options?: GetOptions): Promise<Transaction|null> {
        const where: FindOptionsWhere<Transaction> = {
            id,
            type: TransactionType.DEPOSIT,
            transfer: IsNull()
        };

        const relations: FindOptionsRelations<Transaction> = {};

        if (options?.withAccount) {
            relations.account = true;
        }

        return this.transactionRepository.findOne({
            where,
            relations,
        });
    }

    public async getDepositByAccountAndId(accountId: number, id: number): Promise<Transaction|null> {
        return this.transactionRepository.findOne({
            where: {
                id,
                account: {
                    id: accountId,
                },
                type: TransactionType.DEPOSIT,
                transfer: IsNull()
            }
        });
    }

    public async paginateDeposits(options: PageOptionsDto, accountId?: number): Promise<PageDto<Transaction>> {
        const queryBuilder = this.transactionRepository.createQueryBuilder('transaction');

        queryBuilder
            .orderBy('transaction.updatedAt', options.order)
            .skip(options.skip)
            .take(options.take);

        queryBuilder.where(
            'transaction.type = :type AND transaction.transfer IS NULL',
            { type: TransactionType.DEPOSIT }
        );

        if (accountId) {
            queryBuilder.andWhere('transaction.account = :accountId', { accountId });
        }

        const [items, itemCount] = await queryBuilder.getManyAndCount();

        const meta = new PageMetaDto({ options, itemCount });

        return new PageDto(items, meta);
    }

    public async createTransaction(
        account: Account,
        amount: number,
        type: TransactionType,
        transfer?: Transfer
    ): Promise<Transaction> {
        const transaction = new Transaction();

        transaction.account = account;
        transaction.transfer = transfer;
        transaction.amount = amount;
        transaction.type = type;
        transaction.status = TransactionStatus.PENDING;

        await this.transactionRepository.save(transaction);

        try {
            await this.dataSource.transaction(async (em: EntityManager) => {
                account.balance += amount;
                await em.save(account);

                transaction.status = TransactionStatus.SUCCESS;
                await em.save(transaction);
            });
        } catch {
            transaction.status = TransactionStatus.FAILED;
            await this.transactionRepository.save(transaction);
        } finally {
            await this.emitEvents(transaction);
        }

        return transaction;
    }

    public async cancelDeposit(transaction: Transaction): Promise<Transaction> {
        if (transaction.type !== TransactionType.DEPOSIT || transaction.transferId) {
            throw new BadRequestException('Transaction is not a deposit');
        }

        if (transaction.status !== TransactionStatus.SUCCESS) {
            throw new BadRequestException('Only successful deposits can be cancelled');
        }

        const account = transaction.account;
        if (!account) {
            throw new BadRequestException('Failed to load transaction');
        }

        const transactionRevert = new Transaction();
        transactionRevert.account = account;
        transactionRevert.amount = transaction.amount;
        transactionRevert.type = TransactionType.DEPOSIT_REVERT;
        transactionRevert.status = TransactionStatus.PENDING;

        await this.transactionRepository.save(transactionRevert);

        try {
            await this.dataSource.transaction(async (em: EntityManager) => {
                account.balance -= transaction.amount;
                await em.save(account);

                transactionRevert.status = TransactionStatus.SUCCESS;
                await em.save(transactionRevert);
            });
        } catch {
            transactionRevert.status = TransactionStatus.FAILED;
            await this.transactionRepository.save(transactionRevert);
        } finally {
            await this.emitEvents(transactionRevert);
        }

        return transactionRevert;
    }

    private async emitEvents(transaction: Transaction): Promise<void> {
        void this.eventEmitter.emitAsync(
            EVENT_TRANSACTION_STATUS_CHANGED,
            {
                transactionId: transaction.id,
            } as TransactionStatusChangedEvent
        );
    }

}