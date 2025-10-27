
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Config = () => {
    const [config, setConfig] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        api.getConfig()
            .then(response => {
                if (response.success) {
                    setConfig(response.config);
                }
            })
            .catch(error => {
                setMessage('Erreur lors de la récupération de la configuration.');
            });
    }, []);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const keys = name.split('.');
        
        let parsedValue = value;
        if (type === 'number') {
            parsedValue = parseFloat(value);
        }

        if (keys.length === 2) {
            const [section, key] = keys;
            setConfig(prevConfig => ({
                ...prevConfig,
                [section]: {
                    ...prevConfig[section],
                    [key]: parsedValue
                }
            }));
        } else {
            setConfig(prevConfig => ({
                ...prevConfig,
                [name]: parsedValue
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        api.setConfig(config)
            .then(response => {
                if (response.success) {
                    setMessage('Configuration mise à jour avec succès.');
                } else {
                    setMessage('Erreur lors de la mise à jour de la configuration.');
                }
            })
            .catch(error => {
                setMessage('Erreur lors de la mise à jour de la configuration.');
            });
    };

    if (!config) {
        return <div>Chargement de la configuration...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>Paramètres du modèle</h2>
            {message && <div className="alert alert-info">{message}</div>}
            <form onSubmit={handleSubmit}>
                {Object.keys(config).map(key => {
                    if (typeof config[key] === 'object' && config[key] !== null) {
                        return (
                            <div key={key}>
                                <h4>{key.replace(/_/g, ' ')}</h4>
                                {Object.keys(config[key]).map(subKey => (
                                    <div className="form-group" key={`${key}.${subKey}`}>
                                        <label htmlFor={`${key}.${subKey}`}>{subKey.replace(/_/g, ' ')}</label>
                                        <input
                                            type={typeof config[key][subKey] === 'number' ? 'number' : 'text'}
                                            className="form-control"
                                            id={`${key}.${subKey}`}
                                            name={`${key}.${subKey}`}
                                            value={config[key][subKey]}
                                            onChange={handleChange}
                                            step={typeof config[key][subKey] === 'number' && config[key][subKey].toString().includes('.') ? 'any' : '1'}
                                        />
                                    </div>
                                ))}
                            </div>
                        );
                    }
                    return (
                        <div className="form-group" key={key}>
                            <label htmlFor={key}>{key.replace(/_/g, ' ')}</label>
                            <input
                                type={typeof config[key] === 'number' ? 'number' : 'text'}
                                className="form-control"
                                id={key}
                                name={key}
                                value={config[key]}
                                onChange={handleChange}
                            />
                        </div>
                    );
                })}
                <button type="submit" className="btn btn-primary mt-3">Sauvegarder</button>
            </form>
        </div>
    );
};

export default Config;
