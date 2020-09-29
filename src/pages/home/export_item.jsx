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
  typeToString,
  stringToType,
  isValidFormat,
  summarySorted,
  importSorted,
  getDateFormat,
  doesMatch,
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
      editItem: {
        _id: '',
        srNr: '',
        artNr: '',
        desc: '',
        poNr: '',
        pcs: '',
        mtr: '',
        totalPrice: '',
      },
      editQty: {
        _id: '',
        pcs: '',
        mtr: '',
      },
      fileName: '',
      fileKey: Date.now(),
      dufName: '',
      dufKey: Date.now(),
      responce: {},
      candidates: [],
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
        documentId: '',
        remainingPcs: '',
        remainingMtr: '',
      },
      filterGroup: {
        hsCode: '',
        desc: '',
        country: '',
        pcs: '',
        mtr: '',
        totalNetWeight: '',
        totalGrossWeight: '',
        totalPrice: '',
      },
      filterLink: {
        artNr: '',
        poNr: '',
        decNr: '',
        boeNr: '',
        srNr: '',
        country: '',
        hsCode: '',
        pcs: '',
        mtr: '',
        unitNetWeight: '',
        unitGrossWeight: '',
        unitPrice: '',
      },
      filterImport: {
        decNr: '',
        boeNr: '',
        srNr: '',
        country: '',
        hsCode: '',
        pcs: '',
        mtr: '',
        unitNetWeight: '',
        unitGrossWeight: '',
        unitPrice: '',
      },
      filteredImport: [],
      sort: {
          name: '',
          isAscending: true,
      },
      sortGroup: {
        name: '',
        isAscending: true,
      },
      sortLink: {
        name: '',
        isAscending: true,
      },
      sortImport: {
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
      showLink: false,
      showQty: false,
      retrievingDoc: false,
      deletingDoc: false,
      editingDoc: false,
      editingItem: false,
      editingQty: false,
      uploadingFile: false,
      downloadingFile: false,
      downloadingInvoice: false,
      downloadingDuf: false,
      uploadingDuf: false,
      unlinkingItems: false,
      linkingItem: false,
      deletingLine: false,
      retrievingCandidates: false,
      menuItem: 'Export Documents',
      settingsColWidth: {},
      selectAllRows: false,
      selectAllImports: false,
      selectedRows: [],
      selectedImports: [],
      selectedCandidate: '',
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
    this.toggleSortLink = this.toggleSortLink.bind(this);
    this.toggleSortImport = this.toggleSortImport.bind(this);
    this.handleChangeHeaderLine = this.handleChangeHeaderLine.bind(this);
    this.handleChangeHeaderGroup = this.handleChangeHeaderGroup.bind(this);
    this.handleChangeHeaderLink = this.handleChangeHeaderLink.bind(this);
    this.handleChangeHeaderImport = this.handleChangeHeaderImport.bind(this);
    this.handleChangeDoc = this.handleChangeDoc.bind(this);
    this.handleChangeItem = this.handleChangeItem.bind(this);
    this.handleChangeQty = this.handleChangeQty.bind(this);
    this.handleChangeDuf = this.handleChangeDuf.bind(this);
    this.handleChangeFile = this.handleChangeFile.bind(this);
    this.toggleSummary = this.toggleSummary.bind(this);
    this.toggleEditDoc = this.toggleEditDoc.bind(this);
    this.toggleEditItem = this.toggleEditItem.bind(this);
    this.toggleEditQty = this.toggleEditQty.bind(this);
    this.toggleDuf = this.toggleDuf.bind(this);
    this.toggleLink = this.toggleLink.bind(this);
    this.toggleFile = this.toggleFile.bind(this);
    this.getDocument = this.getDocument.bind(this);
    this.getCandidates = this.getCandidates.bind(this);
    this.handleDeleteDoc = this.handleDeleteDoc.bind(this);
    this.handleEditDoc = this.handleEditDoc.bind(this);
    this.handleEditItem = this.handleEditItem.bind(this);
    this.handleEditQty = this.handleEditQty.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
    this.handleDownloadFile = this.handleDownloadFile.bind(this);
    this.handleDownloadInvoice = this.handleDownloadInvoice.bind(this);
    this.handleUploadDuf = this.handleUploadDuf.bind(this);
    this.handleDownloadDuf = this.handleDownloadDuf.bind(this);
    this.handleUnink = this.handleUnink.bind(this);
    this.handleLink = this.handleLink.bind(this);
    this.handleDeleteLine = this.handleDeleteLine.bind(this);
    this.colDoubleClick = this.colDoubleClick.bind(this);
    this.setColWidth = this.setColWidth.bind(this);
    this.changePage = this.changePage.bind(this);
    this.toggleSelectAllRow = this.toggleSelectAllRow.bind(this);
    this.toggleSelectAllImport = this.toggleSelectAllImport.bind(this);
    this.updateSelectedRows = this.updateSelectedRows.bind(this);
    this.updateSelectedImports = this.updateSelectedImports.bind(this);
    this.selectCandidate = this.selectCandidate.bind(this);
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

    window.addEventListener('resize', this.recize, {once: true});
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recize);
  }

  recize() {
    const { paginate } = this.state;
    const tableContainer = document.getElementById('table-container');
    this.setState({
      windowHeight: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
      paginate: {
        ...paginate,
        pageSize: getPageSize(tableContainer.clientHeight)
      }
    }, () => this.getDocument(paginate.currentPage));
  }

  componentDidUpdate(prevProps, prevState) {
    const { exportDoc, candidates, sort, sortLink, sortImport, filter, filterLink, filterImport, filteredImport, paginate, selectedRows, selectedCandidate, selectedImports } = this.state;
    
    if (sort != prevState.sort || (filter != prevState.filter && prevState.filter.documentId != '')  || (paginate.pageSize != prevState.paginate.pageSize && prevState.paginate.pageSize != 0)) {
      this.getDocument(paginate.currentPage);
    }

    if (sortLink != prevState.sortLink || (filterLink != prevState.filterLink)) {
      this.getCandidates();
    }

    if (exportDoc.items != prevState.exportDoc.items) {
      let remaining = selectedRows.reduce(function(acc, cur) {
        let found = exportDoc.items.find(element => _.isEqual(element._id, cur));
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

    if (filterImport != prevState.filterImport || exportDoc.items != prevState.exportDoc.items || selectedRows != prevState.selectedRows) {
      if (selectedRows.length == 1) {
        let found = exportDoc.items.find(element => _.isEqual(element._id, selectedRows[0]));
        if (!_.isUndefined(found)) {
          this.setState({
            filteredImport: importSorted(found.importItems, sortImport).filter(element => 
              doesMatch(filterImport.decNr, element.decNr, "text", false) &&
              doesMatch(filterImport.boeNr, element.boeNr, "text", false) &&
              doesMatch(filterImport.srNr, element.srNr, "number", false) &&
              doesMatch(filterImport.country, element.country, "text", false) &&
              doesMatch(filterImport.hsCode, element.hsCode, "text", false) &&
              doesMatch(filterImport.pcs, element.pcs, "number", false) &&
              doesMatch(filterImport.mtr, element.mtr, "number", false) &&
              doesMatch(filterImport.unitNetWeight, element.unitNetWeight, "number", false) &&
              doesMatch(filterImport.unitGrossWeight, element.unitGrossWeight, "number", false) &&
              doesMatch(filterImport.unitPrice, element.unitPrice, "number", false)
            )
          });
        } else {
          this.setState({ filteredImport: [] });
        }
      } else {
        this.setState({ filteredImport: [] })
      }
    }

    if (filteredImport != prevState.filteredImport) {
      let remaining = selectedImports.reduce(function(acc, cur) {
        let found = filteredImport.find(element => _.isEqual(element._id, cur));
        if (!_.isUndefined(found)){
          acc.push(cur);
        }
        return acc;
      }, []);
      this.setState({
        selectedImports: remaining,
        selectAllImports: false,
      });
    }

    if (candidates != prevState.candidates) {
      let found = candidates.find(element => _.isEqual(element._id, selectedCandidate));
      this.setState({
        selectedCandidate: !_.isUndefined(found) ? selectedCandidate : '',
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

  toggleSortLink(event, name) {
    event.preventDefault();
    const { sortLink } = this.state;
    if (sortLink.name != name) {
      this.setState({
        sortLink: {
          name: name,
          isAscending: true
        }
      });
    } else if (!!sortLink.isAscending) {
      this.setState({
        sortLink: {
          name: name,
          isAscending: false
        }
      });
    } else {
      this.setState({
        sortLink: {
          name: '',
          isAscending: true
        }
      });
    }
  }

  toggleSortImport(event, name) {
    event.preventDefault();
    const { sortImport } = this.state;
    if (sortImport.name != name) {
      this.setState({
        sortImport: {
          name: name,
          isAscending: true
        }
      });
    } else if (!!sortImport.isAscending) {
      this.setState({
        sortImport: {
          name: name,
          isAscending: false
        }
      });
    } else {
      this.setState({
        sortImport: {
          name: '',
          isAscending: true
        }
      });
    }
  }

  handleChangeHeaderLine(event) {
    const { filter } = this.state;
    const { name, value } = event.target;
    this.setState({
      filter: {
        ...filter,
        [name]: value
      }
    });
  }

  handleChangeHeaderLink(event) {
    const { filterLink } = this.state;
    const { name, value } = event.target;
    this.setState({
      filterLink: {
        ...filterLink,
        [name]: value
      }
    })
  }

  handleChangeHeaderImport(event) {
    const { filterImport } = this.state;
    const { name, value } = event.target;
    this.setState({
      filterImport: {
        ...filterImport,
        [name]: value
      }
    })
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

  handleChangeQty(event) {
    const { editQty } = this.state;
    const { name, value } = event.target;
    this.setState({
      editQty: {
        ...editQty,
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
        boeDate: typeToString(exportDoc.boeDate, 'date', getDateFormat()),
      }
    });
  }

  toggleEditItem() {
    const { showEditItem, exportDoc, selectedRows } = this.state;
    if (!!showEditItem) {
      this.setState({
        showEditItem: false,
        editItem: {
          _id: '',
          srNr: '',
          artNr: '',
          desc: '',
          poNr: '',
          pcs: '',
          mtr: '',
          totalPrice: '',
        }
      });
    } else if (_.isEqual(selectedRows.length, 1)) {
      let found = exportDoc.items.find(element => _.isEqual(element._id, selectedRows[0]));
      if (!_.isUndefined(found)) {
        this.setState({
          showEditItem: true,
          editItem: {
            _id: found._id,
            srNr: found.srNr,
            artNr: found.artNr,
            desc: found.desc,
            poNr: found.poNr,
            pcs: found.pcs,
            mtr: found.mtr,
            totalPrice: found.totalPrice,
          }
        });
      }
    }
  }

  toggleEditQty(event) {
    event.preventDefault();
    const { showQty, selectedImports, filteredImport } = this.state;
    if (!!showQty) {
      this.setState({
        showQty: !showQty,
        editQty: {
          _id: '',
          pcs: '',
          mtr: '',
        }
      });
    } else if (selectedImports.length != 1) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'select one linked item to edit the quantity.'
        }
      });
    } else {
      let found = filteredImport.find(element => _.isEqual(element._id, selectedImports[0]));
      if (!_.isUndefined(found)){
        this.setState({
          showQty: true,
          editQty: {
            _id: found._id,
            pcs: found.pcs,
            mtr: found.mtr,
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

  toggleLink(event) {
    event.preventDefault();
    const { showLink, selectedRows, exportDoc, windowHeight } = this.state;
    console.log('windowHeight:', windowHeight);
    if (!!showLink) {
      this.setState({
        showLink: false,
        filterLink: {
          artNr: '',
          poNr: '',
          decNr: '',
          boeNr: '',
          srNr: '',
          country: '',
          hsCode: '',
          pcs: '',
          mtr: '',
          unitNetWeight: '',
          unitGrossWeight: '',
          unitPrice: '',
        },
      });
    } else if (selectedRows.length != 1) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'Select one line.'
        }
      });
    } else {
      let found = exportDoc.items.find(element => _.isEqual(element._id, selectedRows[0]));
      if (_.isUndefined(found)) {
        this.setState({
          alert: {
            type: 'alert-danger',
            message: 'An error has occured, could not retrieve selected item.'
          }
        });
      } else if (!found.artNr || !found.poNr) {
        this.setState({
          alert: {
            type: 'alert-danger',
            message: 'Selected item does not have po number or article number.'
          }
        });
      } else {
        this.setState({
          showLink: true,
          filterLink: {
            artNr: found.artNr,
            poNr: found.poNr,
            decNr: '',
            boeNr: '',
            srNr: '',
            country: '',
            hsCode: '',
            pcs: '',
            mtr: '',
            unitNetWeight: '',
            unitGrossWeight: '',
            unitPrice: '',
          },
        });
      }
    }
  }

  getDocument(nextPage) {
    const { filter, sort, paginate } = this.state;
    if (!!paginate.pageSize) {
      this.setState({
        retrievingDoc: true
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
            retrievingDoc: false,
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

  getCandidates() {
    const { exportDoc, filterLink, sortLink } = this.state;
    
    if (!filterLink.artNr || !filterLink.poNr) {
      this.setState({ candidates: [] });
    } else {
      this.setState({
        retrievingCandidates: true
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: {...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({
            filter: filterLink,
            sort: sortLink,
            exRate: !!exportDoc.exRate ? exportDoc.exRate : 1,
          })
        };
        return fetch(`${config.apiUrl}/exportitem/findCandidates`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            retrievingCandidates: false,
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
                candidates: data.candidates,
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
    const { editDoc, editingDoc, paginate } = this.state;
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
            boeDate: stringToType(editDoc.boeDate, 'date', getDateFormat()),
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
                this.getDocument(paginate.currentPage);
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
            artNr: editItem.artNr,
            desc: editItem.desc,
            poNr: editItem.poNr,
            pcs: editItem.pcs,
            mtr: editItem.mtr,
            totalPrice: editItem.totalPrice,
          })
        };
        return fetch(`${config.apiUrl}/exportitem/update`, requestOptions)
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

  handleEditQty(event) {
    event.preventDefault();
    const { editQty, editingQty, paginate } = this.state;
    if (!editingQty) {
      this.setState({
        editingQty: true
      }, () => {
        const requestOptions = {
          method: 'PUT',
          headers: {...authHeader(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            _id: editQty._id,
            pcs: editQty.pcs,
            mtr: editQty.mtr,
          })
        };
        return fetch(`${config.apiUrl}/transaction/update`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            editingQty: false,
            showQty: false,
            editQty: {
              _id: '',
              pcs: '',
              mtr: ''
            }
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
                this.getDocument(paginate.currentPage);
                this.getCandidates();
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
        })
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      });
    }
  }

  handleDownloadInvoice(event) {
    event.preventDefault();
    const { exportDoc, downloadingInvoice } = this.state;
    if (exportDoc._id && !downloadingInvoice) {
      this.setState({
          downloadingInvoice: true
      }, () => {
        const requestOptions = {
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json'},
        };
        return fetch(`${config.apiUrl}/exportdoc/downloadInvoice?documentId=${exportDoc._id}`, requestOptions)
        .then(responce => {
          if (responce.status === 401) {
              localStorage.removeItem('user');
              location.reload(true);
          } else if (responce.status === 400) {
              this.setState({
                  downloadingInvoice: false,
                  alert: {
                    type: 'alert-danger',
                    message: 'an error has occured'  
                  }
              });
          } else {
              this.setState({
                  downloadingInvoice: false
              }, () => responce.blob().then(blob => saveAs(blob, 'invoice.xlsx')));
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
    const { exportDoc, fileName, uploadingFile, paginate } = this.state;
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
              }, () => this.getDocument(paginate.currentPage));
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
    const { exportDoc, uploadingDuf, paginate } = this.state
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
            }, () => this.getDocument(paginate.currentPage));
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
    const { selectedRows, deletingLine, paginate } = this.state;
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
              }, () => this.getDocument(paginate.currentPage));
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

  handleUnink(event) {
    event.preventDefault();
    const { paginate, selectedImports } = this.state;
    if (_.isEmpty(selectedImports)) {
      this.setState({
        alert: 'alert-danger',
        message: 'Select linked items to be removed.'
      });
    } else {
      this.setState({
        unlinkingItems: true,
      }, () => {
        const requestOptions = {
          method: 'DELETE',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({
            selectedIds: selectedImports
          })
        };
        return fetch(`${config.apiUrl}/transaction/delete`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            unlinkingItems: false,
          }
          , () => {
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
                this.getDocument(paginate.currentPage);
                this.getCandidates();
              });
            }
          }
          );
        }))
        .catch( () => {
          localStorage.removeItem('user');
          location.reload(true);
        });
      })
    }
  }

  handleLink(event) {
    event.preventDefault();
    const { paginate, selectedCandidate, selectedRows } = this.state;
    if (selectedRows.length != 1) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'No export item selected, close the modal and try again.'
        }
      });
    } else if (!selectedCandidate) {
      this.setState({
        alert: {
          type: 'alert-danger',
          message: 'Select one import item to be linked to the selected export item.'
        }
      });
    } else {
      this.setState({
        linkingItem: true
      }, () => {
        const requestOptions = {
          method: 'POST',
          headers: { ...authHeader(), 'Content-Type': 'application/json'},
          body: JSON.stringify({
            importId: selectedCandidate,
            exportId: selectedRows[0]
          })
      };
        return fetch(`${config.apiUrl}/transaction/upsert`, requestOptions)
        .then(response => response.text().then(text => {
          this.setState({
            linkingItem: false,
          }
          , () => {
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
                this.getDocument(paginate.currentPage);
                this.getCandidates();
              });
            }
          }
          );
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

  toggleSelectAllImport() {
    const { exportDoc, selectedRows, selectAllImports } = this.state;
    if (!_.isEmpty(exportDoc.items) && selectedRows.length == 1) {
      let selectedItem = exportDoc.items.find(element => _.isEqual(element._id, selectedRows[0]));
      if (!_.isUndefined(selectedItem) && !_.isEmpty(selectedItem.importItems) && !selectAllImports) {
        this.setState({
          selectedImports: selectedItem.importItems.map(importItem => importItem._id),
          selectAllImports: true
        });
      } else {
        this.setState({
          selectedImports: [],
          selectAllImports: false,
        });
      }
    } else {
      this.setState({
        selectedImports: [],
        selectAllImports: false,
      });
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

  updateSelectedImports(id) {
    const { selectedImports } = this.state;
    if (selectedImports.includes(id)) {
        this.setState({ selectedImports: arrayRemove(selectedImports, id) });
    } else {
      this.setState({ selectedImports: [...selectedImports, id] });
    }       
  }

  selectCandidate(event, id) {
    event.preventDefault();
    const { selectedCandidate } = this.state;
    this.setState({
      selectedCandidate: selectedCandidate != id ? id : '' 
    });
  }

  generateBody() {
    const { exportDoc, retrievingDoc, paginate, selectAllRows, selectedRows, settingsColWidth } = this.state;
    let tempRows = [];
    if (!_.isEmpty(exportDoc.items) || !retrievingDoc) {
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
            <TableData colIndex="10" value={exportItem.remainingPcs} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="11" value={exportItem.remainingMtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
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
          </tr> 
        );
      }
    }
    return tempRows;
  }

  generateSubBody() {
    const { exportDoc, filterGroup, sortGroup, retrievingDoc, windowHeight, settingsColWidth } = this.state;
    let tempRows = [];
    if (!_.isEmpty(exportDoc.summary) || !retrievingDoc) {
      let filtered = summarySorted(exportDoc.summary, sortGroup).filter(element => 
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
            <TableData colIndex="12" value={group.hsCode} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="13" value={group.hsDesc} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="14" value={group.country} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="15" value={group.pcs} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="16" value={group.mtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="17" value={group.totalNetWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="18" value={group.totalGrossWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="19" value={group.totalPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
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

  generateCandidateBody() {
    const { candidates, selectedCandidate, retrievingCandidates, settingsColWidth, windowHeight } = this.state;
    let tempRows = [];
    if (!_.isEmpty(candidates) || !retrievingCandidates) {
      candidates.map(candidate => {
        tempRows.push(
          <tr key={candidate._id} style={_.isEqual(selectedCandidate,candidate._id) ? {backgroundColor: "lightgray", cursor: 'pointer'} : {cursor: 'pointer'}} onClick={event => this.selectCandidate(event, candidate._id)}>
            <TableData colIndex="20" value={candidate.decNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="21" value={candidate.boeNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="22" value={candidate.srNr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="23" value={candidate.country} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="24" value={candidate.hsCode} type="text" align="center"settingsColWidth={settingsColWidth}/>
            <TableData colIndex="25" value={candidate.pcs} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="26" value={candidate.mtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="27" value={candidate.unitNetWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="28" value={candidate.unitGrossWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="29" value={candidate.unitPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
          </tr>
        );
      });
    } else {
      for (let i = 0; i < getPageSize((windowHeight - 254) / 2); i++) {
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

  generateImportBody() {
    const { exportDoc, filteredImport, retrievingDoc, selectAllImports, selectedImports, settingsColWidth, windowHeight } = this.state;
    let tempRows = [];
    
    if (!_.isEmpty(exportDoc.items) && !retrievingDoc) {
      filteredImport.map(importItem => {
        tempRows.push(
          <tr key={importItem._id}>
            <SelectRow
              id={importItem._id}
              selectAllRows={selectAllImports}
              selectedRows={selectedImports}
              callback={this.updateSelectedImports}
            />
            <TableData colIndex="30" value={importItem.decNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="31" value={importItem.boeNr} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="32" value={importItem.srNr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="33" value={importItem.country} type="text" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="34" value={importItem.hsCode} type="text" align="center" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="35" value={importItem.pcs} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="36" value={importItem.mtr} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="37" value={importItem.unitNetWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="38" value={importItem.unitGrossWeight} type="number" align="right" settingsColWidth={settingsColWidth}/>
            <TableData colIndex="39" value={importItem.unitPrice} type="number" align="right" settingsColWidth={settingsColWidth}/>
          </tr>
        );
      });
    } else {
      for (let i = 0; i < getPageSize((windowHeight - 254) / 2); i++) {
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

    render() {
        const {
          menuItem,
          filter,
          filterLink,
          filterImport,
          filterGroup,
          sort,
          sortGroup,
          sortLink,
          sortImport,
          settingsColWidth,
          exportDoc,
          editDoc,
          editItem,
          editQty,
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
          showLink,
          showQty,
          retrievingDoc,
          deletingDoc,
          editingDoc,
          editingItem,
          editingQty,
          downloadingFile,
          downloadingInvoice,
          uploadingFile,
          downloadingDuf,
          uploadingDuf,
          selectedRows,
          selectedCandidate,
          selectedImports,
          unlinkingItems,
          linkingItem,
          deletingLine,
          selectAllRows,
          selectAllImports,
          windowHeight,
        } = this.state;
        const { currentPage, firstItem, lastItem, pageItems, pageLast, totalItems, first, second, third} = this.state.paginate;
        const { sidemenu } = this.props;
        const alert = this.state.alert.message ? this.state.alert : this.props.alert;

        return (
            <Layout sidemenu={sidemenu} toggleCollapse={this.toggleCollapse} menuItem={menuItem}>
                {alert.message && !showSummary && !showEditDoc && !showFile && !showDuf && !showLink &&
                    <div className={`alert ${alert.type}`}>{alert.message}
                        <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                            <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                        </button>
                    </div>
                }
                <nav aria-label="breadcrumb">
                  {!exportDoc.boeNr && !!retrievingDoc ?
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
                          ${exportDoc.decNr ? " / DEC: " + exportDoc.decNr : ""}
                          ${exportDoc.boeNr ? " / BOE: " + exportDoc.boeNr : ""}
                          ${exportDoc.boeDate ? " / dated: " + typeToString(exportDoc.boeDate, 'date', getDateFormat()) : ""}
                          ${exportDoc.pcs ? " / pcs: " + typeToString(exportDoc.pcs, 'number', getDateFormat()) + " pcs" : ""}
                          ${exportDoc.totalNetWeight ? " / net weight: " + typeToString(exportDoc.totalNetWeight, 'number', getDateFormat()) + " kgs" : ""}
                          ${exportDoc.totalGrossWeight ? " / gross weight: " + typeToString(exportDoc.totalGrossWeight, 'number', getDateFormat()) + " kgs" : ""}
                          ${exportDoc.totalPrice ? " / value: " + typeToString(exportDoc.totalPrice, 'number', getDateFormat()) + " " + exportDoc.currency : ""}
                          ${exportDoc.isClosed ? ' / status: closed' : ' / status: open'}
                        `}
                      </li>
                    </ol>
                  }
                </nav>
                <div id="export" className={alert.message && !showSummary && !showEditDoc && !showFile && !showDuf && !showLink ? "main-section-alert" : "main-section"}> 
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
                        <button title="Link Item" className="btn btn-leeuwen-blue btn-lg mr-2" disabled={selectedRows.length != 1 ? true : false} onClick={this.toggleLink}>
                            <span><FontAwesomeIcon icon="link" className="fa mr-2"/>Link Item</span>
                        </button>
                        <button title="Generate Invoice" className="btn btn-leeuwen-blue btn-lg" disabled={exportDoc.isClosed != true ? true : false} onClick={this.handleDownloadInvoice}>
                            <span><FontAwesomeIcon icon={downloadingInvoice ? "spinner" : "dollar-sign"} className={downloadingInvoice ? "fa fa-pulse fa-fw" : "fa mr-2"}/>Gen Invoice</span>
                        </button>
                      </div>
                      <div className="float-right mr-1">
                        <button title="Edit Export Document" className="btn btn-leeuwen-blue btn-lg mr-2" onClick={this.toggleEditDoc}>
                            <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Doc</span>
                        </button>
                        <button title="Edit Line Item" className="btn btn-leeuwen-blue btn-lg mr-2" disabled={!_.isEqual(selectedRows.length, 1) ? true : false} onClick={this.toggleEditItem}>
                            <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Line</span>
                        </button>
                        <button title="Delete Line Item(s)" className="btn btn-leeuwen btn-lg" disabled={_.isEmpty(selectedRows) ? true : false} onClick={this.handleDeleteLine}>
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
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
                                            onChange={this.handleChangeHeaderLine}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="9"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Rem Pcs"
                                            name="remainingPcs"
                                            value={filter.remainingPcs}
                                            onChange={this.handleChangeHeaderLine}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="10"
                                            colDoubleClick={this.colDoubleClick}
                                            setColWidth={this.setColWidth}
                                            settingsColWidth={settingsColWidth}
                                        />
                                        <HeaderInput
                                            type="number"
                                            title="Rem Mtr"
                                            name="remainingMtr"
                                            value={filter.remainingMtr}
                                            onChange={this.handleChangeHeaderLine}
                                            sort={sort}
                                            toggleSort={this.toggleSort}
                                            index="11"
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
                                  index="12"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="text"
                                  title="Description"
                                  name="desc"
                                  value={filterGroup.desc}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="13"
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
                                  index="14"
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
                                  index="15"
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
                                  index="16"
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
                                  index="17"
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
                                  index="18"
                                  colDoubleClick={this.colDoubleClick}
                                  setColWidth={this.setColWidth}
                                  settingsColWidth={settingsColWidth}
                                />
                                <HeaderInput
                                  type="number"
                                  title={`Total Price (${exportDoc.currency})`}
                                  name="totalPrice"
                                  value={filterGroup.totalPrice}
                                  onChange={this.handleChangeHeaderGroup}
                                  sort={sortGroup}
                                  toggleSort={this.toggleSortGroup}
                                  index="19"
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
                                    <button type="submit" className="btn btn-outline-leeuwen-blue btn-lg" disabled={!this.fileInput.current ? true : false}>
                                        <span><FontAwesomeIcon icon={uploadingFile ? "spinner" : "upload"} className={uploadingFile ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Upload</span>
                                    </button>
                                    <button className="btn btn-outline-leeuwen-blue btn-lg" disabled={!exportDoc.fileName ? true : false} onClick={event => this.handleDownloadFile(event)}>
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
                      show={showLink}
                      hideModal={this.toggleLink}
                      title="Link import items"
                      size="modal-xl"
                    >
                      {alert.message &&
                        <div className="row ml-1 mr-1">
                          <div className="col-12" style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}>
                            <div className={`alert ${alert.type}`}> {alert.message}
                              <button className="close" onClick={(event) => this.handleClearAlert(event)}>
                                  <span aria-hidden="true"><FontAwesomeIcon icon="times"/></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      }
                      <div>
                        <label htmlFor="table-summary" className="ml-1 mr-1">Available Quantities</label>
                        <div className="row ml-1 mr-1" style={{height: `${Math.floor((windowHeight - 297) / 2)}px`}}>
                          <div id="table-summary" className="table-responsive custom-table-container">
                            <table className="table table-bordered table-sm">
                              <thead>
                                <tr>
                                  <HeaderInput
                                    type="text"
                                    title="DEC Nr"
                                    name="decNr"
                                    value={filterLink.decNr}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="20"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="BOE Nr"
                                    name="boeNr"
                                    value={filterLink.boeNr}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="21"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="#"
                                    name="srNr"
                                    value={filterLink.srNr}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="22"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="Country"
                                    name="country"
                                    value={filterLink.country}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="23"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="HS Code"
                                    name="hsCode"
                                    value={filterLink.hsCode}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="24"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Pcs"
                                    name="pcs"
                                    value={filterLink.pcs}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="25"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Mtr"
                                    name="mtr"
                                    value={filterLink.mtr}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="26"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Net Weight (unit)"
                                    name="unitNetWeight"
                                    value={filterLink.unitNetWeight}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="27"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Gross Weight (unit)"
                                    name="unitGrossWeight"
                                    value={filterLink.unitGrossWeight}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="28"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title={`Unit Price (${exportDoc.currency})`}
                                    name="unitPrice"
                                    value={filterLink.unitPrice}
                                    onChange={this.handleChangeHeaderLink}
                                    sort={sortLink}
                                    toggleSort={this.toggleSortLink}
                                    index="29"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                </tr>
                              </thead>
                              <tbody>
                                {this.generateCandidateBody()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="text-right mt-2 mr-1 mb-2 ml-1">
                          <button type="button" className="btn btn-leeuwen-blue btn-lg mr-2" disabled={!selectedCandidate ? true : false} onClick={event => this.handleLink(event)}>
                            <span><FontAwesomeIcon icon={linkingItem ? "spinner" : "link"} className={linkingItem ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Link Item</span>
                          </button>
                          <button type="button" className="btn btn-leeuwen-blue btn-lg mr-2" disabled={selectedImports.length != 1 ? true : false} onClick={event => this.toggleEditQty(event)}>
                            <span><FontAwesomeIcon icon="edit" className="fa mr-2"/>Edit Qty</span>
                          </button>
                          <button type="button" className="btn btn-leeuwen btn-lg" disabled={_.isEmpty(selectedImports) ? true : false} onClick={event => this.handleUnink(event)}>
                            <span><FontAwesomeIcon icon={unlinkingItems ? "spinner" : "unlink"} className={unlinkingItems ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Un-Link</span>
                          </button>
                      </div>
                      <div>
                        <label htmlFor="table-link" className="ml-1 mr-1">Linked Quantities</label>
                        <div className="row ml-1 mr-1" style={{height: `${Math.floor((windowHeight - 297) / 2)}px`}}>
                          <div id="table-link" className="table-responsive custom-table-container">
                            <table className="table table-bordered table-sm">
                              <thead>
                                <tr>
                                  <SelectAll
                                    checked={selectAllImports}
                                    onChange={this.toggleSelectAllImport}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="DEC Nr"
                                    name="decNr"
                                    value={filterImport.decNr}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortLink}
                                    index="30"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="BOE Nr"
                                    name="boeNr"
                                    value={filterImport.boeNr}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortLink}
                                    index="31"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="#"
                                    name="srNr"
                                    value={filterImport.srNr}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="32"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="Country"
                                    name="country"
                                    value={filterImport.country}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="33"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="text"
                                    title="HS Code"
                                    name="hsCode"
                                    value={filterImport.hsCode}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="34"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Pcs"
                                    name="pcs"
                                    value={filterImport.pcs}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="35"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Mtr"
                                    name="mtr"
                                    value={filterImport.mtr}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="36"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Net Weight (unit)"
                                    name="unitNetWeight"
                                    value={filterImport.unitNetWeight}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="37"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title="Gross Weight (unit)"
                                    name="unitGrossWeight"
                                    value={filterImport.unitGrossWeight}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="38"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                  <HeaderInput
                                    type="number"
                                    title={`Unit Price (${exportDoc.currency})`}
                                    name="unitPrice"
                                    value={filterImport.unitPrice}
                                    onChange={this.handleChangeHeaderImport}
                                    sort={sortImport}
                                    toggleSort={this.toggleSortImport}
                                    index="39"
                                    colDoubleClick={this.colDoubleClick}
                                    setColWidth={this.setColWidth}
                                    settingsColWidth={settingsColWidth}
                                  />
                                </tr>
                              </thead>
                              <tbody>
                                {this.generateImportBody()}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer">
                          <button type="button" className="btn btn-leeuwen-blue btn-lg" onClick={this.toggleLink}>
                            <span><FontAwesomeIcon icon="times" className="fa mr-2"/>Close</span>
                          </button>
                      </div>
                    </Modal>
                    <Modal
                      show={showQty}
                      hideModal={this.toggleEditQty}
                      title="Edit Qty"
                      centered={true}
                    >
                      <form
                        name="form"
                        className="col-12"
                        style={{marginLeft:'0px', marginRight: '0px', paddingLeft: '0px', paddingRight: '0px'}}
                        onSubmit={this.handleEditQty}
                      >
                        <Input
                            title="Pcs"
                            name="pcs"
                            type="number"
                            value={editQty.pcs}
                            onChange={this.handleChangeQty}
                            inline={false}
                            required={true}
                        />
                        <Input
                          title="Mtr"
                          name="mtr"
                          type="number"
                          value={editQty.mtr}
                          onChange={this.handleChangeQty}
                          inline={false}
                          required={true}
                        />
                        <div className="modal-footer">
                              <button type="submit" className="btn btn-leeuwen-blue btn-lg">
                                <span><FontAwesomeIcon icon={editingQty ? "spinner" : "edit"} className={editingQty ? "fa-pulse fa-fw fa mr-2" : "fa mr-2"}/>Update</span>
                              </button>
                        </div>
                        
                      </form>
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
                            title="Article Code"
                            name="artNr"
                            type="text"
                            value={editItem.artNr}
                            onChange={this.handleChangeItem}
                            inline={false}
                            required={true}
                          />
                          <Input
                            title="Description"
                            name="desc"
                            type="text"
                            value={editItem.desc}
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
                            required={true}
                          />
                          <Input
                            title={`Total Price (${exportDoc.currency})`}
                            name="totalPrice"
                            type="number"
                            value={editItem.totalPrice}
                            onChange={this.handleChangeItem}
                            inline={false}
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

const connectedExportItem = connect(mapStateToProps)(ExportItem);
export { connectedExportItem as ExportItem };
