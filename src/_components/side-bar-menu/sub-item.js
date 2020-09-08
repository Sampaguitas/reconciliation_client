import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Item from './sub-item.js';

class SubItem extends Component {

    render() {
        const { item, menuItem } = this.props
        return (
            <li>
                <NavLink 
                    to={{  pathname: item.href }}
                    tag="a"
                    className={`${item.title == menuItem ? "menu-item__selected" : "menu-item"}`}
                >
                    <FontAwesomeIcon icon={item.icon} className="item-icon" name={item.icon}/>
                    <span className="item-text" style={{marginLeft: 45}}>{item.title}
                        {item.child &&
                            <FontAwesomeIcon icon="angle-right" />
                        }
                    </span>
                </NavLink>

                {item.child &&
                    <div className="dropdown">
                        <div className={`show-animation ${show == item.title && 'active'}`}>
                            <ul className={`${show == item.title ? "show-animation-enter-active" : "show-animation-leave-active"}`}>
                                {item.child.map((subitem) =>
                                    <Item key={subitem.id} item={subitem}/>
                                )}
                            </ul>
                        </div>
                    </div>
                }
            </li>
        );
    }
}
export default SubItem;