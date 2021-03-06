import React, { Component } from "react";
import {
    ListViewItem, Grid, Row, Col
} from "patternfly-react";

import styles from "./TypeList.css";

import { formatType } from "../../helper/GraphQLFormatters";

class TypeList extends Component {

    renderAdditionalInfo({ fields }) {
        if (fields && fields.length) {
            return (
                <span key="Fields">
                    <span style={{ fontWeight: "600" }}>{fields.length}</span>
                    <span style={{ fontWeight: "300" }}>{fields.length !== 1 ? " Fields" : " Field"}</span>
                </span>
            );
        }
        return "n.a.";
    }

    renderFields(fields) {
        if (!fields) {
            // Some types won't have fields
            return <span>No fields</span>;
        }

        return fields.map(field => {
            const { structureItemRow } = styles;
            const type = field.type.name || field.type.kind;
            return (
                <Row key={type + field.name} className={structureItemRow}>
                    <Col xs={8}>{field.name}</Col>
                    <Col xs={4}>{formatType(field.type)}</Col>
                </Row>
            );
        });
    }

    render() {
        const { type } = this.props;
        const { structureHeading, structureFieldRow, structureListItem } = styles;
        const subItems = this.renderFields(type.fields);

        return (
            <ListViewItem
                key={type.name}
                className={structureListItem}
                leftContent={<div className={structureHeading}>{type.name}</div>}
                hideCloseIcon
                additionalInfo={[this.renderAdditionalInfo(type)]}
            >
                <Grid fluid>
                    <Row className={structureFieldRow}>
                        <Col xs={8}>Field</Col>
                        <Col xs={4}>Type</Col>
                    </Row>
                    {subItems}
                </Grid>
            </ListViewItem>
        );
    }

}

export { TypeList };
