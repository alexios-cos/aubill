import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common";
import { User } from "../entity/user.js";
import { RoleName, USER_REPOSITORY } from "../config.js";
import { Repository } from "typeorm";
import { createId } from "@paralleldrive/cuid2";
import { RoleService } from "./role.service.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";
import { PageMetaDto } from "../../kernel/dto/page/page-meta.dto.js";

export interface ActivateAPIDto {
    refreshToken: string;
}

@Injectable()
export class UserService {

    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepository: Repository<User>,
        private readonly roleService: RoleService,
    ) {}

    public async get(id: number): Promise<User|null> {
        return this.userRepository.findOneBy({ id });
    }

    public async getByEmail(email: string): Promise<User|null> {
        return this.userRepository.findOneBy({ email });
    }

    public async paginate(options: PageOptionsDto): Promise<PageDto<User>> {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        queryBuilder
            .orderBy('user.createdAt', options.order)
            .skip(options.skip)
            .take(options.take);

        const [items, itemCount] = await queryBuilder.getManyAndCount();

        const meta = new PageMetaDto({ options, itemCount });

        return new PageDto(items, meta);
    }

    public async createByDto(email: string, passwordHash: string): Promise<User> {
        const role = await this.roleService.getByName(RoleName.CLIENT);
        if (!role) {
            throw new InternalServerErrorException();
        }

        const user = new User();

        user.email = email;
        user.role = role;
        user.password = passwordHash;
        user.name = createId();

        return this.userRepository.save(user);
    }

    public async activateAPI(user: User, data: ActivateAPIDto): Promise<User> {
        user.refreshToken = data.refreshToken;

        return this.userRepository.save(user);
    }

    public async deactivateAPI(user: User): Promise<User> {
        user.refreshToken = null;

        return this.userRepository.save(user);
    }

}