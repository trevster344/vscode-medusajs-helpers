export default `
    import {
        createWorkflow,
        createStep,
        StepResponse,
        WorkflowResponse,
    } from "@medusajs/framework/workflows-sdk";
    import { MedusaError, MedusaErrorTypes } from "@medusajs/framework/utils";
    \${step_import}

    export interface WorkflowInput {
        // Add your input properties here
    }

    export const \${workflow_name} = createWorkflow(
        "\${workflow_title}",
        function (input: WorkflowInput) {
            const step1 = \${step_name}(input);

            return new WorkflowResponse(step1);
        }
    );
`;
