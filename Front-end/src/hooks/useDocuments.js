// useDocuments.js
// Gestiona el estado y operaciones CRUD de documentos CONIITI.

import { useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const FILES_UPLOAD = 'http://localhost/api/files/upload';

/** Realiza peticiones autenticadas al backend. */
async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail ?? `HTTP ${res.status}`);
    }
    if (res.status === 204) return null;
    return res.json();
}

/** Sube binario al files-service y retorna la URL resultante. */
async function uploadBinary(file) {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(FILES_UPLOAD, { method: 'POST', body: fd });
    if (!res.ok) throw new Error(`Error subiendo archivo (${res.status})`);
    const { url } = await res.json();
    return `http://localhost${url}`;
}

/**
 * Hook principal de documentos.
 * @param {string} categoryFilter - Categoría para filtrar ('sistema' | 'ponente' | '')
 */
export function useDocuments(categoryFilter = '') {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDocuments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const qs = categoryFilter ? `?category=${categoryFilter}` : '';
            const data = await apiFetch(`/documents${qs}`);
            setDocuments(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [categoryFilter]);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

    /** Sube archivo y guarda metadatos. */
    const createDocument = async ({ file, titulo, descripcion, category, ponente_nombre }) => {
        const fileUrl = await uploadBinary(file);
        const payload = {
            titulo,
            descripcion: descripcion || null,
            category,
            ponente_nombre: ponente_nombre || null,
            file_url: fileUrl,
            sort_order: 0,
        };
        const newDoc = await apiFetch('/documents', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        setDocuments(prev => [newDoc, ...prev]);
        return newDoc;
    };

    /** Elimina documento por ID. */
    const deleteDocument = async (id) => {
        await apiFetch(`/documents/${id}`, { method: 'DELETE' });
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    return { documents, loading, error, setError, createDocument, deleteDocument };
}

/**
 * Hook para documentos filtrados por nombre de ponente.
 * @param {string} ponente - Nombre del ponente
 */
export function useSpeakerDocuments(ponente) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDocuments = useCallback(async () => {
        if (!ponente) return;
        setLoading(true);
        try {
            const qs = `?category=ponente&ponente_nombre=${encodeURIComponent(ponente)}`;
            const data = await apiFetch(`/documents${qs}`);
            setDocuments(Array.isArray(data) ? data : []);
        } catch {
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    }, [ponente]);

    useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

    /** Sube archivo asociado a un ponente. */
    const addDocument = async ({ file, titulo, ponente: speakerName }) => {
        const fileUrl = await uploadBinary(file);
        const newDoc = await apiFetch('/documents', {
            method: 'POST',
            body: JSON.stringify({
                titulo: titulo || file.name,
                category: 'ponente',
                ponente_nombre: speakerName,
                file_url: fileUrl,
                sort_order: 0,
            }),
        });
        setDocuments(prev => [newDoc, ...prev]);
        return newDoc;
    };

    /** Elimina documento por ID. */
    const removeDocument = async (id) => {
        await apiFetch(`/documents/${id}`, { method: 'DELETE' });
        setDocuments(prev => prev.filter(d => d.id !== id));
    };

    return { documents, loading, addDocument, removeDocument };
}
