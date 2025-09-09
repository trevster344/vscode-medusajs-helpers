export const index = `
    import { Module } from "@medusajs/framework/utils";
    import ServiceModule from "./service";
    import Loader from "./loader";

    export const MODULE_NAME = "\${module_name_lower}";

    export default Module(MODULE_NAME, {
        service: ServiceModule,
        loaders: [Loader],
    });
`;

export const service = `
    import {
        MedusaError,
        MedusaErrorTypes,
        MedusaService,
    } from "@medusajs/framework/utils";
    import YourModel from "./models/model";
    export default class \${module_name}Module extends MedusaService({
        YourModel,
    }) {}
`;

export const loader = `
    export default async function ({
        container,
        logger
    }) {
        // TODO:: Add your loader logic here        
    }
`;

export const model = `
    import { model } from "@medusajs/framework/utils";

    export default YourModel = model.define("your_model", {
        id: model.id().primaryKey()
    });
`;
