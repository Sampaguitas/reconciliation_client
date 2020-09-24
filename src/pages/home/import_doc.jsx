import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import config from 'config';
import { authHeader, history } from '../../_helpers';
import {  alertActions, sidemenuActions } from '../../_actions';
import {
  copyObject,
  getPageSize,
  StringToType,
  isValidFormat,
  getDateFormat
} from '../../_functions';
import TableData from '../../_components/table/table-data';
import HeaderInput from '../../_components/table/header-input';
import HeaderSelect from '../../_components/table/header-select';
import Input from "../../_components/input";
import Layout from '../../_components/layout';
import Modal from "../../_components/modal";
import _ from 'lodash';

class ImportDoc extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      importDocs: [],
      filter: {
          decNr: '',
          boeNr: '',
          sfiNr: '',
          boeDate: '',
          poNrs: '',
          invNrs: '',
          totalNetWeight: '',
          totalGrossWeight: '',
          totalPrice: '',
          isClosed: '',
      },
      sort: {
          name: '',
          isAscending: true,
      },
      alert: {
          type: '',
          message: ''
      },
      newDoc: {
        decNr: '',
        boeNr: '',
        sfiNr: '',
        boeDate: '',
      },
      showCreate: false,
      creating: false,
      retrieving: false,
      menuItem: 'Import Documents',
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
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.handleChangeDoc = this.handleChangeDoc.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.getDocuments = this.getDocuments.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { menuItem, paginate } = this.state;
    const tableContainer = document.getElementById('table-container');
    dispatch(sidemenuActions.select(menuItem));
    this.setState({
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer.clientHeight)
      }
    }, () => this.getDocuments());

    window.addEventListener('resize', this.recize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recize);
  }

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

  handleChangeDoc(event) {
    const { newDoc } = this.state;
    const { name, value } = event.target;
    this.setState({
      newDoc: {
        ...newDoc,
        [name]: value
      }
    });
  }

  toggleModal() {
    const { showCreate } = this.state;
    this.setState({
      showCreate: !showCreate,
      newDoc: {
        decNr: '',
        boeNr: '',
        sfiNr: '',
        boeDate: '',
      },
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
            dateFormat: getDateFormat(),
            pageSize: paginate.pageSize
          })
        };
        return fetch(`${config.apiUrl}/importdoc/findAll`, requestOptions)
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
                importDocs: data.importDocs,
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
    const { newDoc, creating } = this.state;
    if (!isValidFormat(newDoc.boeDate, 'date', getDateFormat())) {
      this.setState({
        type: 'alert-danger',
        message: 'BOE Date does not have a proper Date Format.'
      });
    } else if (!creating) {
      this.setState({
        creating: true,
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            decNr: newDoc.decNr,
            boeNr: newDoc.boeNr,
            sfiNr: newDoc.sfiNr,
            boeDate: StringToType(newDoc.boeDate, 'date', getDateFormat()),
          })
        };
        return fetch(`${config.apiUrl}/importdoc/create`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            creating: false
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
                this.toggleModal();
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
    const { importDocs, retrieving, paginate, settingsColWidth } = this.state;
    let tempRows = [];
    if (!_.isEmpty(importDocs) || !retrieving) {
      importDocs.map((importDoc) => {
        tempRows.push(
          <tr key={importDoc._id} style={{cursor: 'pointer'}} onClick={event => this.handleOnClick(event, importDoc._id)}>
            <TableData colIndex="0" value={importDoc.decNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="1" value={importDoc.boeNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="2" value={importDoc.sfiNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="3" value={importDoc.boeDate} type="date" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="4" value={importDoc.invNrs} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="5" value={importDoc.poNrs} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="6" value={importDoc.totalNetWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="7" value={importDoc.totalGrossWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="8" value={importDoc.totalPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="9" value={importDoc.status} type="text" settingsColWidth={settingsColWidth}/>
          </tr>
        );
      });
    } else {
      for (let i = 0; i < paginate.pageSize; i++) {
        tempRows.push(
          <tr key={i}>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
            <td><Skeleton/></td>
          </tr> 
        );
      }
    }
    return tempRows;
  }

  handleOnClick(event, documentId) {
    event.preventDefault();
    history.push({ pathname:'/import_item', search: '?id=' + documentId })
  }

    render() {
        const { menuItem, filter, sort, settingsColWidth, newDoc, showCreate, creating } = this.state;
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
                        <li className="breadcrumb-item active" aria-current="page">Import Documents</li>
                    </ol>
                </nav>
                <div id="import" className={alert.message ? "main-section-alert" : "main-section"}> 
                    <div className="action-row row"> 
                      <button title="Create Import Document" className="btn btn-leeuwen-blue btn-lg" onClick={this.toggleModal}>
                          <span><FontAwesomeIcon icon="plus" className="fa mr-2"/>New Doc</span>
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
                                            title="DEC Number"
                                            name="decNr"
                                            value={filter.decNr}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="0"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="text"
                                            title="BOE Number"
                                            name="boeNr"
                                            value={filter.boeNr}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="1"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="text"
                                            title="SFI Number"
                                            name="sfiNr"
                                            value={filter.sfiNr}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="2"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="text"
                                            title="Date"
                                            name="boeDate"
                                            value={filter.boeDate}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="3"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="text"
                                            title="INV Numbers"
                                            name="invNrs"
                                            value={filter.invNrs}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="4"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="text"
                                            title="PO Numbers"
                                            name="poNrs"
                                            value={filter.poNrs}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="5"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Net Weight"
                                            name="totalNetWeight"
                                            value={filter.totalNetWeight}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="6"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Gross Weight"
                                            name="totalGrossWeight"
                                            value={filter.totalGrossWeight}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="7"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Total Price"
                                            name="totalPrice"
                                            value={filter.totalPrice}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="8"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderSelect
                                            title="Status"
                                            name="isClosed"
                                            value={filter.isClosed}
                                            options={[
                                              { _id: 'true', name: 'Closed'},
                                              { _id: 'false', name: 'Open'}
                                            ]}
                                            optionText="name"
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="9"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                          />
                                        </tr>
                                    </thead>
                                    <tbody className="full-height">
                                        {this.generateBody()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="row ml-1 mr-1" style={{height: '41.5px', marginTop: '10px'}}>
                            <div className="col" style={{height: '31.5px', padding: '0px'}}>
                                <nav aria-label="Page navigation ml-1 mr-1" style={{height: '31.5px'}}>
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
                      show={showCreate}
                      hideModal={this.toggleModal}
                      title={'Add Import Document'}
                    >
                        <form
                          name="form"
                          className="col-12"
                          style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                          onSubmit={this.handleSubmit}
                        >
                          <Input
                            title="DEC Number"
                            name="decNr"
                            type="text"
                            value={newDoc.decNr}
                            onChange={this.handleChangeDoc}
                            placeholder="ddd-dddddddd-dd"
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="BOE Number"
                            name="boeNr"
                            type="text"
                            value={newDoc.boeNr}
                            onChange={this.handleChangeDoc}
                            placeholder="dddddddddddd"
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="SFI Number"
                            name="sfiNr"
                            type="text"
                            value={newDoc.sfiNr}
                            onChange={this.handleChangeDoc}
                            placeholder="ddddd"
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="BOE Date"
                            name="boeDate"
                            type="text"
                            value={newDoc.boeDate}
                            onChange={this.handleChangeDoc}
                            placeholder={getDateFormat()}
                            inline={false}
                            required={true}
                          />
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                                    <span><FontAwesomeIcon icon={creating ? "spinner" : "plus"} className={creating ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Create</span>
                                </button>
                            </div>
                        </form>
                    </Modal>
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

const connectedImportDoc = connect(mapStateToProps)(ImportDoc);
export { connectedImportDoc as ImportDoc };
