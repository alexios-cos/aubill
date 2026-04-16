import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
    ACCOUNT_REPOSITORY,
    CreateAccountDto,
    DepositAccountDto,
    TransactionType, MakeAccountTransferDto,
    UpdateAccountDto
} from "../config.js";
import { Repository } from "typeorm";
import { Account } from "../entity/account.js";
import { User } from "../../user/entity/user.js";
import { AccountNotFound } from "../exception/account-not-found.js";
import { TransferService } from "./transfer.service.js";
import { TransactionService } from "./transaction.service.js";
import { InactiveAccount } from "../exception/inactive-account.js";
import { Transfer } from "../entity/transfer.js";
import { Transaction } from "../entity/transaction.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";
import { PageMetaDto } from "../../kernel/dto/page/page-meta.dto.js";

@Injectable()
export class AccountService {

    constructor(
        @Inject(ACCOUNT_REPOSITORY) private readonly repository: Repository<Account>,
        private readonly transferService: TransferService,
        private readonly transactionService: TransactionService,
    ) {}

    public async get(id: number): Promise<Account|null> {
        return this.repository.findOneBy({ id });
    }

    public async paginate(options: PageOptionsDto, userId?: number): Promise<PageDto<Account>> {
        const queryBuilder = this.repository.createQueryBuilder('account');

        queryBuilder
            .orderBy('account.createdAt', options.order)
            .skip(options.skip)
            .take(options.take);

        if (userId) {
            queryBuilder.where('account.user = :userId', { userId });
        }

        const [items, itemCount] = await queryBuilder.getManyAndCount();

        const meta = new PageMetaDto({ options, itemCount });

        return new PageDto(items, meta);
    }

    public async create(user: User, dto: CreateAccountDto): Promise<Account> {
        const account = new Account();

        account.user = user;
        account.name = dto.name;
        account.balance = 0;
        account.active = true;
        account.webhookEndpoint = dto.webhookEndpoint;

        return this.repository.save(account);
    }

    public async update(accountId: number, dto: UpdateAccountDto): Promise<Account> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        if (dto.name && dto.name !== account.name) {
            account.name = dto.name;
        }

        if (dto.webhookEndpoint && dto.webhookEndpoint !== account.webhookEndpoint) {
            account.webhookEndpoint = dto.webhookEndpoint;
        }

        return this.repository.save(account);
    }

    public async deposit(accountId: number, dto: DepositAccountDto): Promise<Transaction> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        if (!account.active) {
            throw new InactiveAccount(accountId);
        }

        return this.transactionService.createTransaction(account, dto.amount, TransactionType.DEPOSIT);
    }

    public async transfer(accountId: number, dto: MakeAccountTransferDto): Promise<Transfer> {
        if (accountId === dto.recipientAccountId) {
            throw new BadRequestException('Cannot transfer to the same account');
        }

        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        if (!account.active) {
            throw new InactiveAccount(accountId);
        }

        if (account.balance < dto.amount) {
            throw new BadRequestException('Insufficient funds');
        }

        const toAccount = await this.get(dto.recipientAccountId);
        if (!toAccount) {
            throw new AccountNotFound(dto.recipientAccountId);
        }

        if (!toAccount.active) {
            throw new InactiveAccount(dto.recipientAccountId);
        }

        return this.transferService.create(account, toAccount, dto.amount);
    }

    public async cancelTransfer(accountId: number, transferId: number): Promise<Transfer> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        if (!account.active) {
            throw new InactiveAccount(accountId);
        }

        const transfer = await this.transferService.getByAccountAndId(
            account.id,
            transferId,
            { withDonor: true, withRecipient: true }
        );

        if (!transfer) {
            throw new BadRequestException('Transfer not found');
        }

        return this.transferService.cancel(transfer);
    }

    public async deactivate(accountId: number): Promise<Account> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        if (account.active) {
            account.active = false;
        }

        return this.repository.save(account);
    }

    public async activate(accountId: number): Promise<Account> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        if (!account.active) {
            account.active = true;
        }

        return this.repository.save(account);
    }

    public async block(accountId: number): Promise<Account> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        account.blocked = true;

        return this.repository.save(account);
    }

    public async unblock(accountId: number): Promise<Account> {
        const account = await this.get(accountId);
        if (!account) {
            throw new AccountNotFound(accountId);
        }

        account.blocked = false;

        return this.repository.save(account);
    }

}