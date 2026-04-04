// DocumentItem.jsx
// Fila individual de documento en la lista de DocumentManager.

import { FiFileText, FiDownload, FiTrash2 } from 'react-icons/fi';
import styles from '../../styles/components/DocumentManager.module.css';

const CATEGORY_LABELS = {
    sistema: 'Sistema / Congreso',
    ponente: 'Ponente / Sesion',
};

/** Formatea fecha ISO a texto corto en espanol. */
function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

/**
 * Representacion visual de un documento.
 * @param {{ doc: object, onDelete: Function }} props
 */
export default function DocumentItem({ doc, onDelete }) {
    const handleDelete = () => {
        if (window.confirm('Eliminar este documento?')) {
            onDelete(doc.id);
        }
    };

    return (
        <div className={styles.item}>
            <div className={styles.itemLeft}>
                <FiFileText size={20} className={styles.itemIcon} />
                <div>
                    <p className={styles.itemName}>{doc.titulo}</p>
                    <p className={styles.itemMeta}>
                        {CATEGORY_LABELS[doc.category] ?? doc.category}
                        {doc.ponente_nombre && ` · ${doc.ponente_nombre}`}
                        {' · '}{formatDate(doc.created_at)}
                    </p>
                </div>
            </div>

            <div className={styles.itemActions}>
                <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.btnView}
                >
                    <FiDownload size={13} /> Ver
                </a>
                <button className={styles.btnDelete} onClick={handleDelete}>
                    <FiTrash2 size={13} /> Eliminar
                </button>
            </div>
        </div>
    );
}
