import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';

const styles = {
    about: {
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
            <div id='help' style={styles.about}>
                <div style={styles.header}>
                    {this.state.locStrings.menu_about}
                </div>
                <div style={styles.col}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.about_purpose_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.about_purpose_text}} />
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.about_sources_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.about_sources_text}} />
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title={this.state.locStrings.about_credits_title}
                        />
                        <CardText>
                            <div dangerouslySetInnerHTML={{__html: this.state.locStrings.about_credits_text}} />
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Help;