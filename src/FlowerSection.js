import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import TextField from 'material-ui/TextField';

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
        marginTop: '10px',
        marginBottom: '10px'
    },

    full: {
        width: '100%'
    }

};

export default class FlowerSection extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            type: props.type,
            language2: props.language2,
            value: props.plantTranslation,
            valueSource: props.plantTranslationSource
        };
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            type: newProps.type,
            language2: newProps.language2,
            value: newProps.plantTranslation,
            valueSource: newProps.plantTranslationSource
        };
    }

    handleChange = (event) => {
        this.setState({
            value: event.target.value,
        });
    };

    render() {
        return (
            <div>
                <div style={styles.col1}>
                    <Card style={styles.card}>
                        <CardHeader
                            title={this.state.type}
                        />
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