import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui-icons/Menu';
import Home from 'material-ui-icons/Home';
import FileDownload from 'material-ui-icons/FileDownload';
import Translate from 'material-ui-icons/Translate';
import Help from 'material-ui-icons/Help';
import Subject from 'material-ui-icons/Subject';

const drawerWidth = 300;

export default class AppDrawer extends React.Component {

    constructor(props) {
        super(props);

        this.handleRequestToggle = this.handleRequestToggle.bind(this);

        this.state = {
            locStrings: props.locStrings,
            open: props.open
        };
    }

    componentWillReceiveProps(newProps) {
        this.state = {
            locStrings: newProps.locStrings,
            open: this.state.open
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
                    title={this.state.locStrings.app_name}
                    iconElementLeft={
                        <IconButton onClick={this.handleRequestToggle}>
                            <NavigationMenu/>
                        </IconButton>
                    }
                />
                <MenuItem href="/" primaryText={this.state.locStrings.menu_home} leftIcon={<Home />} onClick={this.handleRequestToggle} />
                <MenuItem href="/#download" primaryText={this.state.locStrings.menu_download} leftIcon={<FileDownload />} onClick={this.handleRequestToggle} />
                <MenuItem href="/translate_flower" primaryText={this.state.locStrings.menu_translate_flower} leftIcon={<Translate />} onClick={this.handleRequestToggle} />
                <MenuItem href="/translate_app" primaryText={this.state.locStrings.menu_translate_app} leftIcon={<Translate />} onClick={this.handleRequestToggle} />
                <MenuItem href="/help" primaryText={this.state.locStrings.menu_help} leftIcon={<Help />} onClick={this.handleRequestToggle} />
                <MenuItem href="/about" primaryText={this.state.locStrings.menu_about} leftIcon={<Subject />} onClick={this.handleRequestToggle} />
            </Drawer>
        );
    }
}