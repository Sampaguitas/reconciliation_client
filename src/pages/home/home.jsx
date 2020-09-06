import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { alertActions, sidemenuActions } from '../../_actions';
import Layout from '../../_components/layout';
import _ from 'lodash';

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = { menuItem: 'Home' };
        this.handleClearAlert = this.handleClearAlert.bind(this);
        this.toggleCollapse = this.toggleCollapse.bind(this);
        this.setColWidth = this.setColWidth.bind(this);
    }

    componentDidMount() {
        const { menuItem } = this.state;
        const { dispatch } = this.props;
        dispatch(sidemenuActions.select(menuItem));
    }

    handleClearAlert(event){
        event.preventDefault;
        const { dispatch } = this.props;
        dispatch(alertActions.clear());
    }

    toggleCollapse() {
        const { dispatch } = this.props;
        dispatch(sidemenuActions.toggle());
    }

    setColWidth(index, width) {
        const { settingsColWidth } = this.state;
        this.setState({
            settingsColWidth: {
                ...settingsColWidth,
                [index]: width
            }
        });
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
                        <li className="breadcrumb-item active" aria-current="page">Home</li>
                    </ol>
                </nav>
                <div id="home" className={alert.message ? "main-section-alert" : "main-section"}>
                    <div className="row justify-content-center" style={{maxHeight: '100%', overflowY: 'auto'}}>
                        <NavLink to={{ 
                            pathname: "/import_doc",
                            }} className="card col-lg-5 m-lg-4 col-md-12 m-md-0 p-5" tag="a"
                        >
                            <div className="card-body">
                                <div className="text-center">
                                    <FontAwesomeIcon 
                                        icon="file-import" 
                                        className="fa-5x mb-3" 
                                        name="file-import"
                                    />
                                    <h3>Import Documents</h3>
                                </div>
                            </div>
                        </NavLink>
                        <NavLink to={{ 
                                pathname: "/export_doc"
                            }} className="card col-lg-5 m-lg-4 col-md-12 m-md-0 p-5" tag="a"
                        >
                            <div className="card-body">
                                <div className="text-center">
                                    <FontAwesomeIcon 
                                        icon="file-export" 
                                        className="fa-5x mb-3" 
                                        name="file-export"
                                    />
                                    <h3>Export Documents</h3>
                                </div>
                            </div>
                        </NavLink>
                    </div>
                </div>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    const { alert, sidemenu } = state;
    return { alert, sidemenu };
}

const connectedHome = connect(mapStateToProps)(Home);
export { connectedHome as Home };
