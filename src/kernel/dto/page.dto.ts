import { PageMetaDto } from "./page/page-meta.dto.js";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray } from "class-validator";

export class PageDto<T> {

    @IsArray()
    @ApiProperty()
    public readonly data: T[];

    @ApiProperty({ type: () => PageMetaDto })
    public readonly meta: PageMetaDto;

    constructor(data: T[], meta: PageMetaDto) {
        this.data = data;
        this.meta = meta;
    }

    public mapData<U>(mapper: (item: T) => U): PageDto<U> {
        return new PageDto(this.data.map(mapper), this.meta);
    }

}