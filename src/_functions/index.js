import React from 'react';
import moment from 'moment';
import _ from 'lodash';

export const locale = Intl.DateTimeFormat().resolvedOptions().locale;
export const options = {'year': 'numeric', 'month': '2-digit', day: '2-digit', timeZone: 'GMT'};
export const myLocale = Intl.DateTimeFormat(locale, options);

export function getDateFormat() {
    let tempDateFormat = ''
    Intl.DateTimeFormat(locale, options).formatToParts().map(function (element) {
        switch(element.type) {
            case 'month': 
                tempDateFormat = tempDateFormat + 'MM';
                break;
            case 'literal': 
                tempDateFormat = tempDateFormat + element.value;
                break;
            case 'day': 
                tempDateFormat = tempDateFormat + 'DD';
                break;
            case 'year': 
                tempDateFormat = tempDateFormat + 'YYYY';
                break;
        }
    });
    return tempDateFormat;
}

export function getLiteral() {
    let firstLiteral = Intl.DateTimeFormat(locale, options).formatToParts().find(function (element) {
      return element.type === 'literal';
    });
    if (firstLiteral) {
      return firstLiteral.value;
    } else {
      return '/';
    }
};

export function StirngToCache(fieldValue, myDateFormat) {
    if (!!fieldValue) {
        let separator = getLiteral();
        let cache = myDateFormat.replace('DD','00').replace('MM', '00').replace('YYYY', (new Date()).getFullYear()).split(separator);
        let valueArray = fieldValue.split(separator);
        return cache.reduce(function(acc, cur, idx) {
            if (valueArray.length > idx) {
              let curChars = cur.split("");
                let valueChars = valueArray[idx].split("");
              let tempArray = curChars.reduce(function(accChar, curChar, idxChar) {
                  if (valueChars.length >= (curChars.length - idxChar)) {
                    accChar += valueChars[valueChars.length - curChars.length + idxChar];
                  } else {
                    accChar += curChar;
                  }
                return accChar;
              }, '')
              acc.push(tempArray);
            } else {
              acc.push(cur);
            }
            return acc;
          }, []).join(separator);
    } else {
        return fieldValue;
    } 
}

export function stringToType(fieldValue, fieldType, myDateFormat) {
    if (fieldValue) {
        switch (fieldType) {
            case 'date': return moment.utc(StirngToCache(fieldValue, myDateFormat), myDateFormat).toDate();
            default: return fieldValue;
        }
    } else {
        return '';
    }
}

export function isValidFormat (fieldValue, fieldType, myDateFormat) {
    if (fieldValue) {
        switch (fieldType) {
            case 'date': return moment.utc(StirngToCache(fieldValue, myDateFormat), myDateFormat, true).isValid();
            default: return true;
        }
    } else {
        return true;
    }
}

export function typeToString (fieldValue, fieldType, myDateFormat) {
    if (fieldValue) {
        switch (fieldType) {
            case 'date': return String(moment.utc(fieldValue).format(myDateFormat));
            case 'number': return String(new Intl.NumberFormat().format(Math.round((fieldValue + Number.EPSILON) * 100) / 100));
            default: return fieldValue;
        }
    } else {
        return '';
    }
}

export function dateToString (fieldValue, fieldType, myDateFormat) {
    if (fieldValue) {
        switch (fieldType) {
            case 'date': return String(moment.utc(fieldValue).format(myDateFormat)); 
            default: return fieldValue;
        }
    } else {
        return '';
    }
}

export function doesMatch(search, value, type, isEqual) {
    
    if (!search) {
        return true;
    } else if (!value && search != 'any' && search != 'false' && search != '-1' && String(search).toUpperCase() != '=BLANK') {
        return false;
    } else {
        switch(type) {
            case 'id':
                return _.isEqual(search, value);
            case 'text':
                if (String(search).toUpperCase() === '=BLANK') {
                    return !value;
                } else if (String(search).toUpperCase() === '=NOTBLANK') {
                    return !!value;
                } else if (isEqual) {
                    return _.isEqual(String(value).toUpperCase(), String(search).toUpperCase());
                } else {
                    return String(value).toUpperCase().includes(String(search).toUpperCase());
                }
            case 'date':
                if (String(search).toUpperCase() === '=BLANK') {
                    return !value;
                } else if (String(search).toUpperCase() === '=NOTBLANK') {
                    return !!value;
                } else if (isEqual) {
                    return _.isEqual(dateToString(value, 'date', getDateFormat()), search);
                } else {
                    return dateToString(value, 'date', getDateFormat()).includes(search);
                }
            case 'number':
                if (search === '-1') {
                    return !value;
                } else if (search === '-2') {
                    return !!value;
                } else if (isEqual) {
                    return _.isEqual( Intl.NumberFormat().format(value).toString(), Intl.NumberFormat().format(search).toString());
                } else {
                    return Number(value).toString().includes(Number(search).toString());
                }
            case 'boolean':
                if(search == 'any') {
                    return true; //any or equal
                } else if (search == 'true' && !!value) {
                    return true; //true
                } else if (search == 'false' && !value) {
                    return true; //true
                }else {
                    return false;
                }
            case 'select':
                if(search == 'any' || _.isEqual(search, value)) {
                    return true; //any or equal
                } else {
                    return false;
                }
            default: return true;
        }
    }
}

export function resolve(path, obj) {
    return path.split('.').reduce(function(prev, cur) {
        return prev ? prev[cur] : null
    }, obj || self)
}

export function arraySorted(array, fieldOne, fieldTwo, fieldThree, fieldFour) {
    if (array) {
        const newArray = array
        newArray.sort(function(a,b){
            if (resolve(fieldOne, a) < resolve(fieldOne, b)) {
                return -1;
            } else if (resolve(fieldOne, a) > resolve(fieldOne, b)) {
                return 1;
            } else if (fieldTwo && resolve(fieldTwo, a) < resolve(fieldTwo, b)) {
                return -1;
            } else if (fieldTwo && resolve(fieldTwo, a) > resolve(fieldTwo, b)) {
                return 1;
            } else if (fieldThree && resolve(fieldThree, a) < resolve(fieldThree, b)) {
                return -1;
            } else if (fieldThree && resolve(fieldThree, a) > resolve(fieldThree, b)) {
                return 1;
            } else if (fieldFour && resolve(fieldFour, a) < resolve(fieldFour, b)) {
                return -1;
            } else if (fieldFour && resolve(fieldFour, a) > resolve(fieldFour, b)) {
                return 1;
            } else {
                return 0;
            }
        });
        return newArray;             
    }
}

export function arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
}

export function summarySorted(array, sort) {
    let tempArray = array.slice(0);
    switch(sort.name) {
      case 'hsDesc':
      case 'country':
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
      case 'pcs':
      case 'mtr':
      case 'totalNetWeight':
      case 'totalGrossWeight':
      case 'totalPrice':
        if (sort.isAscending) {
          return tempArray.sort(function (a, b) {
            let valueA = a[sort.name] || 0;
            let valueB = b[sort.name] || 0;
            return valueA - valueB;
          });
        } else {
          return tempArray.sort(function (a, b){
            let valueA = a[sort.name] || 0;
            let valueB = b[sort.name] || 0;
            return valueB - valueA
          });
        }
      default: return array;
    }
}

export function importSorted(array, sort) {
    let tempArray = array.slice(0);
    switch(sort.name) {
        case 'decNr':
        case 'boeNr':
        case 'country':
        case 'hsCode':
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
        case 'srNr':
        case 'pcs':
        case 'mtr':
        case 'unitNetWeight':
        case 'unitGrossWeight':
        case 'unitPrice':
            if (sort.isAscending) {
            return tempArray.sort(function (a, b) {
                let valueA = a[sort.name] || 0;
                let valueB = b[sort.name] || 0;
                return valueA - valueB;
            });
            } else {
            return tempArray.sort(function (a, b){
                let valueA = a[sort.name] || 0;
                let valueB = b[sort.name] || 0;
                return valueB - valueA
            });
            }
        default: return array;
    }
}

export function copyObject(mainObj) {
    if (!!mainObj && !_.isEmpty(mainObj)) {
        let objCopy = {};
        let key;
    
        for (key in mainObj) {
            objCopy[key] = mainObj[key];
        }
        return objCopy;
    } else {
        return {};
    }
}

export function getPageSize(clientHeight) {
    return Math.floor(((clientHeight - 53) / 33));
}