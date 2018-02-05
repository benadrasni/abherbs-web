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

export default class FlowerSection extends React.Component {

    constructor(props) {
        super(props);

        let showGT = false;
        let value = props.plantTranslationNew;
        if (!value) {
            value = props.plantTranslation;
        }
        if (!value) {
            value = props.plantTranslationGT;
            if (value) {
                showGT = true;
            }
        }
        if (!value) {
            value = '';
        }

        let valueSource = props.plantTranslationSource;
        if (!valueSource) {
            valueSource = '';
        }

        this.state = {
            type: props.type,
            language1: props.language1,
            language2: props.language2,
            plantName: props.plantName,
            valueOriginal: value,
            value: value,
            valueSource: valueSource,
            showGT: showGT,
            isChanged: false
        };
    }

    componentWillReceiveProps(newProps) {
        let showGT = false;
        let value = newProps.plantTranslationNew;
        if (!value) {
            value = newProps.plantTranslation;
        }
        if (!value) {
            value = newProps.plantTranslationGT;
            if (value) {
                showGT = true;
            }
        }
        if (!value) {
            value = '';
        }

        let valueSource = newProps.plantTranslationSource;
        if (!valueSource) {
            valueSource = '';
        }

        this.state = {
            type: newProps.type,
            language1: newProps.language1,
            language2: newProps.language2,
            plantName: newProps.plantName,
            valueOriginal: value,
            value: value,
            valueSource: valueSource,
            showGT: showGT,
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
        body[this.state.type] = this.state.value;
        fetch('https://abherbs-backend.firebaseio.com/translations_new/' + this.state.language1 + '/' + this.state.plantName + '.json', {
            method: 'PATCH',
            body: JSON.stringify(body)
        }).then(function(result) {
            return result.json();
        }).then(function(item) {
            that.setState({
                type: that.state.type,
                language1: that.state.language1,
                language2: that.state.language2,
                plantName: that.state.plantName,
                valueOriginal: that.state.value,
                value: that.state.value,
                valueSource: that.state.valueSource,
                showGT: false,
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
                            <FloatingActionButton disabled={!this.state.value || (!this.state.isChanged && !this.state.showGT)} secondary={true} style={styles.right} onClick={this.handleClick}>
                                <Check />
                            </FloatingActionButton>
                            {this.state.showGT &&
                                <Translate style={styles.translateIcon}/>
                            }
                        </CardHeader>
                        <CardText>
                            <TextField
                                id={this.state.type}
                                value={this.state.value}
                                onChange={this.handleChange}
                                style={styles.full}
                                hintText={this.state.type}
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
                            title={this.state.type + ' (' + this.state.language2 + ')'}
                        />
                        <CardText>
                            <TextField
                                id={this.state.type + 'Source'}
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