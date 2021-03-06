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
        display: 'inline-block',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '150px'
    },

    appStore: {
        display: 'inline-block',
        overflow: 'hidden',
        background: 'url(https://linkmaker.itunes.apple.com/en-us/badge-lrg.svg?releaseDate=2019-01-21&kind=iossoftware&bubble=ios_apps) no-repeat',
        width: '135px',
        height: '40px'
    }
};

export default class VersionTable extends Component {

    constructor(props) {
        super(props);

        this.state = {
            language: props.language,
            locStrings: props.locStrings,
            plantsCount: props.plantsCount
        };
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            language: newProps.language,
            locStrings: newProps.locStrings,
            plantsCount: newProps.plantsCount
        };
    }

    render() {
        const tableData = [
            {
                feature: this.state.locStrings.feature_flowers,
                basic: this.state.plantsCount,
            },
            {
                feature: this.state.locStrings.feature_filter_by_color,
                basic: 'yes',
            },
            {
                feature: this.state.locStrings.feature_filter_by_habitat,
                basic: 'yes',
            },
            {
                feature: this.state.locStrings.feature_filter_by_petals,
                basic: 'yes',
            },
            {
                feature: this.state.locStrings.feature_filter_by_region,
                basic: 'yes',
            },
            {
                feature: this.state.locStrings.feature_favorite_flowers,
                basic: 'yes',
            },
            {
                feature: this.state.locStrings.feature_configurable_filter,
                basic: '$',
            },
            {
                feature: this.state.locStrings.feature_offline_mode,
                basic: '$',
            },
            {
                feature: this.state.locStrings.feature_search_by_name,
                basic: '$',
            },
            {
                feature: this.state.locStrings.feature_search_by_taxonomy,
                basic: '$',
            },
            {
                feature: this.state.locStrings.feature_observations,
                basic: '$',
            },
            {
                feature: this.state.locStrings.feature_search_by_photo,
                basic: '$',
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
                            <TableHeaderColumn style={styles.tableHeader}>
                                {this.state.locStrings.download_application}
                            </TableHeaderColumn>
                            <TableHeaderColumn style={{textAlign: 'center'}}>
                                <a href="https://play.google.com/store/apps/details?id=sk.ab.herbs">
                                    <img alt='' src="./images/google-play-badge.png" style={styles.playImage} />
                                </a>
                            </TableHeaderColumn>
                            <TableHeaderColumn style={{textAlign: 'center'}}>
                                <a href="https://itunes.apple.com/us/app/whats-that-flower/id1449982118?mt=8" style={styles.appStore} >
                                </a>
                            </TableHeaderColumn>
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
                                <TableRowColumn colSpan={2} style={styles.rowBody}>{(row.basic === 'yes' && this.state.locStrings.app_basic) || row.basic}</TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter adjustForCheckbox={false}>
                        <TableRow>
                            <TableRowColumn />
                            <TableRowColumn />
                        </TableRow>
                    </TableFooter>
                </Table>
            </div>
        );
    }
}