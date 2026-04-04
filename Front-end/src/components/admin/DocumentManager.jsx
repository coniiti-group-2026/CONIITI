// DocumentManager.jsx
// Orquestador del gestor de documentos: lista, filtros y formulario.

import { useState } from 'react';
import { FiFileText, FiPlus } from 'react-icons/fi';
import { useDocuments } from '../../hooks/useDocuments';
import DocumentForm from './DocumentForm';
import DocumentItem from './DocumentItem';
import styles from '../../styles/components/DocumentManager.module.css';

const FILTERS = [
    { value: '', label: 'Todos' },
    { value: 'sistema', label: 'Sistema / Congreso' },
    { value: 'ponente', label: 'Ponente / Sesion' },
];

/** Panel de administracion de documentos CONIITI. */
export default function DocumentManager() {
    const [filterCat, setFilterCat] = useState('');
    const [showForm, setShowForm] = useState(false);

    const { documents, loading, error, setError, createDocument, deleteDocument } = useDocuments(filterCat);

    const handleCreate = async (data) => {
        await createDocument(data);
        setShowForm(false);
    };

    return (
        <div>
            {/* Toolbar */}
            <div className={styles.toolbar}>
                <div className={styles.filterGroup}>
                    {FILTERS.map(f => (
                        <button
                            key={f.value}
                            onClick={() => setFilterCat(f.value)}
                            className={`${styles.filterBtn} ${filterCat === f.value ? styles.filterBtnActive : ''}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
                <button
                    className={styles.uploadBtn}
                    onClick={() => { setShowForm(!showForm); setError(''); }}
                >
                    <FiPlus size={15} /> Subir Documento
                </button>
            </div>

            {/* Formulario de subida */}
            {showForm && (
                <DocumentForm
                    onSubmit={handleCreate}
                    onCancel={() => { setShowForm(false); setError(''); }}
                    error={error}
                />
            )}

            {/* Error global */}
            {!showForm && error && <p className={styles.error}>{error}</p>}

            {/* Lista */}
            {loading ? (
                <p className={styles.emptyState}>Cargando documentos...</p>
            ) : documents.length === 0 ? (
                <div className={styles.emptyState}>
                    <FiFileText size={38} className={styles.emptyIcon} />
                    <p>No hay documentos. Sube el primero.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {documents.map(doc => (
                        <DocumentItem
                            key={doc.id}
                            doc={doc}
                            onDelete={deleteDocument}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
