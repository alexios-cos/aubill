import { User } from "../../user/entity/user.js";
import { ForbiddenException, Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ACCOUNT_REPOSITORY } from "../config.js";
import { Repository } from "typeorm";
import { Account } from "../entity/account.js";
import { ROLE_REPOSITORY, RoleName } from "../../user/config.js";
import { Role } from "../../user/entity/role.js";

@Injectable()
export class AccountAuthorizationService {

    constructor(
        @Inject(ACCOUNT_REPOSITORY) private readonly accountRepository: Repository<Account>,
        @Inject(ROLE_REPOSITORY) private readonly roleRepository: Repository<Role>,
    ) {}

    public async authorize(user: User, accountId: number): Promise<void> {
        const adminRole = await this.roleRepository.findOneBy({ name: RoleName.ADMIN });
        if (!adminRole) {
            throw new InternalServerErrorException();
        }

        if (user.roleId === adminRole.id) {
            return;
        }

        const account = await this.accountRepository.findOneBy({
            id: accountId,
            user: {
                id: user.id,
            },
        });

        if (!account) {
            throw new ForbiddenException('You are not authorized to access this account');
        }

        if (account.blocked) {
            throw new ForbiddenException('This account is blocked');
        }
    }

}