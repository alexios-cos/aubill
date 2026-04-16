import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus, NotFoundException,
    Param,
    Post, Query,
    Req,
    UseGuards
} from "@nestjs/common";
import { ApiCookieAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { DepositAccountBody } from "../dto/deposit-account.body.js";
import { FORBIDDEN_DESCRIPTION, UNAUTHORIZED_AUTHENTICATION_DESCRIPTION, type UserAwareRequest } from "../../auth/config.js";
import { IdentifierPipe } from "../../kernel/pipe/identifier.pipe.js";
import { TransactionSchema } from "../schema/transaction.schema.js";
import { AccountAuthorizationService } from "../service/account-authorization.service.js";
import { AccountService } from "../service/account.service.js";
import { AuthJwtGuard } from "../../auth/guard/auth.jwt.guard.js";
import { RequirePermissions } from "../../auth/decorators.js";
import { Permission } from "../../user/config.js";
import { TransactionService } from "../service/transaction.service.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { ApiPaginatedResponse } from "../../kernel/decorators.js";
import { PageDto } from "../../kernel/dto/page.dto.js";

@ApiCookieAuth()
@ApiTags('Account')
@Controller('accounts/:accountId/deposits')
export class AccountDepositController {

    constructor(
        private readonly accountAuthorizationService: AccountAuthorizationService,
        private readonly accountService: AccountService,
        private readonly transactionService: TransactionService,
    ) {}

    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deposit not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: TransactionSchema })
    @RequirePermissions(Permission.ACCOUNT_DEPOSIT_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':depositId')
    public async get(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Param('depositId', new IdentifierPipe('depositId')) depositId: number,
        @Req() req: UserAwareRequest,
    ): Promise<TransactionSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const deposit = await this.transactionService.getDepositByAccountAndId(accountId, depositId);
        if (!deposit) {
            throw new NotFoundException('Deposit not found');
        }

        return TransactionSchema.fromEntity(deposit);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiPaginatedResponse(TransactionSchema)
    @RequirePermissions(Permission.ACCOUNT_DEPOSIT_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    public async paginate(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Query() options: PageOptionsDto,
        @Req() req: UserAwareRequest
    ): Promise<PageDto<TransactionSchema>> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const page = await this.transactionService.paginateDeposits(options, accountId);

        return page.mapData(TransactionSchema.fromEntity);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.CREATED, type: TransactionSchema })
    @RequirePermissions(Permission.ACCOUNT_DEPOSIT_CREATE)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    public async deposit(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Body() dto: DepositAccountBody,
        @Req() req: UserAwareRequest,
    ): Promise<TransactionSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const transaction = await this.accountService.deposit(accountId, dto);

        return TransactionSchema.fromEntity(transaction);
    }

}