import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module.js";
import { ACCOUNT_REPOSITORY, TRANSACTION_REPOSITORY, TRANSFER_REPOSITORY } from "./config.js";
import { DataSource } from "typeorm";
import { Account } from "./entity/account.js";
import { AccountService } from "./service/account.service.js";
import { Transfer } from "./entity/transfer.js";
import { TransactionService } from "./service/transaction.service.js";
import { TransferService } from "./service/transfer.service.js";
import { AccountController } from "./controller/account.controller.js";
import { Transaction } from "./entity/transaction.js";
import { DATA_SOURCE } from "../database/config.js";
import { MessagingModule } from "../messaging/messaging.module.js";
import { UserModule } from "../user/user.module.js";
import { AccountAuthorizationService } from "./service/account-authorization.service.js";
import { AccountTransferController } from "./controller/account-transfer.controller.js";
import { AccountDepositController } from "./controller/account-deposit.controller.js";
import { AccountTransactionListener } from "./event-listener/account-transaction.listener.js";
import { TransferController } from "./controller/transfer.controller.js";
import { DepositController } from "./controller/deposit.controller.js";

@Module({
    imports: [
        DatabaseModule,
        MessagingModule,
        UserModule,
    ],
    providers: [
        {
            provide: ACCOUNT_REPOSITORY,
            useFactory: async (dataSource: DataSource) => dataSource.getRepository(Account),
            inject: [DATA_SOURCE],
        },
        {
            provide: TRANSFER_REPOSITORY,
            useFactory: async (dataSource: DataSource) => dataSource.getRepository(Transfer),
            inject: [DATA_SOURCE],
        },
        {
            provide: TRANSACTION_REPOSITORY,
            useFactory: async (dataSource: DataSource) => dataSource.getRepository(Transaction),
            inject: [DATA_SOURCE],
        },
        AccountService,
        AccountAuthorizationService,
        TransferService,
        TransactionService,
        AccountTransactionListener,
    ],
    exports: [
        ACCOUNT_REPOSITORY,
        TRANSFER_REPOSITORY,
        TRANSACTION_REPOSITORY,
        AccountService,
        AccountAuthorizationService,
        TransferService,
        TransactionService,
    ],
    controllers: [
        AccountController,
        AccountTransferController,
        AccountDepositController,
        TransferController,
        DepositController,
    ],
})
export class AccountModule {}