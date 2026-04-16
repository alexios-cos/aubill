import { Inject, Injectable } from "@nestjs/common";
import { ROLE_REPOSITORY, RoleName } from "../config.js";
import { Repository } from "typeorm";
import { Role } from "../entity/role.js";

@Injectable()
export class RoleService {

    constructor(
        @Inject(ROLE_REPOSITORY) private readonly repository: Repository<Role>,
    ) {}

    public async getByName(name: RoleName): Promise<Role|null> {
        return this.repository.findOneBy({ name });
    }

}