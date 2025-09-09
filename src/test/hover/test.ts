const query_service = {
    graph: {} as any,
};

const customers_to_demo = query_service.graph({
    entity: "subscription_plan",
    fields: ["*"],
    filters: {},
});
