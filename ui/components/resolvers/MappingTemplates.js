import { DataSourceType } from "../../graphql/types/DataSourceType";

const defaultTemplates = { Custom: "" };

const InMemoryQuery = `
{
  "operation": "find", "query": {
    "_type":"<type>", "<id>": "{{context.parent.id}}"
  }
}
`;

const InMemoryResponse = `
{{ toJSON (convertNeDBIds context.result) }}
`;

const PostgresQuery = `
SELECT * FROM <table> WHERE <id>='{{context.parent.id}}'
`;

const PostgresResponse = `
{{ toJSON context.result }}
`;

const Templates = {
    [DataSourceType.InMemory]: {
        requestMapping: {
            ...defaultTemplates,
            "In Memory Query": InMemoryQuery
        },
        responseMapping: {
            ...defaultTemplates,
            "In Memory Response": InMemoryResponse
        }
    },
    [DataSourceType.Postgres]: {
        requestMapping: {
            ...defaultTemplates,
            "Postgres Query": PostgresQuery
        },
        responseMapping: {
            ...defaultTemplates,
            "Postgres Response": PostgresResponse
        }
    }
};

const getTemplatesForDataSource = (ds, type) => {
    if (!ds) {
        return {};
    }

    return Templates[ds.type][type] || {};
};

const getTemplateValue = (ds, type, key) => {
    if (!ds) {
        return "";
    }

    return Templates[ds.type][type][key];
};

export { getTemplatesForDataSource, getTemplateValue };
