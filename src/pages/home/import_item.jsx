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
  doesMatch,
  getDateFormat,
  getPageSize,
  isValidFormat,
  stringToType,
  summarySorted,
  typeToString,
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
        sfiNr: '',
        boeDate: '',
        pcs: '',
        mtr: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalPrice: '',
        isClosed: '',
        summary: [],
        fileName: '',
        items: [],
      },
      editDoc: {
        decNr: '',
        boeNr: '',
        sfiNr: '',
        boeDate: '',
      },
      editItem: {
        _id: '',
        srNr: '',
        invNr: '',
        poNr: '',
        artNr: '',
        desc: '',
        pcs: '',
        mtr: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalPrice: '',
        hsCode: '',
        hsDesc: '',
        country: '',
      },
      fileName: '',
      fileKey: Date.now(),
      dufName: '',
      dufKey: Date.now(),
      responce: {},
      filter: {
        srNr: '',
        invNr: '',
        poNr: '',
        artNr: '',
        desc: '',
        pcs: '',
        mrt: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        unitPrice: '',
        totalPrice: '',
        hsCode: '',
        country: '',
        documentId: '',
        remainingPcs: '',
        remainingMtr: '',
      },
      filterGroup: {
        hsCode: '',
        hsDesc: '',
        country: '',
        pcs: '',
        mtr: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalPrice: '',
      },
      sort: {
          name: '',
          isAscending: true,
      },
      sortGroup: {
        name: '',
        isAscending: true,
      },
      alert: {
          type: '',
          message: ''
      },
      showSummary: false,
      showEditDoc: false,
      showEditItem: false,
      showFile: false,
      showDuf: false,
      retrieving: false,
      deletingDoc: false,
      editingDoc: false,
      editingItem: false,
      uploadingFile: false,
      downloadingFile: false,
      downloadingDuf: false,
      uploadingDuf: false,
      deletingLine: false,
      menuItem: 'Import Documents',
      settingsColWidth: {},
      selectAllRows: false,
      selectedRows: [],
      windowHeight: 0,
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
    this.toggleSortGroup = this.toggleSortGroup.bind(this);
    this.handleChangeHeader = this.handleChangeHeader.bind(this);
    this.handleChangeHeaderGroup = this.handleChangeHeaderGroup.bind(this);
    this.handleChangeDoc = this.handleChangeDoc.bind(this);
    this.handleChangeItem = this.handleChangeItem.bind(this);
    this.handleChangeDuf = this.handleChangeDuf.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.toggleSummary = this.toggleSummary.bind(this);
    this.toggleEditDoc = this.toggleEditDoc.bind(this);
    this.toggleEditItem = this.toggleEditItem.bind(this);
    this.toggleDuf = this.toggleDuf.bind(this);
    this.toggleFile = this.toggleFile.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.handleDeleteDoc = this.handleDeleteDoc.bind(this);
    this.handleEditDoc = this.handleEditDoc.bind(this);
    this.handleEditItem = this.handleEditItem.bind(this);
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
      windowHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer.clientHeight)
      }
    }, () => this.getDocument());

    //window.addEventListener('resize', this.recize);
  }

    // componentWillUnmount() {
  //   window.removeEventListener('resize', this.recize);
  // }

  recize() {
    const { paginate } = this.state;
    const tableContainer = document.getElementById('table-container');
    this.setState({
      windowHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer.clientHeight)
      }
    }, () => this.getDocument());
  }

  componentDidUpdate(prevProps, prevState) {
    const { importDoc, sort, filter, paginate, selectedRows } = this.state;
    if (sort != prevState.sort || (filter != prevState.filter && prevState.filter.documentId != '')  || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getDocument();
    }

    if (importDoc.items != prevState.importDoc.items) {
      let remaining = selectedRows.reduce(function(acc, cur) {
        let found = importDoc.items.find(element => _.isEqual(element._id, cur));
        if (!_.isUndefined(found)){
          acc.push(cur);
        }
        return acc;
      }, []);
      this.setState({
        selectedRows: remaining,
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

  toggleSortGroup(event, name) {
    event.preventDefault();
    const { sortGroup } = this.state;
    if (sortGroup.name != name) {
      this.setState({
        sortGroup: {
          name: name,
          isAscending: true
        }
      });
    } else if (!!sortGroup.isAscending) {
      this.setState({
        sortGroup: {
          name: name,
          isAscending: false
        }
      });
    } else {
      this.setState({
        sortGroup: {
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

  handleChangeHeaderGroup(event) {
    const { filterGroup } = this.state;
    const { name, value } = event.target;
    this.setState({
      filterGroup: {
        ...filterGroup,
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

  handleChangeItem(event) {
    const { editItem } = this.state;
    const { name, value } = event.target;
    this.setState({
      editItem: {
        ...editItem,
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
    const { showEditDoc, importDoc, editDoc } = this.state;
    this.setState({
      showEditDoc: !showEditDoc,
      editDoc: {
        _id: importDoc._id,
        decNr: importDoc.decNr,
        boeNr: importDoc.boeNr,
        sfiNr: importDoc.sfiNr,
        boeDate: typeToString(importDoc.boeDate, 'date', getDateFormat()),
      }
    });
  }

  toggleEditItem() {
    const { showEditItem, importDoc, selectedRows } = this.state;
    if (!!showEditItem) {
      this.setState({
        showEditItem: false,
        editItem: {
          _id: '',
          srNr: '',
          invNr: '',
          poNr: '',
          artNr: '',
          desc: '',
          pcs: '',
          mtr: '',
          totalNetWeight: '',
          totalGrossWeight: '',
          totalPrice: '',
          hsCode: '',
          hsDesc: '',
          country: '',
        }
      });
    } else if (_.isEqual(selectedRows.length, 1)) {
      let found = importDoc.items.find(element => _.isEqual(element._id, selectedRows[0]));
      if (!_.isUndefined(found)) {
        this.setState({
          showEditItem: true,
          editItem: {
            _id: found._id,
            srNr: found.srNr,
            invNr: found.invNr,
            poNr: found.poNr,
            artNr: found.artNr,
            desc: found.desc,
            pcs: found.pcs,
            mtr: found.mtr,
            totalNetWeight: found.totalNetWeight,
            totalGrossWeight: found.totalGrossWeight,
            totalPrice: found.totalPrice,
            hsCode: found.hsCode,
            hsDesc: found.hsDesc,
            country: found.country,
          }
        });
      }
    }
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
    const { showFile, importDoc } = this.state;
    this.setState({
        showFile: !showFile,
        alert: {
            type:'',
            message:''
        },
        fileKey: Date.now(),
        fileName: importDoc.fileName || ''
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
            sfiNr: editDoc.sfiNr,
            boeDate: stringToType(editDoc.boeDate, 'date', getDateFormat()),
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

  handleEditItem(event) {
    event.preventDefault();
    const { editItem, editingItem } = this.state;
    if (!editingItem) {
      this.setState({
        editingItem: true,
      }, () => {
        const requestOptions = {
          method: 'PUT',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: editItem._id,
            srNr: editItem.srNr,
            invNr: editItem.invNr,
            poNr: editItem.poNr,
            artNr: editItem.artNr,
            desc: editItem.desc,
            pcs: editItem.pcs,
            mtr: editItem.mtr,
            totalNetWeight: editItem.totalNetWeight,
            totalGrossWeight: editItem.totalGrossWeight,
            totalPrice: editItem.totalPrice,
            hsCode: editItem.hsCode,
            hsDesc: editItem.hsDesc,
            country: editItem.country,
          })
        };
        return fetch(`${config.apiUrl}/importitem/update`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            editingItem: false
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
                this.toggleEditItem();
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
    const { importDoc, deletingDoc } = this.state;
    if (!!importDoc._id && !deletingDoc) {
      this.setState({
        deletingDoc
      }, () => {
        const requestOptions = {
          method: 'DELETE',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({
            documentId: importDoc._id
          })
        }
        return fetch(`${config.apiUrl}/importdoc/delete`, requestOptions)
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
              }, () => setTimeout( () => history.push({ pathname:'/importdoc' }), 1000));
          }
        })
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      })
    }
  }

  handleDownloadFile(event) {
    event.preventDefault();
    const { importDoc, downloadingFile } = this.state;
    if (importDoc._id && importDoc.fileName && !downloadingFile) {
      this.setState({
          downloadingFile: true
      }, () => {
        const requestOptions = {
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json'},
        };
        return fetch(`${config.apiUrl}/importdoc/downloadFile?documentId=${importDoc._id}`, requestOptions)
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
              }, () => responce.blob().then(blob => saveAs(blob, importDoc.fileName)));
          }
        })
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      });
    }
  }

  handleUploadFile(event){
    event.preventDefault();
    const { importDoc, fileName, uploadingFile } = this.state;
    if(!!this.fileInput.current && !!importDoc._id && !!fileName && !uploadingFile) {
      this.setState({
          uploadingFile: true
      }, () => {
        var data = new FormData()
        data.append('file', this.fileInput.current.files[0])
        data.append('documentId', importDoc._id)
        const requestOptions = {
          method: 'POST',
          headers: { ...authHeader()}, //, 'Content-Type': 'application/json'
          body: data
        }
        return fetch(`${config.apiUrl}/importdoc/uploadFile`, requestOptions)
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
        }))
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
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
        return fetch(`${config.apiUrl}/importitem/downloadDuf`, requestOptions)
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
        })
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      });
    }
  }

  handleUploadDuf(event) {
    event.preventDefault();
    const { importDoc, uploadingDuf } = this.state
    if(!uploadingDuf && !!this.dufInput.current && !!importDoc._id && !uploadingDuf) {
      this.setState({uploadingDuf: true});
      var data = new FormData()
      data.append('file', this.dufInput.current.files[0]);
      data.append('documentId', importDoc._id);
      const requestOptions = {
          method: 'POST',
          headers: { ...authHeader()}, //, 'Content-Type': 'application/json'
          body: data
      }
      return fetch(`${config.apiUrl}/importitem/uploadDuf`, requestOptions)
      .then(responce => responce.text().then(text => {
          const data = text && JSON.parse(text);
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
      }))
      .catch( () => {
        localStorage.removeItem('user');
        location.reload(true);
      });         
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
        return fetch(`${config.apiUrl}/importitem/delete`, requestOptions)
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
            <TableData colIndex="0" value={importItem.srNr} type="text" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="1" value={importItem.invNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="2" value={importItem.poNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="3" value={importItem.artNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="4" value={importItem.desc} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="5" value={importItem.pcs} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="6" value={importItem.mtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="7" value={importItem.totalNetWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="8" value={importItem.totalGrossWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="9" value={importItem.unitPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="10" value={importItem.totalPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="11" value={importItem.hsCode} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="12" value={importItem.country} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="13" value={importItem.remainingPcs} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="14" value={importItem.remainingMtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
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
    const { importDoc, filterGroup, retrieving, sortGroup, windowHeight } = this.state;
    let tempRows = [];
    if (!_.isEmpty(importDoc.summary) || !retrieving) {
      let filtered = summarySorted(importDoc.summary, sortGroup).filter(element => 
        doesMatch(filterGroup.hsCode, element.hsCode, "text", false) &&
        doesMatch(filterGroup.hsDesc, element.hsDesc, "text", false) &&
        doesMatch(filterGroup.country, element.country, "text", false) &&
        doesMatch(filterGroup.pcs, element.pcs, "number", false) &&
        doesMatch(filterGroup.mtr, element.mtr, "number", false) &&
        doesMatch(filterGroup.totalNetWeight, element.totalNetWeight, "number", false) &&
        doesMatch(filterGroup.totalGrossWeight, element.totalGrossWeight, "number", false) &&
        doesMatch(filterGroup.totalPrice, element.totalPrice, "number", false)
      );
      filtered.map(group => {
        tempRows.push(
          <tr key={group._id}>
            <TableData colIndex="15" value={group.hsCode} type="text" align="center"/>
            <TableData colIndex="16" value={group.hsDesc} type="text"/>
            <TableData colIndex="17" value={group.country} type="text"/>
            <TableData colIndex="18" value={group.pcs} type="number" align="right"/>
            <TableData colIndex="19" value={group.mtr} type="number" align="right"/>
            <TableData colIndex="20" value={group.totalNetWeight} type="number" align="right"/>
            <TableData colIndex="21" value={group.totalGrossWeight} type="number" align="right"/>
            <TableData colIndex="22" value={group.totalPrice} type="number" align="right"/>
          </tr>
        );
      });
    } else {
      for (let i = 0; i < getPageSize(windowHeight - 172.5); i++) {
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
          filterGroup,
          sort,
          sortGroup,
          settingsColWidth,
          importDoc,
          editDoc,
          editItem,
          fileName,
          fileKey,
          dufName,
          dufKey,
          responce,
          showSummary,
          showEditDoc,
          showEditItem,
          showFile,
          showDuf,
          retrieving,
          deletingDoc,
          editingDoc,
          editingItem,
          downloadingFile,
          uploadingFile,
          downloadingDuf,
          uploadingDuf,
          deletingLine,
          selectAllRows,
          selectedRows,
          windowHeight
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
                        {`${importDoc.decNr ? "DEC: " + importDoc.decNr : ""}
                          ${importDoc.boeNr ? "/ BOE: " + importDoc.boeNr : ""}
                          ${importDoc.sfiNr ? " / CFI: " + importDoc.sfiNr : ""}
                          ${importDoc.boeDate ? " / dated: " + typeToString(importDoc.boeDate, 'date', getDateFormat()) : ""}
                          ${importDoc.pcs ? " / pcs: " + typeToString(importDoc.pcs, 'number', getDateFormat()) + " pcs" : ""}
                          ${importDoc.totalNetWeight ? " / net weight: " + typeToString(importDoc.totalNetWeight, 'number', getDateFormat()) + " kgs" : ""}
                          ${importDoc.totalGrossWeight ? " / gross weight: " + typeToString(importDoc.totalGrossWeight, 'number', getDateFormat()) + " kgs" : ""}
                          ${importDoc.totalPrice ? " / value: " + typeToString(importDoc.totalPrice, 'number', getDateFormat()) + " aed" : ""}
                          ${importDoc.isClosed ? ' / status: closed' : ' / status: open'}
                        `}
                      </li>
                    </ol>
                  }
                </nav>
                <div id="import" className={alert.message && !showSummary && !showEditDoc && !showFile && !showDuf ? "main-section-alert" : "main-section"}> 
                    <div className="action-row d-flex justify-content-between">
                      <div>
                        <button title="Show Summary" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleSummary}>
                            <span><FontAwesomeIcon icon="table" className="fa mr-2"/>Summary</span>
                        </button>
                        
                        <button title="Download/Upload File" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleFile}>
                            <span><FontAwesomeIcon icon="file-excel" className="fa mr-2"/>Attachment</span>
                        </button>
                        <button title="Download/Upload File" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleDuf}>
                            <span><FontAwesomeIcon icon="upload" className="fa mr-2"/>DUF File</span>
                        </button>
                      </div>
                      <div>
                        <button title="Edit Import Document" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleEditDoc}>
                            <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Doc</span>
                        </button>
                        <button title="Edit Line Item" className="btn btn-leeuwen-blue btn-lg mr-2" disabled={!_.isEqual(selectedRows.length, 1) ? true : false} onClick={this.toggleEditItem}>
                            <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Line</span>
                        </button>
                        <button title="Delete Line Item(s)" className="btn btn-leeuwen btn-lg mr-2" disabled={_.isEmpty(selectedRows) ? true : false} onClick={this.handleDeleteLine}>
                            <span><FontAwesomeIcon icon={deletingLine ? "spinner" : "trash-alt"} className={deletingLine ? "fa fa-pulse fa-fw" : "fa mr-2"}/>Delete Line(s)</span>
                        </button>
                      </div>
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
                                            title="Inv Nr"
                                            name="invNr"
                                            value={filter.invNr}
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
                                            title="PO Nr"
                                            name="poNr"
                                            value={filter.poNr}
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
                                            title="Art Nr"
                                            name="artNr"
                                            value={filter.artNr}
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
                                            title="Descripion"
                                            name="desc"
                                            value={filter.desc}
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
                                            title="Pcs"
                                            name="pcs"
                                            value={filter.pcs}
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
                                            title="Mtr"
                                            name="mtr"
                                            value={filter.mtr}
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
                                            title="Net Weight"
                                            name="totalNetWeight"
                                            value={filter.totalNetWeight}
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
                                            title="Gross Weight"
                                            name="totalGrossWeight"
                                            value={filter.totalGrossWeight}
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
                                            title="Unit Price (AED)"
                                            name="unitPrice"
                                            value={filter.unitPrice}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="9"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Total Price (AED)"
                                            name="totalPrice"
                                            value={filter.totalPrice}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="10"
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
                                            index="11"
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
                                            index="12"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Rem Pcs"
                                            name="remainingPcs"
                                            value={filter.remainingPcs}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="13"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Rem Mtr"
                                            name="remainingMtr"
                                            value={filter.remainingMtr}
                                            onChange={this.handleChangeHeader}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="14"
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
                        <div className="row ml-1 mr-1" style={{height: '31.5px', marginTop: '10px'}}>
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
                      <div className="row ml-1 mr-1" style={{height: `${Math.floor((windowHeight - 172.5))}px`}}>
                        <div id="table-summary" className="table-responsive custom-table-container">
                          <table className="table table-hover table-bordered table-sm">
                            <thead>
                              <tr>
                              <HeaderInput
                                  type="text"
                                  title="HS Code"
                                  name="hsCode"
                                  value={filterGroup.hsCode}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="15"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="text"
                                  title="Description"
                                  name="hsDesc"
                                  value={filterGroup.hsDesc}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="16"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="text"
                                  title="Country"
                                  name="country"
                                  value={filterGroup.country}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="17"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="number"
                                  title="Pcs"
                                  name="pcs"
                                  value={filterGroup.pcs}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="18"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="number"
                                  title="Mtr"
                                  name="mtr"
                                  value={filterGroup.mtr}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="19"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="number"
                                  title="Net Weight"
                                  name="totalNetWeight"
                                  value={filterGroup.totalNetWeight}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="20"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="number"
                                  title="Gross Weight"
                                  name="totalGrossWeight"
                                  value={filterGroup.totalGrossWeight}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="21"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="number"
                                  title={`Total Price (AED)`}
                                  name="totalPrice"
                                  value={filterGroup.totalPrice}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="22"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                              </tr>
                            </thead>
                            <tbody>
                              {this.generateSubBody()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-leeuwen-blue btn-lg" onClick={this.toggleSummary}>
                            <span><FontAwesomeIcon icon="times" className="fa mr-2"/>Close</span>
                          </button>
                      </div>
                    </Modal>
                    <Modal
                      show={showEditDoc}
                      hideModal={this.toggleEditDoc}
                      title={'Update Import Document'}
                    >
                        <form
                          name="form"
                          className="col-12"
                          style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                          onSubmit={this.handleEditDoc}
                        >
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
                            title="SFI Nr"
                            name="sfiNr"
                            type="text"
                            value={editDoc.sfiNr}
                            onChange={this.handleChangeDoc}
                            placeholder="ddddd"
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
                                    <button type="submit" className="btn btn-outline-leeuwen-blue btn-lg" disabled={!this.fileInput.current ? true : false}>
                                        <span><FontAwesomeIcon icon={uploadingFile ? "spinner" : "upload"} className={uploadingFile ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Upload</span>
                                    </button>
                                    <button className="btn btn-outline-leeuwen-blue btn-lg" disabled={!importDoc.fileName ? true : false} onClick={event => this.handleDownloadFile(event)}>
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
                                        <button type="submit" className="btn btn-outline-leeuwen-blue btn-lg" disabled={!this.dufInput.current ? true : false}>
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
                    <Modal
                      show={showEditItem}
                      hideModal={this.toggleEditItem}
                      title="Edit Line Item"
                      size="modal-lg"
                    >
                        <form
                          name="form"
                          className="col-12"
                          style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                          onSubmit={this.handleEditItem}
                        >
                          <Input
                            title="Serial Number"
                            name="srNr"
                            type="number"
                            value={editItem.srNr}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Invoice Number"
                            name="invNr"
                            type="text"
                            value={editItem.invNr}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="PO Number"
                            name="poNr"
                            type="text"
                            value={editItem.poNr}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Article Number"
                            name="artNr"
                            type="text"
                            value={editItem.artNr}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Article Description"
                            name="desc"
                            type="text"
                            value={editItem.desc}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Pcs"
                            name="pcs"
                            type="number"
                            value={editItem.pcs}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Mtr"
                            name="mtr"
                            type="number"
                            value={editItem.mtr}
                            onChange={this.handleChangeItem}
                            inline={false}
                          />
                          <Input
                            title="Net Weight (total)"
                            name="totalNetWeight"
                            type="number"
                            value={editItem.totalNetWeight}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Gross Weight (total)"
                            name="totalGrossWeight"
                            type="number"
                            value={editItem.totalGrossWeight}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Total Price (AED)"
                            name="totalPrice"
                            type="number"
                            value={editItem.totalPrice}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="HS Code"
                            name="hsCode"
                            type="text"
                            value={editItem.hsCode}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="HS Description"
                            name="hsDesc"
                            type="text"
                            value={editItem.hsDesc}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Country"
                            name="country"
                            type="text"
                            value={editItem.country}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <div className="modal-footer">
                              <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                                <span><FontAwesomeIcon icon={editingItem ? "spinner" : "edit"} className={editingItem ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
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

const connectedImportItem = connect(mapStateToProps)(ImportItem);
export { connectedImportItem as ImportItem };
