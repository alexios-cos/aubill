import { BadRequestException } from "@nestjs/common";

export class InactiveAccount extends BadRequestException {

    constructor(accountId: number) {
        super(`Cannot perform action on inactive account ${accountId}`);
    }

}