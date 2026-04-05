import { useCallback, useEffect, useState } from 'react';

import {
    createDocument,
    deleteDocument,
    listDocuments,
    uploadAsset,
} from '../services/filesAdminService';


export function useDocuments(categoryFilter = '') {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await listDocuments({
                category: categoryFilter || undefined,
            });
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const createManagedDocument = async ({
        file,
        titulo,
        descripcion,
        category,
        ponente_nombre,
        session_id,
    }) => {
        const asset = await uploadAsset(file);
        const created = await createDocument({
            titulo,
            descripcion: descripcion || null,
            category,
            ponente_nombre: ponente_nombre || null,
            session_id: session_id || null,
            file_url: asset.url,
            asset_id: asset.id,
            original_name: asset.original_name,
            sort_order: 0,
        });

        setDocuments((prev) => [created, ...prev]);
        return created;
    };

    const removeManagedDocument = async (id) => {
        await deleteDocument(id);
        setDocuments((prev) => prev.filter((document) => document.id !== id));
    };

    return {
        documents,
        loading,
        error,
        setError,
        createDocument: createManagedDocument,
        deleteDocument: removeManagedDocument,
        refetchDocuments: fetchDocuments,
    };
}


export function useSpeakerDocuments({ speakerName, sessionId } = {}) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        if (!speakerName && !sessionId) {
            setDocuments([]);
            return;
        }

        setLoading(true);
        try {
            const data = await listDocuments({
                category: 'ponente',
                ponente_nombre: speakerName || undefined,
                session_id: sessionId || undefined,
            });
            setDocuments(Array.isArray(data) ? data : []);
        } catch {
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [sessionId, speakerName]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const addDocument = async ({ file, titulo, ponente, session_id }) => {
        const asset = await uploadAsset(file);
        const created = await createDocument({
            titulo: titulo || file.name,
            descripcion: null,
            category: 'ponente',
            ponente_nombre: ponente || speakerName || null,
            session_id: session_id || sessionId || null,
            file_url: asset.url,
            asset_id: asset.id,
            original_name: asset.original_name,
            sort_order: 0,
        });
        setDocuments((prev) => [created, ...prev]);
        return created;
    };

    const removeDocument = async (id) => {
        await deleteDocument(id);
        setDocuments((prev) => prev.filter((document) => document.id !== id));
    };

    return {
        documents,
        loading,
        addDocument,
        removeDocument,
        refetchDocuments: fetchDocuments,
    };
}
