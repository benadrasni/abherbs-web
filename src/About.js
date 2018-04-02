import React from 'react';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import languages from "./languages";

const styles = {
    flowerTranslation: {
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

    cardWizard: {
        marginTop: '10px',
        marginBottom: '10px',
        height: 'auto'
    },

    card: {
        marginTop: '10px',
        marginBottom: '10px'
    },

    cardHeader: {
        fontSize: '20px'
    },

    sectionHeader: {
        fontSize: '18px',
        fontWeight: '200',
        textAlign: 'left',
        paddingLeft: '10px'
    },

    full: {
        width: '100%'
    },

    lessThanHalf: {
        width: '40%'
    },

    right: {
        float: 'right'
    },

    thanks: {
        textAlign: 'center',
        fontSize: '20px',
        fontWeight: '300'
    }

};

class Help extends React.Component {

    constructor(props) {
        super(props);

        let userLanguage = (navigator.languages && navigator.languages[0]) || navigator.language;
        if (userLanguage) {
            let dividerPos = userLanguage.indexOf("-");
            if (dividerPos > 0) {
                userLanguage = userLanguage.substring(0, dividerPos)
            }
            if (Object.keys(languages).indexOf(userLanguage) === -1) {
                userLanguage = 'en';
            }
        } else {
            userLanguage = 'en';
        }

        this.state = {

        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <div id='help' style={styles.flowerTranslation}>
                <div style={styles.header}>
                    Help
                </div>
                <div style={styles.col}>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title="Straight forward scenario:"
                        />
                        <CardText>
                            <li>Choose color of the flower by clicking on image.</li>
                            <li>Choose habitat by clicking on image.</li>
                            <li>Choose number of petals by clicking on image.</li>
                            <li>Choose flower from the list.</li>
                            <li>Read about flower, check other images.</li>
                            <li>Go back, choose another one until you'll find right one.</li>
                            <li>Go back to the filter screen and choose different color, locality or number of petals.</li>
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title="Jumping around scenario:"
                        />
                        <CardText>
                            You can jump between filter screens through left drawer where you can also see chosen values of attributes. When
                            filter screen is loaded value of bounded attribute is deleted from the current filter. Counter in bottom right
                            corner will show you how many flowers fulfil chosen criteria. Once you have set all three attributes scrollable list
                            of flowers appears. If counter shows less than 21 flowers you can jump right to the list by pressing counter without
                            setting remaining attributes. Long press on counter will clear the filter.
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title="Available actions:"
                        />
                        <CardText>
                            <li>Touch on picture in filter screen will set value for correspondent attribute and jump to the next filter screen if attribute without value exists, otherwise it will jump to list of flowers which fulfill the filter.</li>
                            <li>Touch on image in the list of flowers will display flower's details.</li>
                            <li>Touch on thumbnail picture on the screen with details will display bigger picture bellow.</li>
                            <li>Touch on illustration will display illustration on full screen.</li>
                            <li>Touch on counter display list of flowers. It is allowed only when counter value is less than 21.</li>
                            <li>Long touch on counter will clear the filter.</li>
                            <li>Swipe from left or press on "hamburger" button display left drawer.</li>
                            <li>Touch on one of filter options in drawer will display correspondent filter screen. Value of bounded attribute is deleted from the filter.</li>
                            <li>Touch on <b>Preferences</b> option in drawer will display Preferences.</li>
                            <li>Touch on <b>Feedback</b> option in drawer will offer opportunity to correct typos, mistakes, submit new translation or any other feedback.</li>
                            <li>Touch on <b>Help</b> option in drawer will display Help (this screen).</li>
                            <li>Touch on <b>About</b> option in drawer will display About application screen.</li>

                            <h4>Only in extended (+) version:</h4>

                            <li>Touch Search icon on filter screen will display screen for searching in flower's names (latin and native).</li>
                            <li>Writing text to search box will display all names which contains already written text.</li>
                            <li>Touch "APG IV" icon on search screen will display screen for searching in taxonomy.</li>
                            <li>Writing text to search box will display all taxons which contains already written text.</li>
                        </CardText>
                    </Card>
                    <Card style={styles.cardWizard}>
                        <CardHeader
                            title="Preferences:"
                        />
                        <CardText>
                            <li>Preferred language: Choose preferred language.</li>
                            <li>Cache size in MB (for photos and illustrations): set cache for downloaded photos and illustrations (default 50 MB).</li>

                            <h4>Only in extended (+) version:</h4>

                            <li>Offline mode: Download pictures and data to device (requires 250+ MB additional space).</li>
                        </CardText>
                    </Card>
                    <Card style={styles.card}>
                        <CardHeader
                            title="Localization:"
                        />
                        <CardText>
                            <p>
                                Application takes localization from the device on which it's running. Unsupported localization display texts from default localization (English).
                            </p>

                            <p>
                                Information about flowers which are displayed on detail screen is different issue. Many languages are supported for
                                flower's names and taxonomy. Latin names are displayed if localized names is missing. Other texts are downloaded
                                from a server and translated to locale language using Google Translate if necessary. You can see information about
                                using Google translate below description. Touch left button to show original English texts. Touch left button again
                                to see localized texts. Touch right button to send suggestion for better translation to developer.
                            </p>
                        </CardText>
                    </Card>
                </div>
            </div>
        );
    }
}

export default Help;