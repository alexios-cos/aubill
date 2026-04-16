import { PageOptionsDto } from "../page-options.dto.js";
import { ApiProperty } from "@nestjs/swagger";

export interface PageMetaDtoParameters {
    options: PageOptionsDto
    itemCount: number
}

export class PageMetaDto {

    @ApiProperty()
    public readonly page: number;

    @ApiProperty()
    public readonly take: number;

    @ApiProperty()
    public readonly itemCount: number;

    @ApiProperty()
    public readonly pageCount: number;

    @ApiProperty()
    public readonly hasPreviousPage: boolean;

    @ApiProperty()
    public readonly hasNextPage: boolean;

    constructor({ options, itemCount }: PageMetaDtoParameters) {
        this.page = options.page;
        this.take = options.take;
        this.itemCount = itemCount;
        this.pageCount = Math.ceil(this.itemCount / this.take);
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.pageCount;
    }

}