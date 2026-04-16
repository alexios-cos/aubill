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
import type { UserAwareRequest } from "../../auth/config.js";
import { AccountAuthorizationService } from "../service/account-authorization.service.js";
import { FORBIDDEN_DESCRIPTION, UNAUTHORIZED_AUTHENTICATION_DESCRIPTION } from "../../auth/config.js";
import { RequirePermissions } from "../../auth/decorators.js";
import { Permission } from "../../user/config.js";
import { AuthJwtGuard } from "../../auth/guard/auth.jwt.guard.js";
import { AccountService } from "../service/account.service.js";
import { MakeAccountTransferBody } from "../dto/make-account-transfer.body.js";
import { TransferSchema } from "../schema/transfer.schema.js";
import { TransferService } from "../service/transfer.service.js";
import { ApiPaginatedResponse } from "../../kernel/decorators.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { IdentifierPipe } from "../../kernel/pipe/identifier.pipe.js";

@ApiCookieAuth()
@ApiTags('Account')
@Controller('accounts/:accountId/transfers')
export class AccountTransferController {

    constructor(
        private readonly accountAuthorizationService: AccountAuthorizationService,
        private readonly accountService: AccountService,
        private readonly transferService: TransferService,
    ) {}

    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transfer not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: TransferSchema })
    @RequirePermissions(Permission.ACCOUNT_TRANSFER_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':transferId')
    public async get(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Param('transferId', new IdentifierPipe('transferId')) transferId: number,
        @Req() req: UserAwareRequest,
    ): Promise<TransferSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const transfer = await this.transferService.getByAccountAndId(accountId, transferId);
        if (!transfer) {
            throw new NotFoundException('Transfer not found');
        }

        return TransferSchema.fromEntity(transfer);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiPaginatedResponse(TransferSchema)
    @RequirePermissions(Permission.ACCOUNT_TRANSFER_LIST)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    public async paginate(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Query() options: PageOptionsDto,
        @Req() req: UserAwareRequest
    ) {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const page = await this.transferService.paginate(options, accountId);

        return page.mapData(TransferSchema.fromEntity);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.CREATED, type: TransferSchema })
    @RequirePermissions(Permission.ACCOUNT_TRANSFER_CREATE)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post()
    public async create(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Body() dto: MakeAccountTransferBody,
        @Req() req: UserAwareRequest,
    ): Promise<TransferSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const transfer = await this.accountService.transfer(accountId, dto);

        return TransferSchema.fromEntity(transfer);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: TransferSchema })
    @RequirePermissions(Permission.ACCOUNT_TRANSFER_CANCEL)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':transferId/cancel')
    public async cancel(
        @Param('accountId', new IdentifierPipe('accountId')) accountId: number,
        @Param('transferId', new IdentifierPipe('transferId')) transferId: number,
        @Req() req: UserAwareRequest,
    ): Promise<TransferSchema> {
        await this.accountAuthorizationService.authorize(req.user, accountId);

        const transfer = await this.accountService.cancelTransfer(accountId, transferId);

        return TransferSchema.fromEntity(transfer);
    }

}