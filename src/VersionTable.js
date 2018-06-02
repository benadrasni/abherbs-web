import React, {Component} from 'react';
import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn,
} from 'material-ui/Table';
import ActionDone from 'material-ui/svg-icons/action/done';
import plants from "./plants"

const styles = {
    versionTable: {
        marginTop: '100px',
        float: 'none'
    },

    tableHeader: {
        fontSize: '36px',
        fontWeight: '700',
        lineHeight: '40px',
        letterSpacing: '-1.3px',
        textAlign: 'left'
    },

    columnHeader: {
        fontSize: '36px',
        fontWeight: '700',
        lineHeight: '40px',
        letterSpacing: '-1.3px',
        color: '#161616',
        textAlign: 'center'
    },

    rowHeader: {
        fontSize: '24px',
        fontWeight: '500'
    },

    rowBody: {
        fontSize: '24px',
        fontWeight: '500',
        textAlign: 'center'
    },

    playImage: {
        width: '100%',
        maxWidth: '258px'
    }
};

export default class VersionTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            language: props.language,
            locStrings: props.locStrings
        };
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            language: newProps.language,
            locStrings: newProps.locStrings
        };
    }

    render() {
        const tableData = [
            {
                feature: this.state.locStrings.feature_flowers,
                basic: plants.length,
                extended: plants.length,
            },
            {
                feature: this.state.locStrings.feature_filter_by_color,
                basic: 'yes',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_filter_by_habitat,
                basic: 'yes',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_filter_by_petals,
                basic: 'yes',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_filter_by_region,
                basic: 'yes',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_offline_mode,
                basic: '',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_search_by_name,
                basic: '',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_search_by_taxonomy,
                basic: '',
                extended: 'yes',
            },
            {
                feature: this.state.locStrings.feature_observations,
                basic: '',
                extended: 'yes',
            }];

        return (
            <div id='download' style={styles.versionTable}>
                <Table
                    fixedHeader={true}
                    fixedFooter={true}
                    selectable={false}
                    multiSelectable={false}
                >
                    <TableHeader
                        displaySelectAll={false}
                        adjustForCheckbox={false}
                        enableSelectAll={false}
                    >
                        <TableRow>
                            <TableHeaderColumn colSpan="3" style={styles.tableHeader}>
                                {this.state.locStrings.download_application}
                            </TableHeaderColumn>
                        </TableRow>
                        <TableRow>
                            <TableHeaderColumn />
                            <TableHeaderColumn style={styles.columnHeader}>{this.state.locStrings.app_basic}</TableHeaderColumn>
                            <TableHeaderColumn style={styles.columnHeader}>{this.state.locStrings.app_plus}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={false}
                        deselectOnClickaway={true}
                        showRowHover={false}
                        stripedRows={false}
                    >
                        {tableData.map( (row, index) => (
                            <TableRow key={index}>
                                <TableRowColumn style={styles.rowHeader}>{row.feature}</TableRowColumn>
                                <TableRowColumn style={styles.rowBody}>{(row.basic === 'yes' && <ActionDone/>) || row.basic}</TableRowColumn>
                                <TableRowColumn style={styles.rowBody}>{(row.extended === 'yes' && <ActionDone/>) || row.extended}</TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter adjustForCheckbox={false}>
                        <TableRow>
                            <TableRowColumn />
                            <TableRowColumn style={{textAlign: 'center'}}>
                                <a href="https://play.google.com/store/apps/details?id=sk.ab.herbs">
                                    <img alt='' src="./images/google-play-badge.png" style={styles.playImage} />
                                </a>
                            </TableRowColumn>
                            <TableRowColumn style={{textAlign: 'center'}}>
                                <a href="https://play.google.com/store/apps/details?id=sk.ab.herbsplus">
                                    <img alt='' src="./images/google-play-badge.png" style={styles.playImage} />
                                </a>
                            </TableRowColumn>
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        );
    }
}