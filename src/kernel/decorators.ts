import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from "@nestjs/swagger";
import { PageDto } from "./dto/page.dto.js";
import { ClassConstructor } from "class-transformer";

export const ApiPaginatedResponse = <TModel extends ClassConstructor<any>>(
    model: TModel,
) => {
    return applyDecorators(
        ApiExtraModels(PageDto),
        ApiOkResponse({
            description: "Successfully received entity list",
            schema: {
                allOf: [
                    { $ref: getSchemaPath(PageDto) },
                    {
                        properties: {
                            data: {
                                type: "array",
                                items: { $ref: getSchemaPath(model) },
                            },
                        },
                    },
                ],
            },
        }),
    );
};