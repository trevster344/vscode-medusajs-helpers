export default `
    import { MedusaContainer } from "@medusajs/framework/types";

    export default async function \${job_name}(container: MedusaContainer) {
        // TODO:: SETUP JOB
    }

    export const config = {
        name: "new-job",
        schedule: "* * * * *"
    };
`;
