import { useEffect, useState } from 'react';
import { FiAlertTriangle, FiDownload, FiFile, FiRefreshCw, FiTrash2, FiUploadCloud } from 'react-icons/fi';

import { deleteAsset, listAssets, uploadAsset } from '../../services/filesAdminService';
import styles from '../../styles/components/DocumentManager.module.css';


function formatDate(iso) {
    if (!iso) return '';

    return new Date(iso).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function formatFileSize(sizeBytes) {
    const size = Number(sizeBytes ?? 0);
    if (!size) return '';

    if (size >= 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (size >= 1024) {
        return `${Math.round(size / 1024)} KB`;
    }

    return `${size} B`;
}

function buildAssetMeta(asset) {
    const parts = [];

    const sizeLabel = formatFileSize(asset.size_bytes);
    if (sizeLabel) {
        parts.push(sizeLabel);
    }

    const dateLabel = formatDate(asset.created_at);
    if (dateLabel) {
        parts.push(`Subido ${dateLabel}`);
    }

    return parts.join(' | ') || 'Disponible para descarga';
}

export default function FileManager() {
    const [assets, setAssets] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadAssets = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await listAssets(50);
            setAssets(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAssets();
    }, []);

    const handleUpload = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        setUploading(true);
        setError('');
        try {
            const asset = await uploadAsset(selectedFile);
            setAssets((prev) => [asset, ...prev]);
            setSelectedFile(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (asset) => {
        if (!window.confirm(`¿Deseas eliminar el archivo "${asset.original_name}"?`)) return;

        try {
            await deleteAsset(asset.id);
            setAssets((prev) => prev.filter((item) => item.id !== asset.id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <form onSubmit={handleUpload} className={styles.form}>
                <h4 className={styles.formTitle}>Biblioteca de archivos</h4>
                <p className={styles.hint}>
                    Sube y organiza archivos para reutilizarlos en documentos, contenido y otros espacios del sitio.
                </p>

                {error && <p className={styles.error}>{error}</p>}

                <div className={styles.formGrid}>
                    <div className={styles.formGridFull}>
                        <label className={styles.label}>Archivo</label>
                        <input
                            type="file"
                            className={styles.input}
                            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                        />
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="submit" className={styles.btnPrimary} disabled={!selectedFile || uploading}>
                        <FiUploadCloud size={14} /> {uploading ? 'Subiendo...' : 'Subir archivo'}
                    </button>
                    <button type="button" className={styles.btnSecondary} onClick={loadAssets} disabled={loading}>
                        <FiRefreshCw size={14} /> Actualizar lista
                    </button>
                </div>
            </form>

            {loading ? (
                <p className={styles.emptyState}>Cargando archivos...</p>
            ) : assets.length === 0 ? (
                <div className={styles.emptyState}>
                    <FiFile size={38} className={styles.emptyIcon} />
                    <p>Aún no hay archivos cargados.</p>
                </div>
            ) : (
                <div className={styles.list}>
                    {assets.map((asset) => (
                        <article key={asset.id} className={styles.item}>
                            <div className={styles.itemLeft}>
                                <FiFile size={20} className={styles.itemIcon} />
                                <div>
                                    <p className={styles.itemName}>{asset.original_name}</p>
                                    <p className={styles.itemMeta}>{buildAssetMeta(asset)}</p>
                                </div>
                            </div>

                            <div className={styles.itemActions}>
                                <a href={asset.url} target="_blank" rel="noreferrer" className={styles.btnView}>
                                    <FiDownload size={13} /> Abrir
                                </a>
                                <button className={styles.btnDelete} onClick={() => handleDelete(asset)}>
                                    <FiTrash2 size={13} /> Eliminar
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <p className={styles.hint} style={{ marginTop: '1rem' }}>
                <FiAlertTriangle style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                Si un archivo ya se está usando en otra sección, no podrás eliminarlo hasta dejar de utilizarlo.
            </p>
        </div>
    );
}
