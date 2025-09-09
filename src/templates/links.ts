export default `
    import ModuleB from "../";
    import ModuleA from "../";
    import { defineLink } from "@medusajs/framework/utils";

    export default defineLink(
        ModuleA.linkable.EntityA,
        ModuleB.linkable.EntityB
    );
`;
