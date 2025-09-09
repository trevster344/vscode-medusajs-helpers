export default `
    import {
        MedusaRequest,
        MedusaResponse,
        validateAndTransformBody,
        validateAndTransformQuery
    } from "@medusajs/framework/http";
    import {
        ContainerRegistrationKeys,
        MedusaError,
        Modules,
        remoteQueryObjectFromString,
    } from "@medusajs/framework/utils";
    import z from "zod";

    // GET

    export const GET = async (
        req: MedusaRequest,
        res: MedusaResponse
    ): Promise<void> => {
        
    };

    // POST

    export const POST = async (
        req: MedusaRequest,
        res: MedusaResponse
    ): Promise<void> => {
        
    };

    // DELETE

    export const DELETE = async (
        req: MedusaRequest,
        res: MedusaResponse
    ): Promise<void> => {
        
    };

    // PUT

    export const PUT = async (
        req: MedusaRequest,
        res: MedusaResponse
    ): Promise<void> => {
        
    };

    // PATCH

    export const PATCH = async (
        req: MedusaRequest,
        res: MedusaResponse
    ): Promise<void> => {
        
    };
`;
