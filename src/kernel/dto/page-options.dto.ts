import { SortOrder } from "../config.js";
import { IsEnum, IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class PageOptionsDto {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    @ApiPropertyOptional({
        minimum: 1,
        default: 1,
    })
    public readonly page: number = 1;

    @Type(() => Number)
    @IsInt()
    @Max(50)
    @Min(1)
    @IsOptional()
    @ApiPropertyOptional({
        minimum: 1,
        maximum: 50,
        default: 10,
    })
    public readonly take: number = 10;

    @IsEnum(SortOrder)
    @IsOptional()
    @ApiPropertyOptional({
        enum: SortOrder,
        default: SortOrder.ASC,
    })
    public readonly order: SortOrder = SortOrder.ASC;

    get skip(): number {
        return (this.page - 1) * this.take;
    }

}