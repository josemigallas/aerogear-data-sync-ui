import React, { Component } from "react";
import { graphql } from "react-apollo";
import {
    Form,
    FormGroup,
    Button,
    EmptyState,
    EmptyStateIcon,
    EmptyStateTitle
} from "patternfly-react";

import { DataSourcesDropDown } from "./DataSourcesDropDown";
import { MappingTemplateDropDown } from "./MappingTemplateDropDown";
import { HookFormGroup } from "./HookFormGroup";
import { getTemplatesForDataSource, getTemplateValue } from "./MappingTemplates";

import UpsertResolver from "../../graphql/UpsertResolver.graphql";
import GetSchema from "../../graphql/GetSchema.graphql";
import GetResolvers from "../../graphql/GetResolvers.graphql";

import {
    detailHeader, detailFormsContainer, learnMore, detailFormsHeader, formContainer,
    detailFormGroup, detailButtonFooter, buttonSave, detailEmpty, emptyTitle
} from "./ResolverDetail.css";

const INITIAL_STATE = {
    resolver: null,
    requestMappingTemplate: "Custom",
    responseMappingTemplate: "Custom",
    isResolverSaved: true,
    requestMappingTemplates: {},
    responseMappingTemplates: {},
    err: ""
};
console.log("IMPORT", HookFormGroup);
class ResolverDetail extends Component {

    constructor(props) {
        super(props);
        this.state = INITIAL_STATE;
    }

    componentWillReceiveProps({ resolver }) {
        if (this.props.resolver !== resolver) {
            this.setState({ ...INITIAL_STATE, resolver });
        }
    }

    updateResolver(newProps) {
        const { resolver } = this.state;
        const { onResolverEdit } = this.props;

        onResolverEdit({ isResolverSaved: false });
        this.setState({ isResolverSaved: false, resolver: { ...resolver, ...newProps } });
    }

    save() {
        const { onResolverEdit } = this.props;
        this.upsertResolver()
            .then(() => {
                onResolverEdit({ isResolverSaved: true });
                this.setState({ isResolverSaved: true });
            })
            .catch(err => console.log(err));
    }

    upsertResolver() {
        const { resolver } = this.state;
        const { id, schemaId, DataSource, type, field, requestMapping, responseMapping } = resolver;

        return this.props.mutate({
            variables: {
                id,
                schemaId,
                dataSourceId: DataSource.id,
                type,
                field,
                requestMapping,
                responseMapping
            },
            refetchQueries: [
                { query: GetSchema, variables: { name: "default" } },
                { query: GetResolvers, variables: { schemaId, type } }
            ]
        });
    }

    onDataSourceChanged(ds) {
        const requestMappingTemplates = getTemplatesForDataSource(ds, "requestMapping");
        const responseMappingTemplates = getTemplatesForDataSource(ds, "responseMapping");

        const { resolver } = this.state;

        if (resolver) {
            resolver.DataSource = ds;
            this.setState({ resolver, requestMappingTemplates, responseMappingTemplates });
        }
    }

    onTemplateChanged(type, template) {
        const { resolver } = this.state;
        const { DataSource } = resolver;
        const templateValue = getTemplateValue(DataSource, type, template);

        if (resolver) {
            resolver[type] = templateValue;
            this.setState({
                resolver,
                resolverSaved: false,
                [`${type}Template`]: template
            });
        }
    }

    renderEmptyScreen() {
        return (
            <EmptyState className={detailEmpty}>
                <EmptyStateIcon name="info" />
                <EmptyStateTitle className={emptyTitle}>
                    Select an item to view and edit its details
                </EmptyStateTitle>
            </EmptyState>
        );
    }

    render() {
        const { resolver, requestMappingTemplate, responseMappingTemplate, isResolverSaved
        , responseMappingTemplates, requestMappingTemplates
        } = this.state;

        if (!resolver) {
            return this.renderEmptyScreen();
        }

        const { field, type, DataSource, requestMapping, responseMapping } = resolver;

        return (
            <React.Fragment>
                <h3 className={detailHeader}>Edit {type}.{field}</h3>
                <div className={detailFormsContainer}>
                    <h3 className={detailFormsHeader}>Resolver
                        <span className={learnMore}>
                            <a href="https://www.google.es">Learn More <span className="fa fa-external-link" /></a>
                        </span>
                    </h3>

                    <Form horizontal className={formContainer}>
                        <FormGroup controlId="dataSource" className={detailFormGroup}>
                            <DataSourcesDropDown
                                selected={DataSource}
                                onDataSourceSelect={ds => this.onDataSourceChanged(ds)}
                            />
                        </FormGroup>

                        <FormGroup controlId="requestMapping" className={detailFormGroup}>
                            <MappingTemplateDropDown
                                label="Request Mapping Template"
                                template={requestMappingTemplate}
                                templates={requestMappingTemplates}
                                text={requestMapping}
                                onTemplateSelect={t => this.onTemplateChanged("requestMapping", t)}
                                onTextChange={t => this.updateResolver({ requestMapping: t })}
                            />
                        </FormGroup>

                        <FormGroup controlId="responseMapping" className={detailFormGroup}>
                            <MappingTemplateDropDown
                                label="Response Mapping Template"
                                template={responseMappingTemplate}
                                templates={responseMappingTemplates}
                                text={responseMapping}
                                onTemplateSelect={t => this.onTemplateChanged("responseMapping", t)}
                                onTextChange={t => this.updateResolver({ responseMapping: t })}
                            />
                        </FormGroup>

                        <FormGroup controlId="preHook" className={detailFormGroup}>
                            <HookFormGroup
                                label="Pre Hook"
                                url={preHook}
                                onChange={h => this.updateResolver({ preHook: h })}
                            />
                        </FormGroup>

                        <FormGroup controlId="postHook" className={detailFormGroup}>
                            <HookFormGroup
                                label="Post Hook"
                                url={postHook}
                                onChange={h => this.updateResolver({ postHook: h })}
                            />
                        </FormGroup>
                    </Form>
                </div>

                <div className={detailButtonFooter}>
                    <Button
                        className={buttonSave}
                        bsStyle="primary"
                        onClick={() => this.save()}
                        disabled={isResolverSaved}
                    >
                        Save
                    </Button>
                    {/* <Button bsStyle="default" onClick={() => console.log("cancel")}>Cancel</Button> */}
                </div>

            </React.Fragment>
        );
    }

}

const ResolverDetailWithMutation = graphql(UpsertResolver)(ResolverDetail);

export { ResolverDetailWithMutation as ResolverDetail };
