import React from "react";
import { NavLink } from 'react-router-dom';
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import config from 'config';
import { authHeader } from '../../_helpers';
import {  alertActions, sidemenuActions } from "../../_actions";
import { doesMatch, arraySorted, copyObject } from '../../_functions';
import HeaderCheckBox from "../../_components/table/header-check-box";
import HeaderInput from "../../_components/table/header-input";
import TableCheckBoxAdmin from "../../_components/table/table-check-box-admin";
import Input from "../../_components/input";
import Layout from "../../_components/layout";
import Modal from "../../_components/modal";
import _ from 'lodash';
import Skeleton from 'react-loading-skeleton';


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

function getPageSize(tableContainer) {
  return Math.floor((tableContainer.clientHeight - 52.5) / 33);
}

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
        pageLast: 5,
        totalItems: 0,
      }
    };
    this.handleClearAlert = this.handleClearAlert.bind(this);
    this.setAlert = this.setAlert.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleChangeUser = this.handleChangeUser.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleOnclick = this.handleOnclick.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.generateBody = this.generateBody.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount() {
    const { paginate } = this.state;
    let currentUser = JSON.parse(localStorage.getItem('user'));
    const tableContainer = document.getElementById('table-container');

    if (!!currentUser) {
      this.setState({
        currentUser: currentUser,
        paginate: {
          ...paginate,
          pageSize: getPageSize(tableContainer)
        }
      }, () => this.getUsers());
    } else {
      localStorage.removeItem('user');
      location.reload(true);
    }

    window.addEventListener('resize', e => this.setState({
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer)
      }
    }));
  }

  componentWillUnmount() {
    const { paginate } = this.state;
    window.removeEventListener('resize', e => this.setState({
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer)
      }
    }));
  }

  componentDidUpdate(prevProps, prevState) {
    const { sort, filter, paginate } = this.state;
    if (sort != prevState.sort || filter != prevState.filter || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getUsers();
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

  getUsers(nextPage) {
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
                  totalItems: data.totalItems,
                  pageLast: data.pageLast
                }
              }, () => console.log({
                  currentPage: data.currentPage,
                  totalItems: data.totalItems,
                  pageLast: data.pageLast
                }));
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
      //update
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
                this.getUsers();
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
                this.getUsers();
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

  toggleCollapse() {
    const { dispatch } = this.props;
    dispatch(sidemenuActions.toggle());
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

  generateBody() {
    const { users, retrieving, currentUser, paginate } = this.state;
    let tempRows = [];
    if (!_.isEmpty(users) || !retrieving) {
      users.map((u) => {
        tempRows.push(
          <tr key={u._id}>
            <td className="no-select" onClick={(event) => this.handleOnclick(event, u._id)}>{u.userName}</td>
            <td className="no-select" onClick={(event) => this.handleOnclick(event, u._id)}>{u.name}</td>
            <td className="no-select" onClick={(event) => this.handleOnclick(event, u._id)}>{u.email}</td>
            <td data-type="checkbox">
                <TableCheckBoxAdmin
                    id={u._id}
                    checked={u.isAdmin || false}
                    refreshStore={this.getUsers}
                    setAlert={this.setAlert}
                    disabled={_.isEqual(currentUser.id, u.id) || !currentUser.isAdmin ? true : false}
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

  changePage(event, nextPage) {
    event.preventDefault();
    const { paginate } = this.state;
    if ( (nextPage > 0) && (nextPage < (paginate.pageLast + 1))) {
      this.getUsers(nextPage);
    }
  }

  render() {
    const { menuItem, currentUser, user, users, filter , sort, showUser, settingsColWidth, upserting, deleting } = this.state;
    const { pageSize, currentPage, pageLast, totalItems, } = this.state.paginate;
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
            <div className="row ml-1 mr-1">
              <nav aria-label="Page navigation ml-1 mr-1" style={{height: '41.5px'}}>
                <ul className="pagination">
                  <li className={currentPage === 1 ? "page-item disabled" : "page-item"}>
                    <button className="page-link" onClick={event => this.changePage(event, currentPage - 1)}>Previous</button>
                  </li>
                  <li className="page-item active"><button className="page-link" >1</button></li>
                  <li className="page-item"><button className="page-link" >2</button></li>
                  <li className="page-item"><button className="page-link" >3</button></li>
                  <li className={currentPage === pageLast ? "page-item disabled" : "page-item"}>
                    <button className="page-link" onClick={event => this.changePage(event, currentPage + 1)}>Next</button>
                  </li> 
                </ul>
              </nav>
              {/* <span className="float-right">toto</span> */}
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
                      submitted={upserting}
                      inline={false}
                      required={true}
                    />
                    <Input
                      title="Full Name"
                      name="name"
                      type="text"
                      value={user.name}
                      onChange={this.handleChangeUser}
                      submitted={upserting}
                      inline={false}
                      required={true}
                    />
                    <Input
                      title="Email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={this.handleChangeUser}
                      submitted={upserting}
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
                        submitted={upserting}
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
