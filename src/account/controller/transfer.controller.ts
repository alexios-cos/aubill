import {
    BadRequestException,
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
import { FORBIDDEN_DESCRIPTION, UNAUTHORIZED_AUTHENTICATION_DESCRIPTION } from "../../auth/config.js";
import { ApiPaginatedResponse } from "../../kernel/decorators.js";
import { RequirePermissions } from "../../auth/decorators.js";
import { Permission } from "../../user/config.js";
import { AuthJwtGuard } from "../../auth/guard/auth.jwt.guard.js";
import { PageOptionsDto } from "../../kernel/dto/page-options.dto.js";
import { PageDto } from "../../kernel/dto/page.dto.js";
import { TransferSchema } from "../schema/transfer.schema.js";
import { TransferService } from "../service/transfer.service.js";
import { IdentifierPipe } from "../../kernel/pipe/identifier.pipe.js";

@ApiCookieAuth()
@ApiTags('Transfer')
@Controller('transfers')
export class TransferController {

    constructor(
        private readonly transferService: TransferService,
    ) {}

    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Transfer not found' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.OK, type: TransferSchema })
    @RequirePermissions(Permission.TRANSFER_GET)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get(':transferId')
    public async get(
        @Param('transferId', new IdentifierPipe('transferId')) transferId: number,
    ): Promise<TransferSchema> {
        const transfer = await this.transferService.get(transferId);
        if (!transfer) {
            throw new NotFoundException('Transfer not found');
        }

        return TransferSchema.fromEntity(transfer);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiPaginatedResponse(TransferSchema)
    @RequirePermissions(Permission.TRANSFER_LIST)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Get()
    public async paginate(
        @Query() options: PageOptionsDto,
    ): Promise<PageDto<TransferSchema>> {
        const page = await this.transferService.paginate(options);

        return page.mapData(TransferSchema.fromEntity);
    }

    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: UNAUTHORIZED_AUTHENTICATION_DESCRIPTION })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    @ApiResponse({ status: HttpStatus.OK, type: TransferSchema })
    @RequirePermissions(Permission.TRANSFER_CANCEL)
    @UseGuards(AuthJwtGuard)
    @HttpCode(HttpStatus.OK)
    @Post(':transferId/cancel')
    public async cancel(
        @Param('transferId', new IdentifierPipe('transferId')) transferId: number,
    ): Promise<TransferSchema> {
        let transfer = await this.transferService.get(transferId, { withDonor: true, withRecipient: true });

        if (!transfer) {
            throw new BadRequestException('Transfer not found');
        }

        transfer = await this.transferService.cancel(transfer);

        return TransferSchema.fromEntity(transfer);
    }

}