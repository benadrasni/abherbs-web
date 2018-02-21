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

const tableData = [
    {
        feature: 'Flowers',
        basic: plants.length,
        extended: plants.length,
    },
    {
        feature: 'Filter by color',
        basic: 'yes',
        extended: 'yes',
    },
    {
        feature: 'Filter by habitat',
        basic: 'yes',
        extended: 'yes',
    },
    {
        feature: 'Filter by petals',
        basic: 'yes',
        extended: 'yes',
    },
    {
        feature: 'Offline mode',
        basic: '',
        extended: 'yes',
    },
    {
        feature: 'Search by name',
        basic: '',
        extended: 'yes',
    },
    {
        feature: 'Search by taxonomy',
        basic: '',
        extended: 'yes',
    },
    {
        feature: 'Observations',
        basic: '',
        extended: 'yes',
    }
];

export default class VersionTable extends Component {
    state = {
        fixedHeader: true,
        stripedRows: false,
        showRowHover: false,
        selectable: false,
        multiSelectable: false,
        enableSelectAll: false,
        deselectOnClickaway: true,
        showCheckboxes: false
    };

    render() {
        return (
            <div id='download' style={styles.versionTable}>
                <Table
                    height={this.state.height}
                    fixedHeader={this.state.fixedHeader}
                    fixedFooter={this.state.fixedFooter}
                    selectable={this.state.selectable}
                    multiSelectable={this.state.multiSelectable}
                >
                    <TableHeader
                        displaySelectAll={this.state.showCheckboxes}
                        adjustForCheckbox={this.state.showCheckboxes}
                        enableSelectAll={this.state.enableSelectAll}
                    >
                        <TableRow>
                            <TableHeaderColumn colSpan="3" style={styles.tableHeader}>
                                Download application
                            </TableHeaderColumn>
                        </TableRow>
                        <TableRow>
                            <TableHeaderColumn />
                            <TableHeaderColumn style={styles.columnHeader}>Basic</TableHeaderColumn>
                            <TableHeaderColumn style={styles.columnHeader}>Plus</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={this.state.showCheckboxes}
                        deselectOnClickaway={this.state.deselectOnClickaway}
                        showRowHover={this.state.showRowHover}
                        stripedRows={this.state.stripedRows}
                    >
                        {tableData.map( (row, index) => (
                            <TableRow key={index}>
                                <TableRowColumn style={styles.rowHeader}>{row.feature}</TableRowColumn>
                                <TableRowColumn style={styles.rowBody}>{(row.basic === 'yes' && <ActionDone/>) || row.basic}</TableRowColumn>
                                <TableRowColumn style={styles.rowBody}>{(row.extended === 'yes' && <ActionDone/>) || row.extended}</TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter adjustForCheckbox={this.state.showCheckboxes}>
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