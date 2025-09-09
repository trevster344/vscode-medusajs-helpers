export default `
    import { model } from "@medusajs/framework/utils";

    export default model.define("\${model_name}", {
        id: model.id().primaryKey()
    });
`;
