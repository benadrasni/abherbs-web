import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import TextField from 'material-ui/TextField';
import Translate from 'material-ui-icons/Translate';
import Check from 'material-ui-icons/Check';

const styles = {
    col1: {
        maxWidth: '596px',
        marginLeft: '2px',
        marginRight: '2px',
        float: 'left',
        width: '100%'
    },

    col2: {
        maxWidth: '596px',
        marginLeft: '2px',
        marginRight: '2px',
        float: 'left',
        width: '100%'
    },

    card: {
        marginTop: '5px',
        marginBottom: '5px',
        height: '200px'
    },

    cardHeader: {
        fontSize: '20px'
    },

    full: {
        width: '100%'
    },

    right: {
        float: 'right'
    },

    translateIcon: {
        float: 'left',
        marginRight: '10px'
    }

};

export default class TranslateSection extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            keyString: props.keyString,
            language1: props.language1,
            language2: props.language2,
            appName: props.appName,
            valueOriginal: props.value,
            value: props.value,
            valueSource: props.valueSource,
            isChanged: false
        };
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            keyString: newProps.keyString,
            language1: newProps.language1,
            language2: newProps.language2,
            appName: newProps.appName,
            valueOriginal: newProps.value,
            value: newProps.value,
            valueSource: newProps.valueSource,
            isChanged: false
        };
    }

    handleChange = (event) => {
        let isChanged = this.state.valueOriginal !== event.target.value;
        this.setState({
            value: event.target.value,
            isChanged: isChanged
        });
    };

    handleClick = (event) => {
        // save new translation
        const that = this;

        let body = {};
        body[this.state.language1] = this.state.value;
        fetch('https://abherbs-backend.firebaseio.com/translations_app_new/' + this.state.appName + '/' + this.state.keyString + '.json', {
            method: 'PATCH',
            body: JSON.stringify(body)
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            that.setState({
                keyString: that.state.keyString,
                language1: that.state.language1,
                language2: that.state.language2,
                appName: that.state.appName,
                valueOriginal: that.state.value,
                value: that.state.value,
                valueSource: that.state.valueSource,
                isChanged: false
            });
        })
    };

    render() {
        return (
            <div>
                <div style={styles.col1}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={this.state.type}
                            titleStyle={styles.cardHeader}
                        >
                            <FloatingActionButton disabled={!this.state.value || !this.state.isChanged} secondary={true} style={styles.right} onClick={this.handleClick}>
                                <Check />
                            </FloatingActionButton>
                            <Translate style={styles.translateIcon}/>
                        </CardHeader>
                        <CardText>
                            <TextField
                                id={this.state.keyString}
                                value={this.state.value}
                                onChange={this.handleChange}
                                style={styles.full}
                                hintText={this.state.keyString}
                                multiLine={true}
                                rows={3}
                                rowsMax={4}
                            />
                        </CardText>
                    </Card>
                </div>
                <div style={styles.col2}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={this.state.keyString + ' (' + this.state.language2 + ')'}
                        />
                        <CardText>
                            <TextField
                                id={this.state.keyString + 'Source'}
                                value={this.state.valueSource}
                                style={styles.full}
                                disabled={true}
                                multiLine={true}
                                rows={3}
                                rowsMax={4}
                            />
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}