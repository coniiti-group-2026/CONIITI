import { FiCalendar, FiDownload, FiFileText, FiTrash2 } from 'react-icons/fi';

import styles from '../../styles/components/DocumentManager.module.css';


const CATEGORY_LABELS = {
    sistema: 'General del congreso',
    ponente: 'Material de ponencia',
};

function formatDate(iso) {
    if (!iso) return '';

    return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function DocumentItem({ doc, onDelete }) {
    const handleDelete = () => {
        if (window.confirm(`¿Deseas eliminar el documento "${doc.titulo}"?`)) {
            onDelete(doc.id);
        }
    };

    return (
        <article className={styles.item}>
            <div className={styles.itemLeft}>
                <FiFileText size={20} className={styles.itemIcon} />
                <div>
                    <p className={styles.itemName}>{doc.titulo}</p>
                    <p className={styles.itemMeta}>
                        {CATEGORY_LABELS[doc.category] ?? doc.category}
                        {doc.ponente_nombre && ` | ${doc.ponente_nombre}`}
                        {doc.original_name && ` | ${doc.original_name}`}
                    </p>
                    <p className={styles.itemMeta}>
                        <FiCalendar style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                        {formatDate(doc.created_at)}
                    </p>
                </div>
            </div>

            <div className={styles.itemActions}>
                <a href={doc.file_url} target="_blank" rel="noreferrer" className={styles.btnView}>
                    <FiDownload size={13} /> Abrir
                </a>
                <button className={styles.btnDelete} onClick={handleDelete}>
                    <FiTrash2 size={13} /> Eliminar
                </button>
            </div>
        </article>
    );
}
