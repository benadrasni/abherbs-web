import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui-icons/Menu';
import ActionHome from 'material-ui-icons/Home';
import FileDownload from 'material-ui-icons/FileDownload';
import ActionList from 'material-ui-icons/List';
import ActionTranslate from 'material-ui-icons/Translate';
import MapsLocalFlorist from 'material-ui-icons/LocalFlorist';

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
                <MenuItem href="#home" primaryText="Home" leftIcon={<ActionHome />} onClick={this.handleRequestToggle} />
                <MenuItem href="#download" primaryText="Download" leftIcon={<FileDownload />} onClick={this.handleRequestToggle} />
                {/*<MenuItem href="/flowers" primaryText="Flowers" leftIcon={<MapsLocalFlorist />} />*/}
                {/*<MenuItem primaryText="Taxonomy" leftIcon={<ActionList />} />*/}
                <MenuItem href="#translate_flower" primaryText="Translation" leftIcon={<ActionTranslate />} onClick={this.handleRequestToggle} />
            </Drawer>
        );
    }
}