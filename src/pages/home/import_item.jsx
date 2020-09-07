import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Skeleton from 'react-loading-skeleton';
import config from 'config';
import { authHeader, history } from '../../_helpers';
import {  alertActions, sidemenuActions } from '../../_actions';
import {
  copyObject,
  getPageSize,
  TypeToString,
  isValidFormat,
  getDateFormat
} from '../../_functions';
import HeaderInput from '../../_components/table/header-input';
import TableData from '../../_components/table/table-data';
import Input from "../../_components/input";
import Layout from '../../_components/layout';
import Modal from "../../_components/modal";
import _ from 'lodash';

class ImportItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      importDoc: {
        _id: '',
        decNr: '',
        boeNr: '',
        boeDate: '',
        grossWeight: '',
        totPrice: '',
        isClosed: '',
        items: [],
      },
      filter: {
        srNr: '',
        desc: '',
        invNr: '',
        unitWeight: '',
        unitPrice: '',
        hsCode: '',
        country: '',
        documentId: ''
      },
      sort: {
          name: '',
          isAscending: true,
      },
      alert: {
          type: '',
          message: ''
      },
      newItem: {
        srNr: '',
        desc: '',
        invNr: '',
        unitWeight: '',
        unitPrice: '',
        hsCode: '',
        country: '',
      },
      updateDoc: {
        decNr: '',
        boeNr: '',
        boeDate: '',
        grossWeight: '',
        totPrice: '',
      },
      showCreateLine: false,
      showUpdateDoc: false,
      creatingLine: false,
      updatingDoc: false,
      deleting: false,
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
    this.handleClearAlert = this.handleClearAlert.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.handleChangeItem = this.handleChangeItem.bind(this);
    this.handleChangeDoc = this.handleChangeDoc.bind(this);
    this.toggleNewLine = this.toggleNewLine.bind(this);
    this.toggleEditDoc = this.toggleEditDoc.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.handleCreateLine = this.handleCreateLine.bind(this);
    this.handleUpdateDoc = this.handleUpdateDoc.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.changePage = this.changePage.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { filter, menuItem, paginate } = this.state;
    const tableContainer = document.getElementById('table-container');
    var qs = queryString.parse(window.location.search);
    dispatch(sidemenuActions.select(menuItem));
    this.setState({
      filter: {
        ...filter,
        documentId: qs.id
      },
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer)
      }
    }, () => this.getDocument());
    // });

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
    if (sort != prevState.sort || (filter != prevState.filter && prevState.filter.documentId != '')  || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getDocument();
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

  handleChangeItem(event) {
    const { newItem } = this.state;
    const { name, value } = event.target;
    this.setState({
      newItem: {
        ...newItem,
        [name]: value
      }
    });
  }

  handleChangeDoc(event) {
    const { updateDoc } = this.state;
    const { name, value } = event.target;
    this.setState({
      updateDoc: {
        ...updateDoc,
        [name]: value
      }
    });
  }

  toggleNewLine() {
    const { showCreateLine } = this.state;
    this.setState({
      showCreateLine: !showCreateLine,
      newItem: {
        srNr: '',
        desc: '',
        invNr: '',
        unitWeight: '',
        unitPrice: '',
        hsCode: '',
        country: '',
      },
    });
  }

  toggleEditDoc() {
    const { showUpdateDoc, importDoc } = this.state;
    this.setState({
      showUpdateDoc: !showUpdateDoc,
      updateDoc: {
        _id: importDoc._id,
        decNr: importDoc.decNr,
        boeNr: importDoc.boeNr,
        boeDate: TypeToString(importDoc.boeDate, 'date', getDateFormat()),
        grossWeight: importDoc.grossWeight,
        totPrice: importDoc.totPrice,
      }
    });
  }

  getDocument(nextPage) {
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
        return fetch(`${config.apiUrl}/importdoc/getItems`, requestOptions)
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
                importDoc: data.importDoc,
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

  handleCreateLine(event) {
    event.preventDefault();
    const { newItem, filter, creatingLine } = this.state;
    if (!creatingLine) {
      this.setState({
        creatingLine: true,
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            srNr: newItem.srNr,
            desc: newItem.desc,
            invNr: newItem.invNr,
            unitWeight: newItem.unitWeight,
            unitPrice: newItem.unitPrice,
            hsCode: newItem.hsCode,
            country: newItem.country,
            documentId: filter.documentId
          })
        };
        return fetch(`${config.apiUrl}/importdoc/createItem`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            creatingLine: false
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
                this.getDocument();
                this.toggleNewLine();
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

  handleUpdateDoc(event) {
    event.preventDefault();
    const { updateDoc } = this.state;
    if (!isValidFormat(updateDoc.boeDate, 'date', getDateFormat())) {
      this.setState({
        type: 'alert-danger',
        message: 'BOE Date does not have a proper Date Format.'
      });
    } else if (!updatingDoc) {
      this.setState({
        updatingDoc: true,
      }, () => {
        const requestOptions = {
          method: 'PUT',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify(updateDoc)
        };
        return fetch(`${config.apiUrl}/importdoc/updateDoc`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            updatingDoc: false
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
                this.getDocument();
                this.toggleEditDoc();
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
      this.getUsers(nextPage);
    }
  }

  generateBody() {
    const { importDoc, retrieving, paginate, settingsColWidth } = this.state;
    let tempRows = [];
    if (!_.isEmpty(importDoc.items) || !retrieving) {
      importDoc.items.map((importItem) => {
        tempRows.push(
          <tr key={importItem._id}>
            <TableData colIndex="0" value={importItem.srNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="1" value={importItem.desc} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="2" value={importItem.invNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="3" value={importItem.unitWeight} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="4" value={importItem.unitPrice} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="5" value={importItem.hsCode} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="6" value={importItem.country} type="text" settingsColWidth={settingsColWidth}/>
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
          </tr> 
        );
      }
    }
    return tempRows;
  }

    render() {
        const { importDoc, menuItem, filter, sort, settingsColWidth, newItem, updateDoc, showCreateLine, showUpdateDoc, retrieving, updatingDoc, creatingLine } = this.state;
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
                  {!importDoc.boeNr && !!retrieving ?
                    <div style={{height: '28.5px', paddingBottom: '7.5px'}}>
                      <Skeleton/>
                    </div>
                  :
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                          <NavLink to={{ pathname: '/' }} tag="a">Home</NavLink>
                      </li>
                      <li className="breadcrumb-item">
                          <NavLink to={{ pathname: '/import_doc' }} tag="a">Import Documents</NavLink>
                      </li>
                      <li className="breadcrumb-item active flex-grow-1" aria-current="page">
                        {`${importDoc.decNr} ${importDoc.boeNr} dated: ${TypeToString(importDoc.boeDate, 'date', getDateFormat())} - ${TypeToString(importDoc.grossWeight, 'number', getDateFormat())} kgs ${TypeToString(importDoc.totPrice, 'number', getDateFormat())} AED - ${importDoc.isClosed ? 'Closed' : 'Open'}`}
                      </li>
                    </ol>
                  }
                </nav>
                <div id="import" className={alert.message ? "main-section-alert" : "main-section"}> 
                    <div className="action-row row"> 
                            <button title="New Line Item" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleNewLine}>
                                <span><FontAwesomeIcon icon="plus" className="fa mr-2"/>New Line</span>
                            </button>
                            <button title="Edit Import Document" className="btn btn-leeuwen-blue btn-lg" onClick={this.toggleEditDoc}>
                                <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Doc</span>
                            </button>
                    </div>
                    <div className="body-section">
                        <div className="row ml-1 mr-1" style={{height: 'calc(100% - 41.5px)'}}> {/* borderStyle: 'solid', borderWidth: '1px', borderColor: '#ddd', */}
                            <div id="table-container" className="table-responsive custom-table-container" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>
                                        <tr>
                                        <HeaderInput
                                            type="number"
                                            title="SrNo"
                                            name="srNr"
                                            value={filter.srNr}
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
                                            title="Descripion"
                                            name="desc"
                                            value={filter.desc}
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
                                            title="Inv Number"
                                            name="invNr"
                                            value={filter.invNr}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="2"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Unit Weight"
                                            name="unitWeight"
                                            value={filter.unitWeight}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="3"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Unit Price"
                                            name="unitPrice"
                                            value={filter.unitPrice}
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
                                            title="HS Code"
                                            name="hsCode"
                                            value={filter.hsCode}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="5"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="text"
                                            title="Country"
                                            name="country"
                                            value={filter.country}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="6"
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
                      show={showCreateLine}
                      hideModal={this.toggleNewLine}
                      title={'Add New Line'}
                    >
                      <div className="col-12">
                        <form
                          name="form"
                          onSubmit={this.handleCreateLine}
                        >
                          <Input
                            title="SrNo"
                            name="srNr"
                            type="number"
                            value={newItem.srNr}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Description"
                            name="desc"
                            type="text"
                            value={newItem.desc}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Inv Nr"
                            name="invNr"
                            type="text"
                            value={newItem.invNr}
                            onChange={this.handleChangeItem}
                            // placeholder={getDateFormat()}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Unit Weight"
                            name="unitWeight"
                            type="number"
                            value={newItem.unitWeight}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Unit Price"
                            name="unitPrice"
                            type="number"
                            value={newItem.unitPrice}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="HS Code"
                            name="hsCode"
                            type="text"
                            value={newItem.hsCode}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Country"
                            name="country"
                            type="text"
                            value={newItem.country}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                                  <span><FontAwesomeIcon icon={creatingLine ? "spinner" : "plus"} className={creatingLine ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Create</span>
                                </button>
                            </div>
                        </form>
                      </div>
                    </Modal>

                    <Modal
                      show={showUpdateDoc}
                      hideModal={this.toggleEditDoc}
                      title={'Update Import Document'}
                    >
                      <div className="col-12">
                        <form
                          name="form"
                          // onSubmit={this.handleCreateLine}
                        >
                          <Input
                            title="SrNo"
                            name="decNr"
                            type="text"
                            value={updateDoc.decNr}
                            onChange={this.handleChangeItem}
                            submitted={updatingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Description"
                            name="boeNr"
                            type="text"
                            value={updateDoc.boeNr}
                            onChange={this.handleChangeItem}
                            submitted={updatingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Date"
                            name="boeDate"
                            type="text"
                            value={updateDoc.boeDate}
                            onChange={this.handleChangeItem}
                            placeholder={getDateFormat()}
                            submitted={updatingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Gross Weight"
                            name="grossWeight"
                            type="number"
                            value={updateDoc.grossWeight}
                            onChange={this.handleChangeItem}
                            submitted={updatingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Total Price"
                            name="totPrice"
                            type="number"
                            value={updateDoc.totPrice}
                            onChange={this.handleChangeItem}
                            submitted={updatingDoc}
                            inline={false}
                            required={true}
                          />
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                                  <span><FontAwesomeIcon icon={updatingDoc ? "spinner" : "edit"} className={updatingDoc ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
                                </button>
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
    return {
        alert,
        sidemenu,
    };
}

const connectedImportItem = connect(mapStateToProps)(ImportItem);
export { connectedImportItem as ImportItem };
