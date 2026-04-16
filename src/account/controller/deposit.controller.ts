import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Query,
    UseGuards
} from "@nestjs/common";
import { ApiCookieAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TransactionService } from "../service/transaction.service.js";
import { FORBIDDEN_DESCRIPTION, UNAUTHORIZED_AUTHENTICATION_DESCRIPTION } from "../../auth/config.js";
import { TransactionSchema } from "../schema/transaction.schema.js";
import { RequirePermissions } from "../../auth/decorators.js";
import { Permission } from "../../user/config.js";
import { AuthJwtGuard } from "../../auth/guard/auth.jwt.guard.js";
import { IdentifierPipe } from "../../kernel/pipe/identifier.pipe.js";
import { ApiPaginatedResponse } from "../../kernel/decorators.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";

@ApiCookieAuth()
@ApiTags('Deposit')
@Controller('deposits')
export class DepositController {

    constructor(
        private readonly transactionService: TransactionService,
    ) {}

    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Deposit not found' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: TransactionSchema })
    @RequirePermissions(Permission.DEPOSIT_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':depositId')
    public async get(
        @Param('depositId', new IdentifierPipe('depositId')) depositId: number,
    ): Promise<TransactionSchema> {
        const deposit = await this.transactionService.getDeposit(depositId);
        if (!deposit) {
            throw new NotFoundException('Deposit not found');
        }

        return TransactionSchema.fromEntity(deposit);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiPaginatedResponse(TransactionSchema)
    @RequirePermissions(Permission.DEPOSIT_LIST)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    public async paginate(
        @Query() options: PageOptionsDto,
    ): Promise<PageDto<TransactionSchema>> {
        const page = await this.transactionService.paginateDeposits(options);

        return page.mapData(TransactionSchema.fromEntity);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: TransactionSchema })
    @RequirePermissions(Permission.DEPOSIT_CANCEL)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':depositId/cancel')
    public async cancel(
        @Param('depositId', new IdentifierPipe('depositId')) depositId: number,
    ): Promise<TransactionSchema> {
        const deposit = await this.transactionService.getDeposit(depositId, { withAccount: true });
        if (!deposit) {
            throw new NotFoundException('Deposit not found');
        }

        const revert = await this.transactionService.cancelDeposit(deposit);

        return TransactionSchema.fromEntity(revert);
    }

}