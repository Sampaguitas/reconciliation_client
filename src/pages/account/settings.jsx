import React from "react";
import { NavLink } from 'react-router-dom';
import { connect } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  alertActions,
  sidemenuActions,
  userActions 
} from "../../_actions";
import { doesMatch, arraySorted, copyObject } from '../../_functions';
import HeaderCheckBox from "../../_components/table/header-check-box";
import HeaderInput from "../../_components/table/header-input";
import TableCheckBoxAdmin from "../../_components/table/table-check-box-admin";
import { Input, Layout, Modal } from "../../_components";
import _ from 'lodash';

function settingSorted(array, sort) {
  let tempArray = array.slice(0);
  switch(sort.name) {
    case 'userName':
    case 'name':
        if (sort.isAscending) {
            return tempArray.sort(function (a, b) {
                let nameA = !_.isUndefined(a[sort.name]) && !_.isNull(a[sort.name]) ? String(a[sort.name]).toUpperCase() : '';
                let nameB = !_.isUndefined(b[sort.name]) && !_.isNull(b[sort.name]) ? String(b[sort.name]).toUpperCase() : '';
                if (nameA < nameB) {
                    return -1;
                } else if (nameA > nameB) {
                    return 1;
                } else {
                    return 0;
                }
            });
        } else {
            return tempArray.sort(function (a, b) {
              let nameA = !_.isUndefined(a[sort.name]) && !_.isNull(a[sort.name]) ? String(a[sort.name]).toUpperCase() : '';
              let nameB = !_.isUndefined(b[sort.name]) && !_.isNull(b[sort.name]) ? String(b[sort.name]).toUpperCase() : '';
                if (nameA > nameB) {
                    return -1;
                } else if (nameA < nameB) {
                    return 1;
                } else {
                    return 0;
                }
            });
        }
    case 'isAdmin':
        if (sort.isAscending) {
            return tempArray.sort(function (a, b) {
                let nameA = a[sort.name];
                let nameB = b[sort.name];
                if (nameA === nameB) {
                    return 0;
                } else if (!!nameA) {
                    return 1;
                } else {
                    return -1;
                }
            });
        } else {
            return tempArray.sort(function (a, b) {
                let nameA = a[sort.name];
                let nameB = b[sort.name];
                if (nameA === nameB) {
                    return 0;
                } else if (!!nameA) {
                    return -1;
                } else {
                    return 1;
                }
            });
        }
    default: return array; 
  }
}

function canClick(found, currentUser) {
  if (currentUser.isSuperAdmin) {
    return true;
  } else if (_.isEqual(currentUser.regionId, found.opco.regionId)){
    return true;
  } else {
    return false;
  }
}

class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      userName: '',
      name: '',
      isAdmin: 0,
      sort: {
        name: '',
        isAscending: true,
      },
      loaded: false,
      submitted: false,
      show: false,
      menuItem: '',
      settingsColWidth: {},
      
    };
    this.handleClearAlert = this.handleClearAlert.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleChangeUser = this.handleChangeUser.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.filterName = this.filterName.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleOnclick = this.handleOnclick.bind(this);
    this.accessibleArray = this.accessibleArray.bind(this);
    this.checkBoxDisabled = this.checkBoxDisabled.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    //Clear Selection
    dispatch(userActions.getAll());
  }

  handleClearAlert(event){
    event.preventDefault;
    const { dispatch } = this.props;
    dispatch(alertActions.clear());
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
      show: true
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
      show: false
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
    const { name, value } = event.target;
    this.setState({
        [name]: value
    });
  }

  filterName(array){
    const { isAdmin, name, sort, userName } = this.state
    if (array) {
      return settingSorted(array, sort).filter(function (object) {
        return (doesMatch(userName, object.userName, 'String', false) 
        && doesMatch(name, object.name, 'String', false) 
        && doesMatch(isAdmin, object.isAdmin, 'Boolean', false));
      });
    }
  }

  accessibleArray(items, sortBy) {
    if (items) {
        return arraySorted(items, sortBy);
    }
  }
  
  handleSubmit(event) {
    event.preventDefault();
    this.setState({ submitted: true });
    const { user } = this.state;
    const { dispatch } = this.props;
    if (
      user.id &&
      user.userName &&
      user.name &&
      user.email
    ) {
      dispatch(userActions.update(user));
      this.hideModal();
      this.setState({ submitted: false });
    } else if (
      user.userName &&
      user.name &&
      user.email &&
      user.password
    ) {
      dispatch(userActions.register(user));
      this.hideModal();
      this.setState({ submitted: false });
    }
  }

  handleOnclick(event, id) {
    const { users } = this.props
    let currentUser = JSON.parse(localStorage.getItem('user'));
    //if (event.target.type != 'checkbox' && this.props.users.items) {
    if (event.target.dataset['type'] != 'checkbox' && users.items) {
      let found = users.items.find(element => element.id === id);
      if (canClick(found, currentUser)) {
        this.setState({
          user: {
            id: id,
            userName: found.userName,
            name: found.name,
            email: found.email,
          },
          show: true
        });
      }
    }
  }

  handleDeletUser(event, id) {
    event.preventDefault();
    this.props.dispatch(userActions.delete(id));
    this.hideModal();
    this.setState({ submitted: false });
  }

  checkBoxDisabled(user, type) {
    let currentUser = JSON.parse(localStorage.getItem('user'));
    if (_.isEqual(user.id, currentUser.id)) {
      return true;
    } else {
      return false;
    }
  }

  onKeyPress(event) {
    if (event.which === 13 /* prevent form submit on key Enter */) {
      event.preventDefault();
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

  render() {
    const { menuItem, user, userName, name, isAdmin, sort, submitted, settingsColWidth } = this.state;
    const { alert, sidemenu, registering, users, userUpdating, userDeleting } = this.props;

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
            <div className="row ml-1 mr-1 full-height" style={{borderStyle: 'solid', borderWidth: '1px', borderColor: '#ddd'}}>
              <div className="table-responsive custom-table-container" >
                <table className="table table-hover table-bordered table-sm">
                  <thead>
                    <tr>
                      <HeaderInput
                          type="text"
                          title="Initials"
                          name="userName"
                          value={userName}
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
                          value={name}
                          onChange={this.handleChangeHeader}
                          width="30%"
                          sort={sort}
                          toggleSort={this.toggleSort}
                          index="1"
                          colDoubleClick={this.colDoubleClick}
                          setColWidth={this.setColWidth}
                          settingsColWidth={settingsColWidth}
                      />
                      <HeaderCheckBox
                          title="Admin"
                          name="isAdmin"
                          value={isAdmin}
                          onChange={this.handleChangeHeader}
                          width="10%"
                          sort={sort}
                          toggleSort={this.toggleSort} 
                      />
                    </tr>
                  </thead>
                  <tbody className="full-height">
                    {users.items && this.filterName(users.items).map((u) =>
                      <tr key={u._id}>
                        <td className="no-select" onClick={(event) => this.handleOnclick(event, u._id)}>{u.userName}</td>
                        <td className="no-select" onClick={(event) => this.handleOnclick(event, u._id)}>{u.name}</td>
                        <td data-type="checkbox">
                            <TableCheckBoxAdmin
                                id={u._id}
                                checked={u.isAdmin}
                                onChange={this.handleInputChange}
                                disabled={this.checkBoxDisabled(u,'isAdmin')}
                                data-type="checkbox"
                            />
                        </td>
                      </tr>                      
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <Modal
            show={this.state.show}
            hideModal={this.hideModal}
            title={this.state.user.id ? 'Update user' : 'Add user'}
          >
            <div className="col-12">
                  <form
                    name="form"
                    onKeyPress={this.onKeyPress}
                    onSubmit={this.handleSubmit}
                  >
                    <Input
                      title="Initials"
                      name="userName"
                      type="text"
                      value={user.userName}
                      onChange={this.handleChangeUser}
                      submitted={submitted}
                      inline={false}
                      required={true}
                    />
                    <Input
                      title="Full Name"
                      name="name"
                      type="text"
                      value={user.name}
                      onChange={this.handleChangeUser}
                      submitted={submitted}
                      inline={false}
                      required={true}
                    />
                    <Input
                      title="Email"
                      name="email"
                      type="email"
                      value={user.email}
                      onChange={this.handleChangeUser}
                      submitted={submitted}
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
                        submitted={submitted}
                        inline={false}
                        required={true}
                      />
                    </div>
                    }
                      <div className="modal-footer">
                      {this.state.user.id ?
                          <div className="row">
                              <button className="btn btn-leeuwen btn-lg" onClick={(event) => {this.handleDeletUser(event, this.state.user.id)}}>
                                <span><FontAwesomeIcon icon={userDeleting ? "spinner" : "trash-alt"} className={userDeleting ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Delete</span>
                              </button>
                              <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                                <span><FontAwesomeIcon icon={userUpdating ? "spinner" : "edit"} className={userUpdating ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
                              </button>
                          </div>
                      :
                          <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                            <span><FontAwesomeIcon icon={registering ? "spinner" : "plus"} className={registering ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Create</span>
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
  const { alert, sidemenu, users } = state;
  const { userDeleting, userUpdating } = state.users;
  const { registering } = state.registration;
  
  return {
    alert,
    registering,
    sidemenu,
    users,
    userDeleting,
    userUpdating,
  };
}

const connectedSettings = connect(mapStateToProps)(Settings);
export { connectedSettings as Settings };
