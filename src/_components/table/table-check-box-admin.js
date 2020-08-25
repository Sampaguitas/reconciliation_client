import React, { Component } from 'react';
import config from 'config';
import { authHeader } from '../../_helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './table-check-box-admin.css'

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

class TableCheckBoxAdmin extends Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: false,
            updating: false
        };

        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        const { checked } = this.props;
        this.setState({ checked: checked });
    }

    componentDidUpdate(prevProps, prevState) {
        const { checked } = this.props;
        if (checked != prevProps.checked) {
            this.setState({ checked: checked });
        }
    }

    handleChange(event) {
        event.preventDefault();
        const { checked } = this.state;
        const { id, refreshStore, setAlert } = this.props;
        this.setState({
            updating: true,
        }, () => {
            const requestOptions = {
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, isAdmin: !checked })
            };
            return fetch(`${config.apiUrl}/user/setAdmin`, requestOptions)
            .then(response => response.text().then(text => {
                this.setState({
                    updating: false,
                }, () => {
                    const data = text && JSON.parse(text);
                    const resMsg = (data && data.message) || response.statusText;
                    if (response.status === 401) {
                        // Unauthorized
                        localStorage.removeItem('user');
                        location.reload(true);
                    } else {
                        this.setState({
                            checked: response.status != 200 ? checked : !checked, 
                        }, () => {
                            setAlert(response.status != 200 ? 'alert-danger' : 'alert-success', resMsg);
                            refreshStore();
                        });
                    }
                });
            }));
        });
    }

    render(){
        const { checked } = this.state
         const { disabled } = this.props;
        return (
            <label className="fancy-table-check-box-admin" data-type="checkbox">
            <input
                name="isAdmin"
                type="checkbox"
                checked={checked}
                onChange={event => this.handleChange(event)}
                disabled={disabled}
                data-type="checkbox"
            />
            <FontAwesomeIcon
                data-type="checkbox"
                icon="check-square"
                className="checked fa-lg"
                style={{
                    color: disabled ? '#adb5bd' : '#0070C0',
                    padding: 'auto',
                    textAlign: 'center',
                    width: '100%',
                    margin: '0px',
                    verticalAlign: 'middle',
                    cursor: disabled ? 'auto' : 'pointer'
                }}
            />
            <FontAwesomeIcon
                data-type="checkbox"
                icon={["far", "square"]}
                className="unchecked fa-lg"
                style={{
                    color: disabled ? '#adb5bd' : '#0070C0',
                    padding: 'auto',
                    textAlign: 'center',
                    width: '100%',
                    margin: '0px',
                    verticalAlign: 'middle',
                    cursor: disabled ? 'auto' : 'pointer'
                }}
            /> 
            </label>
        );
    }
};

export default TableCheckBoxAdmin;
