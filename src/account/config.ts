export const ACCOUNT_REPOSITORY = Symbol('ACCOUNT_REPOSITORY');
export const TRANSFER_REPOSITORY = Symbol('TRANSFER_REPOSITORY');
export const TRANSACTION_REPOSITORY = Symbol('TRANSACTION_REPOSITORY');

export const EVENT_TRANSACTION_STATUS_CHANGED = 'transaction.status.changed';
export const EVENT_TRANSFER_STATUS_CHANGED = 'transfer.status.changed';

export enum TransferStatus {
    PENDING = 1,
    SUCCESS = 2,
    FAILED = 3,
    CANCELLED = 4,
}

export enum TransferStatusSchema {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum TransferDirection {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing',
}

export enum TransactionStatus {
    PENDING = 1,
    SUCCESS = 2,
    FAILED = 3,
}

export enum TransactionStatusSchema {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

export enum TransactionType {
    DEPOSIT = 1,
    WITHDRAW = 2,
    DEPOSIT_REVERT = 3,
    WITHDRAW_REVERT = 4,
}

export enum TransactionTypeSchema {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
    DEPOSIT_REVERT = 'deposit_revert',
    WITHDRAW_REVERT = 'withdraw_revert',
}

export interface CreateAccountDto {
    name: string;
    webhookEndpoint?: string;
}

export interface UpdateAccountDto {
    name?: string;
    webhookEndpoint?: string;
}

export interface DepositAccountDto {
    amount: number;
}

export interface MakeAccountTransferDto {
    amount: number;
    recipientAccountId: number;
}

export interface TransactionStatusChangedEvent {
    transactionId: number
}

export interface TransferStatusChangedEvent {
    transferId: number
}

export const transactionTypeMap: Record<TransactionType, TransactionTypeSchema> = {
    [TransactionType.DEPOSIT]: TransactionTypeSchema.DEPOSIT,
    [TransactionType.WITHDRAW]: TransactionTypeSchema.WITHDRAW,
    [TransactionType.DEPOSIT_REVERT]: TransactionTypeSchema.DEPOSIT_REVERT,
    [TransactionType.WITHDRAW_REVERT]: TransactionTypeSchema.WITHDRAW_REVERT,
};

export const transactionStatusMap: Record<TransactionStatus, TransactionStatusSchema> = {
    [TransactionStatus.PENDING]: TransactionStatusSchema.PENDING,
    [TransactionStatus.SUCCESS]: TransactionStatusSchema.SUCCESS,
    [TransactionStatus.FAILED]: TransactionStatusSchema.FAILED,
};

export const transferStatusMap: Record<TransferStatus, TransferStatusSchema> = {
    [TransferStatus.PENDING]: TransferStatusSchema.PENDING,
    [TransferStatus.SUCCESS]: TransferStatusSchema.SUCCESS,
    [TransferStatus.FAILED]: TransferStatusSchema.FAILED,
    [TransferStatus.CANCELLED]: TransferStatusSchema.CANCELLED,
};