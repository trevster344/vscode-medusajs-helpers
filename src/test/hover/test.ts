const query_mock = {
    graph: {} as any,
};

const data_mock = query_mock.graph({
    entity: "subscription_plan",
    fields: ["*"],
    filters: {},
});
