import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Query, Req, UseGuards } from "@nestjs/common";
import { ApiCookieAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthJwtGuard } from "../../auth/guard/auth.jwt.guard.js";
import { RequirePermissions } from "../../auth/decorators.js";
import { Permission } from "../config.js";
import type { UserAwareRequest } from "../../auth/config.js";
import { UserSchema } from "../schema/user.schema.js";
import { FORBIDDEN_DESCRIPTION, UNAUTHORIZED_AUTHENTICATION_DESCRIPTION } from "../../auth/config.js";
import { ApiPaginatedResponse } from "../../kernel/decorators.js";
import { UserService } from "../service/user.service.js";
import { IdentifierPipe } from "../../kernel/pipe/identifier.pipe.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";

@ApiCookieAuth()
@ApiTags('User')
@Controller('users')
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) {}

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.OK, type: UserSchema })
    @RequirePermissions(Permission.WHO_AM_I)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get('who-am-i')
    public async whoAmI(@Req() req: UserAwareRequest): Promise<UserSchema> {
        return UserSchema.fromEntity(req.user);
    }

    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: UserSchema })
    @RequirePermissions(Permission.USER_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':userId')
    public async get(
        @Param('userId', new IdentifierPipe('userId')) userId: number,
    ) {
        const user = await this.userService.get(userId);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return UserSchema.fromEntity(user);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiPaginatedResponse(UserSchema)
    @RequirePermissions(Permission.USER_LIST)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    public async paginate(
        @Query() options: PageOptionsDto,
    ) {
        const page = await this.userService.paginate(options);

        return page.mapData(UserSchema.fromEntity);
    }

}