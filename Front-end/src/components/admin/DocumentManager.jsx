import { useState } from 'react';
import { FiFileText, FiPlus } from 'react-icons/fi';

import { useDocuments } from '../../hooks/useDocuments';
import DocumentForm from './DocumentForm';
import DocumentItem from './DocumentItem';
import styles from '../../styles/components/DocumentManager.module.css';


const FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'sistema', label: 'General del congreso' },
    { value: 'ponente', label: 'Material de ponencia' },
];

export default function DocumentManager() {
    const [filterCat, setFilterCat] = useState('');
    const [showForm, setShowForm] = useState(false);

    const {
        documents,
        loading,
        error,
        setError,
        createDocument,
        deleteDocument,
    } = useDocuments(filterCat);

    const handleCreate = async (data) => {
        await createDocument(data);
        setShowForm(false);
    };

    return (
        <div>
            <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            onClick={() => setFilterCat(filter.value)}
                            className={`${styles.filterBtn} ${filterCat === filter.value ? styles.filterBtnActive : ''}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                <button
                    className={styles.uploadBtn}
                    onClick={() => {
                        setShowForm((prev) => !prev);
                        setError('');
                    }}
                >
                    <FiPlus size={15} /> {showForm ? 'Ocultar formulario' : 'Agregar documento'}
                </button>
            </div>

            {showForm && (
                <DocumentForm
                    onSubmit={handleCreate}
                    onCancel={() => {
                        setShowForm(false);
                        setError('');
                    }}
                    error={error}
                />
            )}

            {!showForm && error && <p className={styles.error}>{error}</p>}

            {loading ? (
                <p className={styles.emptyState}>Cargando documentos...</p>
            ) : documents.length === 0 ? (
                <div className={styles.emptyState}>
                    <FiFileText size={38} className={styles.emptyIcon} />
                    <p>Aún no hay documentos publicados.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {documents.map((document) => (
                        <DocumentItem key={document.id} doc={document} onDelete={deleteDocument} />
                    ))}
                </div>
            )}
        </div>
    );
}
