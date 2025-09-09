export default `
    import {
        createStep,
        StepResponse
    } from "@medusajs/framework/workflows-sdk";
    import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";

    export const \${step_name} = createStep(
        "\${step_title}",
        async (
            input: any,
            { container }
        ) => {

            return new StepResponse(true);
        }
    );
`;
