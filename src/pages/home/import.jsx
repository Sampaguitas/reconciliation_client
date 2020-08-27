import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { history } from '../../_helpers';
import { 
    alertActions,
    sidemenuActions,
} from '../../_actions';
import {
    doesMatch,
    copyObject
} from '../../_functions';
import HeaderInput from '../../_components/table/header-input';
import Layout from '../../_components/layout';
import _ from 'lodash';

class Import extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            alert: {
                type: '',
                message: ''
            },
            sort: {
                name: '',
                isAscending: true,
            },
            loaded: false,
            menuItem: 'Import Documents',
            settingsColWidth: {},
        };

    }

    componentDidMount() {
        const { dispatch } = this.props;
        const { menuItem } = this.state;
        dispatch(sidemenuActions.select(menuItem));
    }

    render() {
        const { menuItem } = this.state;
        const { alert, sidemenu } = this.props;
        return (
            <Layout sidemenu={sidemenu} toggleCollapse={this.toggleCollapse} menuItem={menuItem}>
                {alert.message && 
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                        </button>
                    </div>
                }
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item">
                            <NavLink to={{ pathname: '/' }} tag="a">Home</NavLink>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">Import Documents</li>
                    </ol>
                </nav>
                <div id="import" className={alert.message ? "main-section-alert" : "main-section"}> 
                    <div className="action-row row"> 
                            <button title="Create Import Document" className="btn btn-leeuwen-blue btn-lg">
                                <span><FontAwesomeIcon icon="plus" className="fa mr-2"/>Create BOE</span>
                            </button>
                    </div>
                    <div className="body-section">   
                        <div className="row ml-1 mr-1 full-height" style={{borderStyle: 'solid', borderWidth: '1px', borderColor: '#ddd'}}>
                            <div className="table-responsive custom-table-container" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>

                                    </thead>
                                    <tbody className="full-height">

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    const { alert, sidemenu } = state;
    return {
        alert,
        sidemenu,
    };
}

const connectedImport = connect(mapStateToProps)(Import);
export { connectedImport as Import };
