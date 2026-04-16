import { BadRequestException } from "@nestjs/common";

export class AccountNotFound extends BadRequestException {

    constructor(accountId: number) {
        super(`Account ${accountId} not found`);
    }

}