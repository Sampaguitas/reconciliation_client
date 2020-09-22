import React from 'react';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { saveAs } from 'file-saver';
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

class ExportItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      exportDoc: {
        _id: '',
        invNr: '',
        currency: '',
        exRate: '',
        decNr: '',
        boeNr: '',
        boeDate: '',
        pcs: '',
        mtr: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalPrice: '',
        isClosed: '',
        fileName: '',
        summary: [],
        items: [],
      },
      editDoc: {
        invNr: '',
        currency: '',
        exRate: '',
        decNr: '',
        boeNr: '',
        boeDate: '',
      },
      fileName: '',
      fileKey: Date.now(),
      dufName: '',
      dufKey: Date.now(),
      responce: {},
      filter: {
        srNr: '',
        artNr: '',
        desc: '',
        poNr: '',
        pcs: '',
        mtr: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        unitPrice: '',
        totalPrice: '',
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
      showSummary: false,
      showEditDoc: false,
      showFile: false,
      showDuf: false,
      retrieving: false,
      deletingDoc: false,
      editingDoc: false,
      uploadingFile: false,
      downloadingFile: false,
      downloadingDuf: false,
      uploadingDuf: false,
      deletingLine: false,
      menuItem: 'Export Documents',
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
    this.handleChangeDoc = this.handleChangeDoc.bind(this);
    this.handleChangeDuf = this.handleChangeDuf.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.toggleSummary = this.toggleSummary.bind(this);
    this.toggleEditDoc = this.toggleEditDoc.bind(this);
    this.toggleDuf = this.toggleDuf.bind(this);
    this.toggleFile = this.toggleFile.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.handleDeleteDoc = this.handleDeleteDoc.bind(this);
    this.handleEditDoc = this.handleEditDoc.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
    this.handleDownloadFile = this.handleDownloadFile.bind(this);
    this.handleUploadDuf = this.handleUploadDuf.bind(this);
    this.handleDownloadDuf = this.handleDownloadDuf.bind(this);
    this.handleDeleteLine = this.handleDeleteLine.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.changePage = this.changePage.bind(this);
    this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
    this.updateSelectedRows = this.updateSelectedRows.bind(this);
    this.dufInput = React.createRef();
    this.fileInput = React.createRef();
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
    const { exportDoc, sort, filter, paginate, selectedRows } = this.state;
    if (sort != prevState.sort || (filter != prevState.filter && prevState.filter.documentId != '')  || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getDocument();
    }

    if (exportDoc.items != prevState.exportDoc.items) {
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

  handleChangeDuf(event) {
    if(event.target.files.length > 0) {
      this.setState({
          ...this.state,
          dufName: event.target.files[0].name
      });
    }
  }

  handleChangeFile(event){
    if(event.target.files.length > 0) {
        this.setState({
            ...this.state,
            fileName: event.target.files[0].name
        });
    }
  }

  generateRejectionDuf(responce){
    let temp =[]
    if (!_.isEmpty(responce.rejections)) {
        responce.rejections.map(function(r, index) {
            temp.push(
                <tr key={index}>
                    <td>{r.row}</td>
                    <td>{r.reason}</td>
                </tr>
            );
        });
        return (temp);
    } else {
        return (
            <tr>
                <td></td>
                <td></td>
            </tr>
        );
    }
  }

  toggleEditDoc() {
    const { showEditDoc, exportDoc, editDoc } = this.state;
    this.setState({
      showEditDoc: !showEditDoc,
      editDoc: {
        _id: exportDoc._id,
        invNr: exportDoc.invNr,
        currency: exportDoc.currency,
        exRate: exportDoc.exRate,
        decNr: exportDoc.decNr,
        boeNr: exportDoc.boeNr,
        boeDate: TypeToString(exportDoc.boeDate, 'date', getDateFormat()),
      }
    });
  }

  toggleSummary() {
    const { showSummary } = this.state;
    this.setState({ showSummary: !showSummary });
  }

  toggleDuf(event) {
    event.preventDefault();
    const { showDuf } = this.state;
    this.setState({
        showDuf: !showDuf,
        alert: {
            type:'',
            message:''
        },
        dufKey: Date.now(),
        dufName: '',
        responce:{}
    });
  }

  toggleFile(event) {
    event.preventDefault();
    const { showFile, exportDoc } = this.state;
    this.setState({
        showFile: !showFile,
        alert: {
            type:'',
            message:''
        },
        fileKey: Date.now(),
        fileName: exportDoc.fileName || ''
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
        return fetch(`${config.apiUrl}/exportdoc/findOne`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            retrieving: false,
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
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
                exportDoc: data.exportDoc,
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
            invNr: editDoc.invNr,
            currency: editDoc.currency,
            exRate: editDoc.exRate,
            decNr: editDoc.decNr,
            boeNr: editDoc.boeNr,
            boeDate: StringToType(editDoc.boeDate, 'date', getDateFormat()),
          })
        };
        return fetch(`${config.apiUrl}/exportdoc/update`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            editingDoc: false
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
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

  handleDeleteDoc(event) {
    event.preventDefault();
    const { exportDoc, deletingDoc } = this.state;
    if (!!exportDoc._id && !deletingDoc) {
      this.setState({
        deletingDoc
      }, () => {
        const requestOptions = {
          method: 'DELETE',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({
            documentId: exportDoc._id
          })
        }
        return fetch(`${config.apiUrl}/exportdoc/delete`, requestOptions)
        .then(responce => {
          if (responce.status === 401) {
              localStorage.removeItem('user');
              location.reload(true);
          } else if (responce.status != 200) {
              this.setState({
                  downloadingFile: false,
                  alert: {
                    type: 'alert-danger',
                    message: 'An error has occured.'  
                  }
              });
          } else {
              this.setState({
                  downloadingFile: false,
                  alert: {
                    type: 'alert-success',
                    message: 'Document has successfully been deleted, we will redirect you in a second.'
                  }
              }, () => setTimeout( () => history.push({ pathname:'/exportdoc' }), 1000));
          }
        });
      })
    }
  }

  handleDownloadFile(event) {
    event.preventDefault();
    const { exportDoc, downloadingFile } = this.state;
    if (exportDoc._id && exportDoc.fileName && !downloadingFile) {
      this.setState({
          downloadingFile: true
      }, () => {
        const requestOptions = {
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json'},
        };
        return fetch(`${config.apiUrl}/exportdoc/downloadFile?documentId=${exportDoc._id}`, requestOptions)
        .then(responce => {
          if (responce.status === 401) {
              localStorage.removeItem('user');
              location.reload(true);
          } else if (responce.status === 400) {
              this.setState({
                  downloadingFile: false,
                  alert: {
                    type: 'alert-danger',
                    message: 'an error has occured'  
                  }
              });
          } else {
              this.setState({
                  downloadingFile: false
              }, () => responce.blob().then(blob => saveAs(blob, exportDoc.fileName)));
          }
        });
      });
    }
  }

  handleUploadFile(event){
    event.preventDefault();
    const { exportDoc, fileName, uploadingFile } = this.state;
    if(!!this.fileInput.current && !!exportDoc._id && !!fileName && !uploadingFile) {
      this.setState({
          uploadingFile: true
      }, () => {
        var data = new FormData()
        data.append('file', this.fileInput.current.files[0])
        data.append('documentId', exportDoc._id)
        const requestOptions = {
          method: 'POST',
          headers: { ...authHeader()}, //, 'Content-Type': 'application/json'
          body: data
        }
        return fetch(`${config.apiUrl}/exportdoc/uploadFile`, requestOptions)
        .then(responce => responce.text().then(text => {
          this.setState({
            uploadingFile: false
          }, () => {
            const data = text && JSON.parse(text);
            if (responce.status === 401) {
                    localStorage.removeItem('user');
                    location.reload(true);
            } else {
              this.setState({
                alert: {
                  type: responce.status === 200 ? 'alert-success' : 'alert-danger',
                  message: data.message
                }
              }, () => this.getDocument());
            }
          });
        }));
      });           
    }        
  }

  handleDownloadDuf(event){
    event.preventDefault();
    const { downloadingDuf } = this.state;
    if (!downloadingDuf) {
      this.setState({
        downloadingDuf: true
      }, () => {
        const requestOptions = {
          method: 'GET',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
        }
        return fetch(`${config.apiUrl}/exportitem/downloadDuf`, requestOptions)
        .then(responce => {
            if (responce.status === 401) {
                    localStorage.removeItem('user');
                    location.reload(true);
            } else if (responce.status === 400) {
                this.setState({
                    downloadingDuf: false,
                    alert: {
                        type: 'alert-danger',
                        message: 'an error has occured'  
                    }
                });
            } else {
                this.setState({
                    downloadingDuf: false
                }, () => responce.blob().then(blob => saveAs(blob, 'Duf.xlsx')));
            }
        });
      });
    }
  }

  handleUploadDuf(event) {
    event.preventDefault();
    const { exportDoc, uploadingDuf } = this.state
    if(!uploadingDuf && !!this.dufInput.current && !!exportDoc._id && !uploadingDuf) {
      this.setState({uploadingDuf: true});
      var data = new FormData()
      data.append('file', this.dufInput.current.files[0]);
      data.append('documentId', exportDoc._id);
      const requestOptions = {
          method: 'POST',
          headers: { ...authHeader()}, //, 'Content-Type': 'application/json'
          body: data
      }
      return fetch(`${config.apiUrl}/exportitem/uploadDuf`, requestOptions)
      .then(responce => responce.text().then(text => {
          const data = text && JSON.parse(text);
          console.log(responce.status);
          if (responce.status === 401) {
                  localStorage.removeItem('user');
                  location.reload(true);
          } else {
            this.setState({
                uploadingDuf: false,
                responce: {
                    rejections: data.rejections,
                    nProcessed: data.nProcessed,
                    nRejected: data.nRejected,
                    nAdded: data.nAdded,
                },
                alert: {
                    type: responce.status === 200 ? 'alert-success' : 'alert-danger',
                    message: data.message
                }
            }, () => this.getDocument());
          }
      }));           
    }
  }

  handleDeleteLine(event) {
    event.preventDefault();
    const { selectedRows, deletingLine } = this.state;
    if (_.isEmpty(selectedRows)) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'Select line(s) to be deleted.'
        }
      });
    } else if (!deletingLine && confirm(`You are about to permanently delete ${selectedRows.length} line(s). Click ok to proceed.`)) {
      this.setState({
        deletingLine: true
      }, () => {
        const requestOptions = {
          method: 'DELETE',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({selectedIds: selectedRows})
      };
        return fetch(`${config.apiUrl}/exportitem/delete`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            deletingLine: false,
          }, () => {
            const data = text && JSON.parse(text);
            const resMsg = (data && data.message) || response.statusText;
            if (response.status === 401) {
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
    const { selectAllRows, exportDoc } = this.state;
    if (!_.isEmpty(exportDoc.items)) {
      if (!!selectAllRows) {
        this.setState({
          selectedRows: [],
          selectAllRows: false,
        });
      } else {
        this.setState({
          selectedRows: exportDoc.items.map(exportItem => exportItem._id),
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
    const { exportDoc, retrieving, paginate, settingsColWidth, selectAllRows, selectedRows } = this.state;
    let tempRows = [];
    if (!_.isEmpty(exportDoc.items) || !retrieving) {
      exportDoc.items.map(exportItem => {
        tempRows.push(
          <tr key={exportItem._id}>
            <SelectRow
              id={exportItem._id}
              selectAllRows={selectAllRows}
              selectedRows={selectedRows}
              callback={this.updateSelectedRows}
            />
            <TableData colIndex="0" value={exportItem.srNr} type="text" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="1" value={exportItem.artNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="2" value={exportItem.desc} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="3" value={exportItem.poNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="4" value={exportItem.pcs} type="text" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="5" value={exportItem.mtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="6" value={exportItem.totalNetWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="7" value={exportItem.totalGrossWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="8" value={exportItem.unitPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="9" value={exportItem.totalPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
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
          </tr> 
        );
      }
    }
    return tempRows;
  }

  generateSubBody() {
    const { exportDoc, retrieving } = this.state;
    let tempRows = [];
    if (!_.isEmpty(exportDoc.summary) || !retrieving) {
      exportDoc.summary.map(group => {
        tempRows.push(
          <tr key={group._id}>
            <TableData value={group.hsCode} type="text" align="center"/>
            <TableData value={group.hsDesc} type="text"/>
            <TableData value={group.country} type="text"/>
            <TableData value={group.pcs} type="number" align="right"/>
            <TableData value={group.mtr} type="number" align="right"/>
            <TableData value={group.totalNetWeight} type="number" align="right"/>
            <TableData value={group.totalGrossWeight} type="number" align="right"/>
            <TableData value={group.totalPrice} type="number" align="right"/>
          </tr>
        );
      });
    } else {
      for (let i = 0; i < 11; i++) {
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
          exportDoc,
          editDoc,
          fileName,
          fileKey,
          dufName,
          dufKey,
          responce,
          showSummary,
          showEditDoc,
          showFile,
          showDuf,
          retrieving,
          deletingDoc,
          editingDoc,
          downloadingFile,
          uploadingFile,
          downloadingDuf,
          uploadingDuf,
          deletingLine,
          selectAllRows
        } = this.state;
        const { currentPage, firstItem, lastItem, pageItems, pageLast, totalItems, first, second, third} = this.state.paginate;
        const { sidemenu } = this.props;
        const alert = this.state.alert.message ? this.state.alert : this.props.alert;

        return (
            <Layout sidemenu={sidemenu} toggleCollapse={this.toggleCollapse} menuItem={menuItem}>
                {alert.message && !showSummary && !showEditDoc && !showFile && !showDuf &&
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                        </button>
                    </div>
                }
                <nav aria-label="breadcrumb">
                  {!exportDoc.boeNr && !!retrieving ?
                    <div style={{height: '28.5px', paddingBottom: '7.5px'}}>
                      <Skeleton/>
                    </div>
                  :
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                          <NavLink to={{ pathname: '/' }} tag="a">Home</NavLink>
                      </li>
                      <li className="breadcrumb-item">
                          <NavLink to={{ pathname: '/export_doc' }} tag="a">Export Documents</NavLink>
                      </li>
                      <li className="breadcrumb-item active flex-grow-1" aria-current="page">
                        {`${exportDoc.invNr ? "Invoice: " + exportDoc.invNr : ""}
                          ${exportDoc.decNr ? " / DOC: " + exportDoc.decNr + " BOE: " + exportDoc.boeNr : ""}
                          ${exportDoc.boeDate ? " dated: " + TypeToString(exportDoc.boeDate, 'date', getDateFormat()) : ""}
                          ${exportDoc.pcs ? " / pcs: " + TypeToString(exportDoc.pcs, 'number', getDateFormat()) + " pcs" : ""}
                          ${exportDoc.totalGrossWeight ? " / weight: " + TypeToString(exportDoc.totalGrossWeight, 'number', getDateFormat()) + " kgs" : ""}
                          ${exportDoc.totalPrice ? " / value: " + TypeToString(exportDoc.totalPrice, 'number', getDateFormat()) + " aed" : ""}
                          ${exportDoc.isClosed ? ' / status: closed' : ' / status: open'}
                        `}
                      </li>
                    </ol>
                  }
                </nav>
                <div id="export" className={alert.message && !showSummary && !showEditDoc && !showFile && !showDuf ? "main-section-alert" : "main-section"}> 
                    <div className="action-row row">
                      <button title="Show Summary" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleSummary}>
                          <span><FontAwesomeIcon icon="table" className="fa mr-2"/>Summary</span>
                      </button>
                      <button title="Edit Export Document" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleEditDoc}>
                          <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Doc</span>
                      </button>
                      <button title="Download/Upload File" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleFile}>
                          <span><FontAwesomeIcon icon="file-excel" className="fa mr-2"/>Attachment</span>
                      </button>
                      <button title="Download/Upload File" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleDuf}>
                          <span><FontAwesomeIcon icon="upload" className="fa mr-2"/>DUF File</span>
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
                                            title="#"
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
                                            title="Art Nr"
                                            name="artNr"
                                            value={filter.artNr}
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
                                            title="PO Nr"
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
                                            type="number"
                                            title="Pcs"
                                            name="pcs"
                                            value={filter.pcs}
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
                                            title="Mtr"
                                            name="mtr"
                                            value={filter.mtr}
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
                                            title={`Unit Price (${exportDoc.currency})`}
                                            name="unitPrice"
                                            value={filter.unitPrice}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="8"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title={`Total Price (${exportDoc.currency})`}
                                            name="totalPrice"
                                            value={filter.totalPrice}
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
                      show={showSummary}
                      hideModal={this.toggleSummary}
                      title={'Summary'}
                      size="modal-xl"
                    >
                      <div className="row ml-1 mr-1" style={{maxHeight: '400px'}}>
                        <div id="table-summary" className="table-responsive custom-table-container">
                          <table className="table table-hover table-bordered table-sm">
                            <thead>
                              <tr>
                                <th scope="col">HS Code</th>
                                <th scope="col">Description</th>
                                <th scope="col">Country</th>
                                <th scope="col">Pcs</th>
                                <th scope="col">Mtr</th>
                                <th scope="col">Net Weight</th>
                                <th scope="col">Gross Weight</th>
                                <th scope="col">Total Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {this.generateSubBody()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </Modal>
                    <Modal
                      show={showEditDoc}
                      hideModal={this.toggleEditDoc}
                      title={'Update Export Document'}
                    >
                        <form
                          name="form"
                          className="col-12"
                          style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                          onSubmit={this.handleEditDoc}
                        >
                          <Input
                            title="Inv Nr"
                            name="invNr"
                            type="text"
                            value={editDoc.invNr}
                            onChange={this.handleChangeDoc}
                            placeholder="ddddddd-dd"
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Currency"
                            name="currency"
                            type="text"
                            value={editDoc.currency}
                            onChange={this.handleChangeDoc}
                            placeholder="AAA"
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Exchange Rate"
                            name="exRate"
                            type="number"
                            value={editDoc.exRate}
                            onChange={this.handleChangeDoc}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="DEC Nr"
                            name="decNr"
                            type="text"
                            value={editDoc.decNr}
                            onChange={this.handleChangeDoc}
                            placeholder="ddd-dddddddd-dd"
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="BOE Nr"
                            name="boeNr"
                            type="text"
                            value={editDoc.boeNr}
                            onChange={this.handleChangeDoc}
                            placeholder="dddddddddddd"
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
                            inline={false}
                            required={true}
                          />
                          <div className="modal-footer">
                              <button className="btn btn-leeuwen btn-lg mr-2" onClick={event => this.handleDeleteDoc(event)}>
                                <span><FontAwesomeIcon icon={deletingDoc ? "spinner" : "trash-alt"} className={deletingDoc ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Delete</span>
                              </button>
                              <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                                <span><FontAwesomeIcon icon={editingDoc ? "spinner" : "edit"} className={editingDoc ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
                              </button>
                          </div>
                        </form>
                    </Modal>
                    <Modal
                      show={showFile}
                      hideModal={this.toggleFile}
                      title="Attachment"
                      size="modal-lg"
                    >
                      <div className="col-12">
                        {alert.message &&
                          <div className="row">
                            <div className="col-12" style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}>
                              <div className={`alert ${alert.type}`}> {alert.message}
                                <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                                    <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                        <div className="row">
                          <form
                            className="col-12"
                            encType="multipart/form-data"
                            onSubmit={this.handleUploadFile}
                            style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                          >
                            <div className="input-group">
                                <div className="input-group-prepend">
                                    <span className="input-group-text" style={{width: '95px'}}>Select Document</span>
                                    <input
                                        type="file"
                                        name="fileInput"
                                        id="fileInput"
                                        ref={this.fileInput}
                                        className="custom-file-input"
                                        style={{opacity: 0, position: 'absolute', pointerEvents: 'none', width: '1px'}}
                                        onChange={this.handleChangeFile}
                                        key={fileKey}
                                    />
                                </div>
                                <label type="text" className="form-control text-left" htmlFor="fileInput" style={{display:'inline-block', padding: '7px'}}>{fileName ? fileName : 'Choose file...'}</label>
                                <div className="input-group-append">
                                    <button type="submit" className={`btn btn-outline-leeuwen-blue btn-lg ${!this.fileInput.current ? " disabled" : ""}`}>
                                        <span><FontAwesomeIcon icon={uploadingFile ? "spinner" : "upload"} className={uploadingFile ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Upload</span>
                                    </button>
                                    <button className={`btn btn-outline-leeuwen-blue btn-lg${!exportDoc.fileName ? " disabled" : ""}`} onClick={event => this.handleDownloadFile(event)}>
                                        <span><FontAwesomeIcon icon={downloadingFile ? "spinner" : "download"} className={downloadingFile ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Download</span>
                                    </button>   
                                </div>
                            </div>
                          </form>
                        </div>
                      </div>
                    </Modal>
                    <Modal
                      show={showDuf}
                      hideModal={this.toggleDuf}
                      title="Download/Upload File"
                      size="modal-lg"
                    >
                        <div className="col-12">
                            {alert.message &&
                              <div className="row">
                                <div className="col-12" style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}>
                                  <div className={`alert ${alert.type}`}> {alert.message}
                                    <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                                        <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            }
                            <div className="row">
                                <form
                                  className="col-12"
                                  encType="multipart/form-data"
                                  onSubmit={this.handleUploadDuf}
                                  style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                                >
                                    <div className="input-group">
                                      <div className="input-group-prepend">
                                        <span className="input-group-text" style={{width: '95px'}}>Select Template</span>
                                        <input
                                            type="file"
                                            name="dufInput"
                                            id="dufInput"
                                            ref={this.dufInput}
                                            className="custom-file-input"
                                            style={{opacity: 0, position: 'absolute', pointerEvents: 'none', width: '1px'}}
                                            onChange={this.handleChangeDuf}
                                            key={dufKey}
                                        />
                                      </div>
                                      <label type="text" className="form-control text-left" htmlFor="dufInput" style={{display:'inline-block', padding: '7px'}}>{dufName ? dufName : 'Choose file...'}</label>
                                      <div className="input-group-append">
                                        <button type="submit" className={`btn btn-outline-leeuwen-blue btn-lg ${!this.dufInput.current ? " disabled" : ""}`}>
                                            <span><FontAwesomeIcon icon={uploadingDuf ? "spinner" : "upload"} className={uploadingDuf ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Upload</span>
                                        </button>
                                        <button className="btn btn-outline-leeuwen-blue btn-lg" onClick={this.handleDownloadDuf}>
                                            <span><FontAwesomeIcon icon={downloadingDuf ? "spinner" : "download"} className={downloadingDuf ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Download</span>
                                        </button> 
                                      </div>       
                                    </div>
                                </form>                    
                            </div>
                            {!_.isEmpty(responce) &&
                              <div className="row">
                                <div className="col-12" style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}>
                                  <div className="form-group mt-2 mb-0">
                                    <strong>Total Processed:</strong> {responce.nProcessed}<br />
                                    <strong>Total Records Added:</strong> {responce.nAdded}<br />
                                    <strong>Total Records Rejected:</strong> {responce.nRejected}<br />
                                  </div>
                                  {!_.isEmpty(responce.rejections) &&
                                    <div className="rejections mt-2 mb-0">
                                      <h3>Rejections</h3>
                                        <table className="table table-sm">
                                            <thead>
                                              <tr>
                                                <th style={{width: '10%'}}>Row</th>
                                                <th style={{width: '90%'}}>Reason</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                                {this.generateRejectionDuf(responce)}
                                            </tbody>
                                        </table>
                                    </div>
                                  }
                                </div>
                              </div>
                            }
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

const connectedExportItem = connect(mapStateToProps)(ExportItem);
export { connectedExportItem as ExportItem };
