import React, { FunctionComponent } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline/CssBaseline';
import AppBar from '@material-ui/core/AppBar/AppBar';
import clsx from 'clsx';
import {
    Toolbar,
    IconButton,
    Typography,
    Divider,
    List,
    ListItem,
    Drawer,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import MenuIcon from '@material-ui/core/SvgIcon/SvgIcon';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import SettingsIcon from '@material-ui/icons/Settings';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { NavLink } from 'react-router-dom';
import styled from '@emotion/styled';

import { useStyles, theme } from '../../utils/initialTheme';

type Props = {};

const Menu = styled.div`
    a {
        color: inherit;
        text-decoration: none;
        &.active {
            color: #f05326;
            svg {
                color: #f05326;
            }
        }
    }
`;

export const WrapperApp: FunctionComponent<Props> = (Props) => {
    const classes = useStyles();
    const handleDrawerOpen = () => {
        setOpen(true);
    };
    const handleDrawerClose = () => {
        setOpen(false);
    };

    const [open, setOpen] = React.useState(false);
    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar
                position="fixed"
                className={clsx(classes.appBar, {
                    [classes.appBarShift]: open,
                })}
            >
                <Toolbar>
                    <IconButton
                        color="secondary"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        className={clsx(classes.menuButton, {
                            [classes.hide]: open,
                        })}
                    >
                        <MenuIcon color="secondary" />
                    </IconButton>
                    <Typography variant="h6" noWrap>
                        Фронтир
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                className={clsx(classes.drawer, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                })}
                classes={{
                    paper: clsx({
                        [classes.drawerOpen]: open,
                        [classes.drawerClose]: !open,
                    }),
                }}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </div>
                <Divider />
                <Menu>
                    <List>
                        <NavLink exact to="/" activeClassName="active">
                            <ListItem button key="visitors">
                                <ListItemIcon>
                                    <PeopleAltIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Посетители" />
                            </ListItem>
                        </NavLink>
                        <NavLink exact to="/tariffs" activeClassName="active">
                            <ListItem button key="tariffs">
                                <ListItemIcon>
                                    <SettingsIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Тарифы" />
                            </ListItem>
                        </NavLink>
                        <NavLink exact to="/statistics" activeClassName="active">
                            <ListItem button key="statistics">
                                <ListItemIcon>
                                    <AssessmentIcon color="primary" />
                                </ListItemIcon>
                                <ListItemText primary="Статистика" />
                            </ListItem>
                        </NavLink>
                    </List>
                </Menu>
            </Drawer>
            <main className={classes.content}>
                <div>{Props.children}</div>
            </main>
        </div>
    );
};
