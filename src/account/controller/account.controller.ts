import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post, Put, Query,
    Req,
    UseGuards,
} from "@nestjs/common";
import { AuthJwtGuard } from "../../auth/guard/auth.jwt.guard.js";
import { RequirePermissions } from "../../auth/decorators.js";
import { Permission } from "../../user/config.js";
import { ApiCookieAuth, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AccountSchema } from "../schema/account.schema.js";
import {
    FORBIDDEN_DESCRIPTION,
    UNAUTHORIZED_AUTHENTICATION_DESCRIPTION,
    type UserAwareRequest
} from "../../auth/config.js";
import { CreateAccountBody } from "../dto/create-account.body.js";
import { AccountService } from "../service/account.service.js";
import { AccountAuthorizationService } from "../service/account-authorization.service.js";
import { ApiPaginatedResponse } from "../../kernel/decorators.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";
import { UpdateAccountBody } from "../dto/update-account.body.js";
import { IdentifierPipe } from "../../kernel/pipe/identifier.pipe.js";

@ApiCookieAuth()
@ApiTags('Account')
@Controller('accounts')
export class AccountController {

    constructor(
        private readonly accountService: AccountService,
        private readonly accountAuthorizationService: AccountAuthorizationService,
    ) {}

    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Account not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':accountId')
    public async get(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Req() req: UserAwareRequest
    ): Promise<AccountSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const account = await this.accountService.get(accountId);
        if (!account) {
            throw new NotFoundException('Account not found');
        }

        return AccountSchema.fromEntity(account);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiPaginatedResponse(AccountSchema)
    @RequirePermissions(Permission.ACCOUNT_LIST)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    public async paginate(
        @Query() options: PageOptionsDto,
        @Req() req: UserAwareRequest
    ): Promise<PageDto<AccountSchema>> {
        const page = await this.accountService.paginate(options, req.user.id);

        return page.mapData(AccountSchema.fromEntity);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.CREATED, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_CREATE)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    public async create(@Body() dto: CreateAccountBody, @Req() req: UserAwareRequest): Promise<AccountSchema> {
        const account = await this.accountService.create(req.user, dto);

        return AccountSchema.fromEntity(account);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_UPDATE)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Put(':accountId')
    public async update(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Body() dto: UpdateAccountBody,
        @Req() req: UserAwareRequest
    ): Promise<AccountSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const account = await this.accountService.update(accountId, dto);

        return AccountSchema.fromEntity(account);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_DEACTIVATE)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':accountId/deactivate')
    public async deactivate(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Req() req: UserAwareRequest,
    ): Promise<AccountSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const account = await this.accountService.deactivate(accountId);

        return AccountSchema.fromEntity(account);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_ACTIVATE)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':accountId/activate')
    public async activate(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Req() req: UserAwareRequest,
    ): Promise<AccountSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const account = await this.accountService.activate(accountId);

        return AccountSchema.fromEntity(account);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_BLOCK)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':accountId/block')
    public async block(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
    ): Promise<AccountSchema> {
        const account = await this.accountService.block(accountId);

        return AccountSchema.fromEntity(account);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: AccountSchema })
    @RequirePermissions(Permission.ACCOUNT_UNBLOCK)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':accountId/unblock')
    public async unblock(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
    ): Promise<AccountSchema> {
        const account = await this.accountService.unblock(accountId);

        return AccountSchema.fromEntity(account);
    }

}