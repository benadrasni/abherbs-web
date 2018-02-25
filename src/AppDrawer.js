import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui-icons/Menu';
import ActionHome from 'material-ui-icons/Home';
import FileDownload from 'material-ui-icons/FileDownload';
import ActionTranslate from 'material-ui-icons/Translate';

const drawerWidth = 300;

export default class AppDrawer extends React.Component {

    constructor(props) {
        super(props);

        this.handleRequestToggle = this.handleRequestToggle.bind(this);

        this.state = {
            open: props.open
        };
    }

    handleRequestToggle() {
        this.setState({
            open: false
        });
        this.props.callbackParent(false);
    }

    render() {
        return (
            <Drawer width={drawerWidth} open={this.props.open}>
                <AppBar
                    title="What's that flower?"
                    iconElementLeft={
                        <IconButton onClick={this.handleRequestToggle}>
                            <NavigationMenu/>
                        </IconButton>
                    }
                />
                <MenuItem href="/" primaryText="Home" leftIcon={<ActionHome />} onClick={this.handleRequestToggle} />
                <MenuItem href="/#download" primaryText="Download" leftIcon={<FileDownload />} onClick={this.handleRequestToggle} />
                <MenuItem href="/translate_flower" primaryText="Translate flower" leftIcon={<ActionTranslate />} onClick={this.handleRequestToggle} />
                <MenuItem href="/translate_app" primaryText="Translate application" leftIcon={<ActionTranslate />} onClick={this.handleRequestToggle} />
            </Drawer>
        );
    }
}