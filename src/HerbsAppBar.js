import React from 'react';
import AppBar from 'material-ui/AppBar';
import AppDrawer from "./AppDrawer";

function handleLeftIconTouchTap() {
    AppDrawer.handleToggle;
}

export default class HerbsAppBar extends React.Component {

    render() {
        return (
            <AppBar
                title="What's that flowers?"
                onLeftIconButtonTouchTap={handleLeftIconTouchTap}
            />
        );
    }

}
