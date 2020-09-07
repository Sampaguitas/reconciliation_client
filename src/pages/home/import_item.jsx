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
  StringToType,
  TypeToString,
  isValidFormat,
  getDateFormat
} from '../../_functions';
import HeaderCheckBox from '../../_components/table/header-check-box';
import HeaderInput from '../../_components/table/header-input';
import HeaderSelect from '../../_components/table/header-select';
import Input from "../../_components/input";
import Layout from '../../_components/layout';
import Modal from "../../_components/modal";
import _ from 'lodash';

class ImportItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      importDoc: {
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
    this.handleClearAlert = this.handleClearAlert.bind(this);
    this.toggleCollapse = this.toggleCollapse.bind(this);
    this.toggleSort = this.toggleSort.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.handleChangeItem = this.handleChangeItem.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
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
    console.log(qs.id);
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

  toggleModal() {
    const { showCreate } = this.state;
    this.setState({
      showCreate: !showCreate,
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
              console.log(data.importDoc);
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

  handleSubmit(event) {
    event.preventDefault();
    const { newItem, filter, creating } = this.state;
    if (!isValidFormat(newItem.boeDate, 'date', getDateFormat())) {
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
                this.getDocument();
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
      this.getUsers(nextPage);
    }
  }

  generateBody() {
    const { importDoc, retrieving, paginate } = this.state;
    let tempRows = [];
    if (!_.isEmpty(importDoc.items) || !retrieving) {
      importDoc.items.map((importItem) => {
        tempRows.push(
          <tr key={importItem._id}>
            <td className="no-select">{importItem.srNr}</td>
            <td className="no-select">{importItem.desc}</td>
            <td className="no-select">{importItem.invNr}</td>
            <td className="no-select">{TypeToString(importItem.unitWeight, 'number', getDateFormat())}</td>
            <td className="no-select">{TypeToString(importItem.unitPrice, 'number', getDateFormat())}</td>
            <td className="no-select">{importItem.hsCode}</td>
            <td className="no-select">{importItem.country}</td>
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
        const { importDoc, menuItem, filter, sort, settingsColWidth, newItem, showCreate, retrieving, creating } = this.state;
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
                  {importDoc.boeNr && !retrieving ?
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
                  :
                    <div style={{height: '28.5px', paddingBottom: '7.5px'}}>
                      <Skeleton/>
                    </div>
                  }
                </nav>
                <div id="import" className={alert.message ? "main-section-alert" : "main-section"}> 
                    <div className="action-row row"> 
                            <button title="Create Import Document" className="btn btn-leeuwen-blue btn-lg" onClick={this.toggleModal}>
                                <span><FontAwesomeIcon icon="plus" className="fa mr-2"/>Create Document</span>
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
                                            title="Sr Number"
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
                                            type="number"
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
                      show={showCreate}
                      hideModal={this.toggleModal}
                      title={'Add Import Document'}
                    >
                      <div className="col-12">
                        <form
                          name="form"
                          onSubmit={this.handleSubmit}
                        >
                          <Input
                            title="Sr Number"
                            name="srNr"
                            type="text"
                            value={newItem.srNr}
                            onChange={this.handleChangeItem}
                            submitted={creating}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Description"
                            name="desc"
                            type="text"
                            value={newItem.desc}
                            onChange={this.handleChangeItem}
                            submitted={creating}
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
                            submitted={creating}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Unit Weight"
                            name="unitWeight"
                            type="number"
                            value={newItem.unitWeight}
                            onChange={this.handleChangeItem}
                            submitted={creating}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Unit Price"
                            name="unitPrice"
                            type="number"
                            value={newItem.unitPrice}
                            onChange={this.handleChangeItem}
                            submitted={creating}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="HS Code"
                            name="hsCode"
                            type="text"
                            value={newItem.hsCode}
                            onChange={this.handleChangeItem}
                            submitted={creating}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Country"
                            name="country"
                            type="text"
                            value={newItem.country}
                            onChange={this.handleChangeItem}
                            submitted={creating}
                            inline={false}
                            required={true}
                          />
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                                  <span><FontAwesomeIcon icon={creating ? "spinner" : "plus"} className={creating ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Create</span>
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
