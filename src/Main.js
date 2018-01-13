import React, {Component} from 'react';
import {deepOrange500} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import AppDrawer from "./AppDrawer";
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';

const styles = {
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
    }
};

const muiTheme = getMuiTheme({
    palette: {
        accent1Color: deepOrange500,
    },
});

class Main extends Component {
    constructor(props, context) {
        super(props, context);

        this.handleRequestToggle = this.handleRequestToggle.bind(this);

        this.state = {
            drawerOpen: false
        };
    }

    handleRequestToggle() {
        this.setState({
            drawerOpen: !this.state.drawerOpen
        });
    }

    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <div style={styles.appContainer}>
                    <AppBar
                        style={styles.appToolbar}
                        title="What's that flower?"
                        iconElementLeft={
                            <IconButton onClick={this.handleRequestToggle}>
                                <NavigationMenu/>
                            </IconButton>
                        }
                    />

                    <AppDrawer
                        open={this.state.drawerOpen}
                        callbackParent={this.handleRequestToggle}
                    />

                    <div style={styles.appBody}>
                        {this.props.children}
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default Main;