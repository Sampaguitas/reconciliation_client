import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logo from '../../_assets/logo.jpg'; //logo.svg
import icon from '../../_assets/icon.svg';
import Item from './item.js'
import './side-bar-menu.scss'
import _ from 'lodash';

class SideBarMenu extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            show: '',
            listMenu: [],
        }
        this.handleItemOver = this.handleItemOver.bind(this);
    }

    componentDidMount(){
        let user = JSON.parse(localStorage.getItem('user'));
        
        const menu = [
            { id: 0, title: 'Home', href: '/', icon: 'home' },
            { id: 1, title: 'Import Documents', href: '/import_doc', icon: 'file-import', roles: ['isAdmin'] },
            { id: 2, title: 'Export Documents', href: '/export_doc', icon: 'file-export', roles: ['isAdmin'] }
        ];

        let listMenu = menu.reduce(function(acc, cur) {
            if (!cur.roles){
                acc.push(cur);
            } else if (cur.roles.includes('isAdmin') && user.isAdmin) {
                acc.push(cur);
            }
            return acc;
        }, []);
        
        this.setState({listMenu: listMenu});
    }

    handleItemOver(event, title){
        event.preventDefault();
        this.setState({ show: title });
    }

    generateMenu() {
        const { listMenu, show } = this.state;
        const { menuItem, sidemenu } = this.props;
        let tempArray = []

        listMenu.map(item => {
            tempArray.push(
                <Item item={item} key={item.id} menuItem={menuItem} sidemenu={sidemenu} show={show} handleItemOver={this.handleItemOver}/>
            );
        });
        
        return tempArray;
    }

    render() {
        const { sidemenu } = this.props;
        return (
            <div>
                {localStorage.getItem("user") !== null && 
                    <div id="sidebar-menu" className={sidemenu.collapsed ? 'collapsed' : undefined}>
                        <NavLink to={{ pathname: '/' }} tag="div" className="sidebar-logo">
                            <img src={sidemenu.collapsed ? icon : logo} />
                        </NavLink>
                        <ul className="default-list menu-list">
                            {this.generateMenu()}
                        </ul>
                        <button className="collapse-btn" onClick={this.props.toggleCollapse}>
                        <FontAwesomeIcon icon="arrows-alt-h" name="arrows-alt-h" />
                        </button>

                    </div>
                }
            </div>
        );
    }
}
export default SideBarMenu;