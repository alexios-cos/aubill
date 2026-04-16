import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class IdentifierPipe implements PipeTransform<string, number> {

    constructor(private readonly fieldName: string) {}

    transform(value: string): number {
        const parsed = Number(value);

        if (!Number.isInteger(parsed) || parsed < 1) {
            throw new BadRequestException(
                `Parameter '${this.fieldName}' must be a positive integer`,
            );
        }

        return parsed;
    }
}