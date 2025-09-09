export default `
    import { SubscriberArgs } from "@medusajs/framework";

    export default async function \${method_name}({
        event,
        container,
    }: SubscriberArgs<any>): Promise<void> {
        // TODO:: DO SOMETHING HERE

         
    }
`;
