import React from "react";
import { NavLink } from 'react-router-dom';
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Skeleton from 'react-loading-skeleton';
import config from 'config';
import { authHeader } from '../../_helpers';
import {  alertActions, sidemenuActions } from "../../_actions";
import { copyObject, getPageSize } from '../../_functions';
import HeaderCheckBox from "../../_components/table/header-check-box";
import HeaderInput from "../../_components/table/header-input";
import TableData from "../../_components/table/table-data";
import TableCheckBoxAdmin from "../../_components/table/table-check-box-admin";
import Input from "../../_components/input";
import Layout from "../../_components/layout";
import Modal from "../../_components/modal";
import _ from 'lodash';

function upsertUser(user, create) {
  return new Promise(function(resolve) {
    const requestOptions = {
      method: create ? 'POST' : 'PUT',
      headers: {...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    };
    return fetch(`${config.apiUrl}/user/${create ? 'create' : 'update'}`, requestOptions)
    .then(response => response.text().then(text => {
      const data = text && JSON.parse(text);
      const resMsg = (data && data.message) || response.statusText;
      resolve({
        status: response.status,
        message: resMsg
      });
    }));
  });
}

// function getPageSize(tableContainer) {
//   return Math.floor((tableContainer.clientHeight - 52.5) / 33);
// }

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUser: {},
      user: {},
      users: [],
      filter: {
        userName: '',
        name: '',
        email: '',
        isAdmin: 0,
      },
      sort: {
        name: '',
        isAscending: true,
      },
      alert: {
        type: '',
        message: ''
      },
      retrieving: false,
      upserting: false,
      loaded: false,
      submitted: false,
      showUser: false,
      menuItem: '',
      settingsColWidth: {},
      paginate: {
        pageSize: 0,
        currentPage: 1,
        firstItem: 0,
        lastItem: 0,
        pageItems: 0,
        pageLast: 1,
        totalItems: 0,
        first: 1,
        second: 2,
        third: 3
      }
    };
    this.recize = this.recize.bind(this);
    this.handleClearAlert = this.handleClearAlert.bind(this);
    this.setAlert = this.setAlert.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleChangeUser = this.handleChangeUser.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleOnclick = this.handleOnclick.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.changePage = this.changePage.bind(this);
    this.generateBody = this.generateBody.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { menuItem, paginate } = this.state;
    let currentUser = JSON.parse(localStorage.getItem('user'));
    const tableContainer = document.getElementById('table-container');
    dispatch(sidemenuActions.select(menuItem));
    if (!!currentUser) {
      this.setState({
        currentUser: currentUser,
        paginate: {
          ...paginate,
          pageSize: getPageSize(tableContainer.clientHeight)
        }
      }, () => this.getDocuments());
    } else {
      localStorage.removeItem('user');
      location.reload(true);
    }

    //window.addEventListener('resize', this.recize);
  }

    // componentWillUnmount() {
  //   window.removeEventListener('resize', this.recize);
  // }

  recize() {
    const { paginate } = this.state;
    const tableContainer = document.getElementById('table-container');
    this.setState({
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer.clientHeight)
      }
    }, () => this.getDocuments());
  }

  componentDidUpdate(prevProps, prevState) {
    const { sort, filter, paginate } = this.state;
    if (sort != prevState.sort || filter != prevState.filter || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getDocuments();
    }
  }

  handleClearAlert(event){
    event.preventDefault;
    const { dispatch } = this.props;
    
    this.setState({
      alert: {
        type: '',
        message: ''
      }
    }, () => dispatch(alertActions.clear()));
  }

  setAlert(type, message) {
    this.setState({
      alert: {
        type: type,
        message: message
      }
    })
  }

  toggleCollapse() {
    const { dispatch } = this.props;
    dispatch(sidemenuActions.toggle());
  }

  toggleSort(event, name) {
    event.preventDefault();
    const { sort } = this.state;
    if (sort.name != name) {
      this.setState({
          sort: {
              name: name,
              isAscending: true
          }
      });
    } else if (!!sort.isAscending) {
      this.setState({
          sort: {
              name: name,
              isAscending: false
          }
      });
    } else {
      this.setState({
          sort: {
              name: '',
              isAscending: true
          }
      });
    }
  }

  showModal() {
    this.setState({
      user: {
        userName: "",
        name: "",
        email: "",
        password: "",
      },
      showUser: true
    });
  }

  hideModal() {
    this.setState({
      user: {
        userName: "",
        name: "",
        email: "",
        password: "",
      },
      submitted: false,
      showUser: false
    });
  }

  handleChangeUser(event) {
    const { name, value } = event.target;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        [name]: value
      }
    });
  }

  handleChangeHeader(event) {
    const { filter } = this.state;
    const { name, value } = event.target;
    this.setState({
      filter: {
        ...filter,
        [name]: value
      }
    });
  }

  getDocuments(nextPage) {
    const { filter, sort, paginate } = this.state;
    if (!!paginate.pageSize) {
      this.setState({
        retrieving: true
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: {...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({
            filter: filter,
            sort: sort,
            nextPage: nextPage,
            pageSize: paginate.pageSize
          })
        };
        return fetch(`${config.apiUrl}/user/findAll`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            retrieving: false,
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
              // Unauthorized
              localStorage.removeItem('user');
              location.reload(true);
            } else if (response.status != 200) {
              this.setState({
                alert: {
                  type: 'alert-danger',
                  message: resMsg
                }
              });
            } else {
              this.setState({
                users: data.users,
                paginate: {
                  ...paginate,
                  currentPage: data.currentPage,
                  firstItem: data.firstItem,
                  lastItem: data.lastItem,
                  pageItems: data.pageItems,
                  pageLast: data.pageLast,
                  totalItems: data.totalItems,
                  first: data.first,
                  second: data.second,
                  third: data.third
                }
              });
            }
          });
        }))
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    const { user, upserting } = this.state;
    if ((!!user.id || !!user.password) && !!user.userName && !!user.name && !!user.email && !upserting) {
      this.setState({
        upserting: true,
      }, () => {
        upsertUser(user, user.id ? false : true).then(response => {
          this.setState({
            upserting: false
          }, () => {
            if (response.status === 401) {
              // Unauthorized
              localStorage.removeItem('user');
              location.reload(true);
            } else {
              this.setState({
                alert: {
                  type: response.status != 200 ? 'alert-danger' : 'alert-success',
                  message: response.message
                }
              }, () => {
                this.getDocuments();
                this.hideModal();
              });
            }
          });
        })
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      });
    }
  }

  handleDelete(event, id) {
    event.preventDefault();
    const { deleting } = this.state;
    if (!!id && !deleting) {
      this.setState({
        deleting: true
      }, () => {
        const requestOptions = {
          method: 'DELETE',
          headers: authHeader()
        };
        return fetch(`${config.apiUrl}/user/delete?id=${id}`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            deleting: false,
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
              // Unauthorized
              localStorage.removeItem('user');
              location.reload(true);
            } else {
              this.setState({
                alert: {
                  type: response.status != 200 ? 'alert-danger' : 'alert-success',
                  message: resMsg
                }
              }, () => {
                this.getDocuments();
                this.hideModal();
              });
            }
          });
        }))
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      });
    }
  }

  handleOnclick(event, id) {
    event.preventDefault();
    const { users, currentUser } = this.state;
    let found = users.find(element => _.isEqual(element._id, id));
    if (!_.isUndefined(found) && !!currentUser.isAdmin) {
      this.setState({
        user: {
          id: found._id,
          userName: found.userName,
          name: found.name,
          email: found.email,
        },
        showUser: true
      });
    }
  }

  colDoubleClick(event, index) {
    event.preventDefault();
    const { settingsColWidth } = this.state;
    if (settingsColWidth.hasOwnProperty(index)) {
        let tempArray = copyObject(settingsColWidth);
        delete tempArray[index];
        this.setState({ settingsColWidth: tempArray });
    } else {
        this.setState({
            settingsColWidth: {
                ...settingsColWidth,
                [index]: 10
            }
        });
    }
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

  changePage(event, nextPage) {
    event.preventDefault();
    const { paginate } = this.state;
    if ( (nextPage > 0) && (nextPage < (paginate.pageLast + 1))) {
      this.getDocuments(nextPage);
    }
  }

  generateBody() {
    const { users, retrieving, currentUser, paginate, settingsColWidth } = this.state;
    let tempRows = [];
    if (!_.isEmpty(users) || !retrieving) {
      users.map((user) => {
        tempRows.push(
          <tr key={user._id}>
            <TableData colIndex="0" value={user.userName} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={user._id}/>
            <TableData colIndex="0" value={user.name} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={user._id}/>
            <TableData colIndex="0" value={user.email} type="text" settingsColWidth={settingsColWidth} handleClick={this.handleOnclick} eventId={user._id}/>
            <td data-type="checkbox">
                <TableCheckBoxAdmin
                    id={user._id}
                    checked={user.isAdmin || false}
                    refreshStore={this.getDocuments}
                    setAlert={this.setAlert}
                    disabled={_.isEqual(currentUser.id, user.id) || !currentUser.isAdmin ? true : false}
                    data-type="checkbox"
                />
            </td>
          </tr> 
        );
      });
    } else {
      for (let i = 0; i < paginate.pageSize; i++) {
        tempRows.push(
          <tr key={i}>
            <td className="no-select"><Skeleton/></td>
            <td className="no-select"><Skeleton/></td>
            <td className="no-select"><Skeleton/></td>
            <td className="no-select"><Skeleton/></td>
          </tr> 
        );
      }
    }
    return tempRows;
  }

  render() {
    const { menuItem, user, filter , sort, showUser, settingsColWidth, upserting, deleting } = this.state;
    const { currentPage, firstItem, lastItem, pageItems, pageLast, totalItems, first, second, third} = this.state.paginate;
    const { sidemenu } = this.props;
    const alert = this.state.alert.message ? this.state.alert : this.props.alert;

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
                <li className="breadcrumb-item active" aria-current="page">Settings</li>
            </ol>
        </nav>
        <div id="setting" className={alert.message ? "main-section-alert" : "main-section"}>
        <div className="action-row row">
                <button title="Create User" className="btn btn-leeuwen-blue btn-lg" onClick={this.showModal}> {/* style={{height: '34px'}} */}
                    <span><FontAwesomeIcon icon="plus" className="fa mr-2"/>Create User</span>
                </button>
          </div>
          <div className="body-section">
            <div className="row ml-1 mr-1" style={{height: 'calc(100% - 41.5px)'}}> {/* borderStyle: 'solid', borderWidth: '1px', borderColor: '#ddd', */}
              <div id="table-container" className="table-responsive custom-table-container" >
                <table className="table table-hover table-bordered table-sm">
                  <thead>
                    <tr>
                      <HeaderInput
                          type="text"
                          title="Initials"
                          name="userName"
                          value={filter.userName}
                          onChange={this.handleChangeHeader}
                          width="10%"
                          sort={sort}
                          toggleSort={this.toggleSort}
                          index="0"
                          colDoubleClick={this.colDoubleClick}
                          setColWidth={this.setColWidth}
                          settingsColWidth={settingsColWidth}
                      />
                      <HeaderInput
                          type="text"
                          title="Name"
                          name="name"
                          value={filter.name}
                          onChange={this.handleChangeHeader}
                          width="30%"
                          sort={sort}
                          toggleSort={this.toggleSort}
                          index="1"
                          colDoubleClick={this.colDoubleClick}
                          setColWidth={this.setColWidth}
                          settingsColWidth={settingsColWidth}
                      />
                      <HeaderInput
                          type="text"
                          title="Email"
                          name="email"
                          value={filter.email}
                          onChange={this.handleChangeHeader}
                          width="30%"
                          sort={sort}
                          toggleSort={this.toggleSort}
                          index="2"
                          colDoubleClick={this.colDoubleClick}
                          setColWidth={this.setColWidth}
                          settingsColWidth={settingsColWidth}
                      />
                      <HeaderCheckBox
                          title="Admin"
                          name="isAdmin"
                          value={filter.isAdmin}
                          onChange={this.handleChangeHeader}
                          width="10%"
                          sort={sort}
                          toggleSort={this.toggleSort} 
                      />
                    </tr>
                  </thead>
                  <tbody className="full-height">
                    {this.generateBody()}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="row ml-1 mr-1" style={{height: '31.5px', marginTop: '10px'}}>
              <div className="col" style={{height: '31.5px', padding: '0px'}}>
                <nav aria-label="Page navigation" style={{height: '31.5px'}}>
                  <ul className="pagination">
                    <li className={currentPage === 1 ? "page-item disabled" : "page-item"}>
                      <button className="page-link" onClick={event => this.changePage(event, currentPage - 1)}>Previous</button>
                    </li>
                    <li className={`page-item${currentPage === first && " active"}`}><button className="page-link" onClick={event => this.changePage(event, first)}>{first}</button></li>
                    <li className={`page-item${currentPage === second ? " active": pageLast < 2  && " disabled"}`}><button className="page-link" onClick={event => this.changePage(event, second)}>{second}</button></li>
                    <li className={`page-item${currentPage === third ? " active" : pageLast < 3  && " disabled"}`}><button className="page-link" onClick={event => this.changePage(event, third)}>{third}</button></li>
                    <li className={currentPage === pageLast ? "page-item disabled" : "page-item"}>
                      <button className="page-link" onClick={event => this.changePage(event, currentPage + 1)}>Next</button>
                    </li> 
                  </ul>
                </nav>
              </div>
              <div className="col text-right" style={{height: '31.5px', padding: '0px'}}>Displaying<b> {firstItem} - {lastItem} </b><i>({pageItems})</i> entries out of {totalItems}</div>
            </div>
          </div>

          <Modal
            show={showUser}
            hideModal={this.hideModal}
            title={this.state.user.id ? 'Update user' : 'Add user'}
          >
            <div className="col-12">
              <form
                name="form"
                onSubmit={this.handleSubmit}
              >
                <Input
                  title="Initials"
                  name="userName"
                  type="text"
                  value={user.userName}
                  onChange={this.handleChangeUser}
                  inline={false}
                  required={true}
                />
                <Input
                  title="Full Name"
                  name="name"
                  type="text"
                  value={user.name}
                  onChange={this.handleChangeUser}
                  inline={false}
                  required={true}
                />
                <Input
                  title="Email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={this.handleChangeUser}
                  inline={false}
                  required={true}
                />
                {!this.state.user.id &&
                <div>
                  <Input
                    title="Password"
                    name="password"
                    type="password"
                    value={user.password}
                    onChange={this.handleChangeUser}
                    inline={false}
                    required={true}
                  />
                </div>
                }
                  <div className="modal-footer">
                  {this.state.user.id ?
                      <div className="row">
                          <button className="btn btn-leeuwen btn-lg" onClick={(event) => {this.handleDelete(event, this.state.user.id)}}>
                            <span><FontAwesomeIcon icon={deleting ? "spinner" : "trash-alt"} className={deleting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Delete</span>
                          </button>
                          <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                            <span><FontAwesomeIcon icon={upserting ? "spinner" : "edit"} className={upserting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
                          </button>
                      </div>
                  :
                      <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                        <span><FontAwesomeIcon icon={upserting ? "spinner" : "plus"} className={upserting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Create</span>
                      </button>
                  }
                  </div>
              </form>
            </div>
          </Modal>
        </div>
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  const { alert, sidemenu } = state;
  
  return { alert, sidemenu };
}

const connectedSettings = connect(mapStateToProps)(Settings);
export { connectedSettings as Settings };
