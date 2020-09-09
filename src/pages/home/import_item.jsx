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
  arrayRemove,
  copyObject,
  getPageSize,
  TypeToString,
  StringToType,
  isValidFormat,
  getDateFormat
} from '../../_functions';
import SelectAll from '../../_components/table/select-all';
import SelectRow from '../../_components/table/select-row';
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
        qty: '',
        desc: '',
        poNr: '',
        invNr: '',
        unitWeight: '',
        totWeight: '',
        unitPrice: '',
        totPrice: '',
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
        qty: '',
        desc: '',
        poNr: '',
        invNr: '',
        totWeight: '',
        totPrice: '',
        hsCode: '',
        country: '',
      },
      editDoc: {
        decNr: '',
        boeNr: '',
        boeDate: '',
        grossWeight: '',
        totPrice: '',
      },
      retrieving: false,
      showEditDoc: false,
      showCreateLine: false,
      showEditLine: false,
      editingDoc: false,
      creatingLine: false,
      editingLine: false,
      deletingLine: false,
      menuItem: 'Import Documents',
      settingsColWidth: {},
      selectAllRows: false,
      selectedRows: [],
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
    this.toggleEditLine = this.toggleEditLine.bind(this);
    this.toggleEditDoc = this.toggleEditDoc.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.handleCreateLine = this.handleCreateLine.bind(this);
    this.handleEditLine = this.handleEditLine.bind(this);
    this.handleDeleteLine = this.handleDeleteLine.bind(this);
    this.handleEditDoc = this.handleEditDoc.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.changePage = this.changePage.bind(this);
    this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
    this.updateSelectedRows = this.updateSelectedRows.bind(this);
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
    const { importDoc, sort, filter, paginate, selectedRows } = this.state;
    if (sort != prevState.sort || (filter != prevState.filter && prevState.filter.documentId != '')  || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getDocument();
    }

    if (importDoc.items != prevState.importDoc.items) {
      this.setState({
        selectAllRows: false,
      });
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
    const { editDoc } = this.state;
    const { name, value } = event.target;
    this.setState({
      editDoc: {
        ...editDoc,
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
        qty: '',
        desc: '',
        poNr: '',
        invNr: '',
        totWeight: '',
        totPrice: '',
        hsCode: '',
        country: '',
      },
    });
  }

  toggleEditLine() {
    const { selectedRows, importDoc, showEditLine } = this.state;
    if (!!showEditLine) { 
      this.setState({
        showEditLine: false,
        newItem: {
          srNr: '',
          qty: '',
          desc: '',
          poNr: '',
          invNr: '',
          totWeight: '',
          totPrice: '',
          hsCode: '',
          country: '',
        },
      });
    } else if (_.isEmpty(selectedRows)) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'Select the line to be edited.'
        }
      });
    } else if(selectedRows.length > 1) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'Select only one line.'
        }
      });
    } else if (selectedRows.length === 1) {
      let found = importDoc.items.find(element => _.isEqual(element._id, selectedRows[0]));
      if (!_.isUndefined(found)) {
        this.setState({
          showEditLine: true,
          newItem: {
            srNr: found.srNr || '',
            qty: found.qty || '',
            desc: found.desc || '',
            poNr: found.poNr || '',
            invNr: found.invNr || '',
            totWeight: found.totWeight || '',
            totPrice: found.totPrice || '',
            hsCode: found.hsCode || '',
            country: found.country || '',
          },
        });
      }
    }
  }

  toggleEditDoc() {
    const { showEditDoc, importDoc, editDoc } = this.state;
    this.setState({
      showEditDoc: !showEditDoc,
      editDoc: {
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
        return fetch(`${config.apiUrl}/importdoc/findOne`, requestOptions)
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
            } else if (response.status === 404) {
              history.push({ pathname:'/notfound' });
            } else if (response.status === 500) {
              history.push({ pathname:'/error' });
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
            qty: newItem.qty,
            desc: newItem.desc,
            poNr: newItem.poNr,
            invNr: newItem.invNr,
            totWeight: newItem.totWeight,
            totPrice: newItem.totPrice,
            hsCode: newItem.hsCode,
            country: newItem.country,
            documentId: filter.documentId
          })
        };
        return fetch(`${config.apiUrl}/importitem/create`, requestOptions)
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

  handleEditLine(event) {
    event.preventDefault();
    const { selectedRows, newItem, filter, editingLine } = this.state;
    if (selectedRows.length === 1 && !editingLine) {
      this.setState({
        editingLine: true,
      }, () => {
        const requestOptions = {
          method: 'PUT',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: selectedRows[0],
            qty: newItem.qty,
            srNr: newItem.srNr,
            desc: newItem.desc,
            poNr: newItem.poNr,
            invNr: newItem.invNr,
            totWeight: newItem.totWeight,
            totPrice: newItem.totPrice,
            hsCode: newItem.hsCode,
            country: newItem.country
          })
        };
        return fetch(`${config.apiUrl}/importitem/update`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            editingLine: false
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
                this.toggleEditLine();
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

  handleDeleteLine(event) {
    event.preventDefault();
    const { selectedRows } = this.state;
    if (_.isEmpty(selectedRows)) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'Select line(s) to be deleted.'
        }
      });
    } else if (confirm(`You are about to permanently delete ${selectedRows.length} line(s). Click ok to proceed.`)) {
      this.setState({
        deletingLine: true
      }, () => {
        const requestOptions = {
          method: 'DELETE',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({selectedIds: selectedRows})
      };
        return fetch(`${config.apiUrl}/importitem/delete`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            deletingLine: false,
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
              }, () => this.getDocument());
            }
          });
        }))
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      })
    }
  }

  handleEditDoc(event) {
    event.preventDefault();
    const { editDoc, editingDoc } = this.state;
    if (!isValidFormat(editDoc.boeDate, 'date', getDateFormat())) {
      this.setState({
        type: 'alert-danger',
        message: 'BOE Date does not have a proper Date Format.'
      });
    } else if (!editingDoc) {
      this.setState({
        editingDoc: true,
      }, () => {
        const requestOptions = {
          method: 'PUT',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: editDoc._id,
            decNr: editDoc.decNr,
            boeNr: editDoc.boeNr,
            boeDate: StringToType(editDoc.boeDate, 'date', getDateFormat()),
            grossWeight: editDoc.grossWeight,
            totPrice: editDoc.totPrice,
          })
        };
        return fetch(`${config.apiUrl}/importdoc/update`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            editingDoc: false
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
      this.getDocument(nextPage);
    }
  }

  toggleSelectAllRow() {
    const { selectAllRows, importDoc } = this.state;
    if (!_.isEmpty(importDoc.items)) {
      if (!!selectAllRows) {
        this.setState({
          selectedRows: [],
          selectAllRows: false,
        });
      } else {
        this.setState({
          selectedRows: importDoc.items.map(importItem => importItem._id),
          selectAllRows: true
        });
      }         
    }
  }

  updateSelectedRows(id) {
    const { selectedRows } = this.state;
    if (selectedRows.includes(id)) {
        this.setState({ selectedRows: arrayRemove(selectedRows, id) });
    } else {
      this.setState({ selectedRows: [...selectedRows, id] });
    }       
  }

  generateBody() {
    const { importDoc, retrieving, paginate, settingsColWidth, selectAllRows, selectedRows } = this.state;
    let tempRows = [];
    if (!_.isEmpty(importDoc.items) || !retrieving) {
      importDoc.items.map(importItem => {
        tempRows.push(
          <tr key={importItem._id}>
            <SelectRow
              id={importItem._id}
              selectAllRows={selectAllRows}
              selectedRows={selectedRows}
              callback={this.updateSelectedRows}
            />
            <TableData colIndex="0" value={importItem.srNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="1" value={importItem.qty} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="2" value={importItem.desc} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="3" value={importItem.poNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="4" value={importItem.invNr} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="5" value={importItem.unitWeight} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="6" value={importItem.totWeight} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="7" value={importItem.unitPrice} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="8" value={importItem.totPrice} type="number" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="9" value={importItem.hsCode} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="10" value={importItem.country} type="text" settingsColWidth={settingsColWidth}/>
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
            <td><Skeleton/></td>
            <td><Skeleton/></td>
          </tr> 
        );
      }
    }
    return tempRows;
  }

    render() {
        const {
          menuItem,
          filter,
          sort,
          settingsColWidth,
          importDoc,
          editDoc, 
          newItem,
          showEditDoc,
          showCreateLine, 
          showEditLine,
          retrieving,
          editingDoc,
          creatingLine,
          editingLine,
          deletingLine,
          selectAllRows
        } = this.state;
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
                      <button title="Edit Import Document" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleEditDoc}>
                          <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Doc</span>
                      </button>
                      <button title="Download/Upload File" className="btn btn-leeuwen-blue btn-lg mr-2" > {/* onClick={this.toggleEditDoc} */}
                          <span><FontAwesomeIcon icon="upload" className="fa mr-2"/>DUF File</span>
                      </button>
                      <button title="New Line Item" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleNewLine}>
                          <span><FontAwesomeIcon icon="plus" className="fa mr-2"/>New Line</span>
                      </button>
                      <button title="New Line Item" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleEditLine}>
                          <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Line</span>
                      </button>
                      <button title="Delete Line Item(s)" className="btn btn-leeuwen btn-lg mr-2" onClick={this.handleDeleteLine}>
                          <span><FontAwesomeIcon icon={deletingLine ? "spinner" : "trash-alt"} className={deletingLine ? "fa fa-pulse fa-fw" : "fa mr-2"}/>Delete Line(s)</span>
                      </button>
                    </div>
                    <div className="body-section">
                        <div className="row ml-1 mr-1" style={{height: 'calc(100% - 41.5px)'}}> {/* borderStyle: 'solid', borderWidth: '1px', borderColor: '#ddd', */}
                            <div id="table-container" className="table-responsive custom-table-container custom-table-container__fixed-row" >
                                <table className="table table-hover table-bordered table-sm">
                                    <thead>
                                        <tr>
                                        <SelectAll
                                          checked={selectAllRows}
                                          onChange={this.toggleSelectAllRow}
                                        />
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
                                            type="number"
                                            title="Qty"
                                            name="qty"
                                            value={filter.qty}
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
                                            title="Descripion"
                                            name="desc"
                                            value={filter.desc}
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
                                            title="PO Number"
                                            name="poNr"
                                            value={filter.poNr}
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
                                            title="Inv Number"
                                            name="invNr"
                                            value={filter.invNr}
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
                                            title="Unit Weight"
                                            name="unitWeight"
                                            value={filter.unitWeight}
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
                                            title="Total Weight"
                                            name="totWeight"
                                            value={filter.totWeight}
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
                                            title="Unit Price"
                                            name="unitPrice"
                                            value={filter.unitPrice}
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
                                            name="totPrice"
                                            value={filter.totPrice}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="8"
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
                                            index="9"
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
                                            index="10"
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
                            title="Qty"
                            name="qty"
                            type="number"
                            value={newItem.qty}
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
                            title="PO Nr"
                            name="poNr"
                            type="text"
                            value={newItem.poNr}
                            onChange={this.handleChangeItem}
                            // placeholder={getDateFormat()}
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
                            title="Total Weight"
                            name="totWeight"
                            type="number"
                            value={newItem.totWeight}
                            onChange={this.handleChangeItem}
                            submitted={creatingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Total Price"
                            name="totPrice"
                            type="number"
                            value={newItem.totPrice}
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
                      show={showEditLine}
                      hideModal={this.toggleEditLine}
                      title={'Edit Line'}
                    >
                      <div className="col-12">
                        <form
                          name="form"
                          onSubmit={this.handleEditLine}
                        >
                          <Input
                            title="SrNo"
                            name="srNr"
                            type="number"
                            value={newItem.srNr}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Qty"
                            name="qty"
                            type="number"
                            value={newItem.qty}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Description"
                            name="desc"
                            type="text"
                            value={newItem.desc}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="PO Nr"
                            name="poNr"
                            type="text"
                            value={newItem.poNr}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Inv Nr"
                            name="invNr"
                            type="text"
                            value={newItem.invNr}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Total Weight"
                            name="totWeight"
                            type="number"
                            value={newItem.totWeight}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Total Price"
                            name="totPrice"
                            type="number"
                            value={newItem.totPrice}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="HS Code"
                            name="hsCode"
                            type="text"
                            value={newItem.hsCode}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Country"
                            name="country"
                            type="text"
                            value={newItem.country}
                            onChange={this.handleChangeItem}
                            submitted={editingLine}
                            inline={false}
                            required={true}
                          />
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                                  <span><FontAwesomeIcon icon={editingLine ? "spinner" : "edit"} className={editingLine ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
                                </button>
                            </div>
                        </form>
                      </div>
                    </Modal>

                    <Modal
                      show={showEditDoc}
                      hideModal={this.toggleEditDoc}
                      title={'Update Import Document'}
                    >
                      <div className="col-12">
                        <form
                          name="form"
                          onSubmit={this.handleEditDoc}
                        >
                          <Input
                            title="SrNo"
                            name="decNr"
                            type="text"
                            value={editDoc.decNr}
                            onChange={this.handleChangeDoc}
                            submitted={editingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Description"
                            name="boeNr"
                            type="text"
                            value={editDoc.boeNr}
                            onChange={this.handleChangeDoc}
                            submitted={editingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Date"
                            name="boeDate"
                            type="text"
                            value={editDoc.boeDate}
                            onChange={this.handleChangeDoc}
                            placeholder={getDateFormat()}
                            submitted={editingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Gross Weight"
                            name="grossWeight"
                            type="number"
                            value={editDoc.grossWeight}
                            onChange={this.handleChangeDoc}
                            submitted={editingDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Total Price"
                            name="totPrice"
                            type="number"
                            value={editDoc.totPrice}
                            onChange={this.handleChangeDoc}
                            submitted={editingDoc}
                            inline={false}
                            required={true}
                          />
                            <div className="modal-footer">
                                <button type="submit" className="btn btn-leeuwen-blue btn-lg btn-full">
                                  <span><FontAwesomeIcon icon={editingDoc ? "spinner" : "edit"} className={editingDoc ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
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
