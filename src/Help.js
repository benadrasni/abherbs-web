import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';

const styles = {
    help: {
        maxWidth: '1200px',
        height: 'auto',
        overflow: 'auto',
        margin: '0 auto'
    },

    header: {
        marginTop: '50px',
        fontSize: '36px',
        fontWeight: '700',
        color: '#9E9E9E',
        lineHeight: '40px',
        letterSpacing: '-1.3px',
        textAlign: 'left',
        paddingLeft: '24px'
    },

    col: {
        maxWidth: '1196px',
        paddingLeft: '2px',
        paddingRight: '2px',
        float: 'left',
        width: '100%'
    },

    cardWizard: {
        marginTop: '10px',
        marginBottom: '10px',
        height: 'auto'
    },

    video: {
        width: '560px',
        height: '315px',

        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        margin: 'auto'
    }
};

class Help extends React.Component {

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
        return (
            <div id='help' style={styles.help}>
                <div style={styles.header}>
                    {this.state.locStrings.menu_help}
                </div>
                <div style={styles.video}>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/8xL7QMXT0WE" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div style={styles.col}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.help1_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.help1_text}} />
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.help2_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.help2_text}} />
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.help3_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.help3_text}} />
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.help4_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.help4_text}} />
                        </CardText>
                    </Card>
                    <Card style={styles.card}>
                        <CardHeader
                            title={this.state.locStrings.help5_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.help5_text}} />
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Help;