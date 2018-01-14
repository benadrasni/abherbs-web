import React from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import NavigationMenu from 'material-ui/svg-icons/navigation/menu';
import ActionHome from 'material-ui/svg-icons/action/home';
import FileDownload from 'material-ui/svg-icons/file/file-download';
import ActionList from 'material-ui/svg-icons/action/list';
import ActionTranslate from 'material-ui/svg-icons/action/translate';
import MapsLocalFlorist from 'material-ui/svg-icons/maps/local-florist';

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
                <MenuItem href="/#home" primaryText="Home" leftIcon={<ActionHome />} onClick={this.handleRequestToggle} />
                <MenuItem href="/#download" primaryText="Download" leftIcon={<FileDownload />} onClick={this.handleRequestToggle} />
                {/*<MenuItem href="/flowers" primaryText="Flowers" leftIcon={<MapsLocalFlorist />} />*/}
                {/*<MenuItem primaryText="Taxonomy" leftIcon={<ActionList />} />*/}
                {/*<MenuItem primaryText="Translation" leftIcon={<ActionTranslate />} />*/}
            </Drawer>
        );
    }
}