import React, {Component} from 'react';
import {Route} from 'react-router';
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import AppDrawer from "./AppDrawer";
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import languages from "./languages";
import LandingPage from "./LandingPage";
import TranslateFlower from "./TranslateFlower";
import Help from "./Help";
import About from "./About";
import TranslateApp from "./TranslateApp";

const styles = theme => ({
    container: {
        maxWidth: '1200px',
        height: 'auto',
        overflow: 'auto',
        margin: '0 auto'
    },

    appContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        position: 'absolute',
        flexDirection: 'column'
    },

    appToolbar: {
        flex: '0 0 auto'
    },

    appBody: {
        overflowX: 'hidden',
        overflowY: 'auto'
    },

    languages: {
        background: theme.palette.primary1Color,
        color: theme.palette.alternateTextColor
    }
});

const muiTheme = getMuiTheme({
    palette: {
        accent1Color: deepOrange500,
    },
});

class Main extends Component {
    constructor(props, context) {
        super(props, context);

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

        this.handleRequestToggle = this.handleRequestToggle.bind(this);

        this.state = {
            initialized: false,
            drawerOpen: false,
            language: userLanguage,
            locStrings: {}
        };
    }

    loadTranslations(language) {
        const that = this;

        fetch('https://abherbs-backend.firebaseio.com/web/' + language + '.json')
            .then(function(result) {
                return result.json();
            }).then(function(item) {
                that.setState({
                    initialized: true,
                    drawerOpen: that.state.drawerOpen,
                    language: language,
                    locStrings: item
                });
            })
    }

    componentDidMount() {
        this.loadTranslations(this.state.language);
    }

    handleRequestToggle() {
        this.setState({
            initialized: this.state.initialized,
            drawerOpen: !this.state.drawerOpen,
            language: this.state.language,
            locStrings: this.state.locStrings
        });
    }

    handleLanguageChange = (event, index, value) => {
        this.loadTranslations(value);
    };

    render() {
        return <MuiThemeProvider muiTheme={muiTheme}>
            <div style={styles.appContainer}>
                <AppBar
                    style={styles.appToolbar}
                    title={this.state.locStrings.app_name}
                    iconElementLeft={
                        <IconButton onClick={this.handleRequestToggle}>
                            <NavigationMenu/>
                        </IconButton>
                    }
                >
                    <Toolbar style={styles(muiTheme).languages}>
                        <SelectField
                            style={styles(muiTheme).languages}
                            labelStyle={styles(muiTheme).languages}
                            value={this.state.language}
                            onChange={this.handleLanguageChange}
                        >
                            {Object.keys(languages).map((code) => (
                                <MenuItem key={code} value={code} primaryText={languages[code]}/>
                            ))}
                        </SelectField>
                    </Toolbar>
                </AppBar>

                {this.state && this.state.initialized &&
                    <AppDrawer
                        language={this.state.language}
                        locStrings={this.state.locStrings}
                        open={this.state.drawerOpen}
                        callbackParent={this.handleRequestToggle}
                    />
                }

                {this.state && this.state.initialized &&
                    <div style={styles.appBody}>
                        <Route exact path="/" render={({ match, location })=><LandingPage match={match} location={location} language={this.state.language} locStrings={this.state.locStrings}/>} />
                        <Route exact path="/translate_flower" render={({ match, location })=><TranslateFlower match={match} location={location} language={this.state.language} locStrings={this.state.locStrings}/>} />
                        <Route exact path="/translate_app" render={({ match, location })=><TranslateApp match={match} location={location} language={this.state.language} locStrings={this.state.locStrings}/>} />
                        <Route exact path="/help" render={({ match, location })=><Help match={match} location={location} language={this.state.language} locStrings={this.state.locStrings}/>} />
                        <Route exact path="/about" render={({ match, location })=><About match={match} location={location} language={this.state.language} locStrings={this.state.locStrings}/>} />
                    </div>
                }
            </div>
        </MuiThemeProvider>;
    }
}

export default Main;