import { useState } from 'react';
import { uploadFile } from '../../services/microservicesApi';
import { FiUploadCloud } from 'react-icons/fi';

export default function FileManager() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [resultUrl, setResultUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        
        setUploading(true);
        setError(null);
        setResultUrl(null);
        
        try {
            const result = await uploadFile(selectedFile);
            setResultUrl('http://localhost' + result.url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', background: '#f8f9fc', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <FiUploadCloud /> Subir Documentos (Archivos Internos)
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px' }}>
                Este módulo consume el <strong>files-service</strong> para alojar cronogramas o soportes.
            </p>
            
            <form onSubmit={handleUpload} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input 
                    type="file" 
                    onChange={e => setSelectedFile(e.target.files[0])} 
                    style={{ padding: '5px' }}
                />
                <button 
                    type="submit" 
                    disabled={uploading || !selectedFile}
                    style={{ 
                        background: '#0d6efd', color: 'white', padding: '8px 16px', 
                        border: 'none', borderRadius: '4px', cursor: 'pointer' 
                    }}
                >
                    {uploading ? 'Subiendo...' : 'Subir'}
                </button>
            </form>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            
            {resultUrl && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#ecfdf5', borderRadius: '6px' }}>
                    <p style={{ margin: 0, color: '#065f46' }}>
                        ¡Éxito! Archivo disponible en: <a href={resultUrl} target="_blank" rel="noreferrer" style={{ fontWeight: 'bold' }}>{resultUrl}</a>
                    </p>
                </div>
            )}
        </div>
    );
}
