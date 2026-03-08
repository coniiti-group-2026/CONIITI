import { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import styles from '../styles/components/CMSPanel.module.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const DEFAULT_CARD = {
    section: 'memorias',
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    sort_order: 0
};

export default function CMSPanel() {
    const [section, setSection] = useState('memorias');
    const [cards, setCards] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_CARD);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchCards(); }, [section]);

    const fetchCards = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/cms/cards/${section}?active_only=false`);
            if (res.ok) setCards(await res.json());
        } catch (e) {
            console.error('Error fetching cards:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const endpoint = editingId ? `${API_BASE}/cms/cards/${editingId}` : `${API_BASE}/cms/cards`;
            const method = editingId ? 'PUT' : 'POST';
            
            await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            
            setModalOpen(false);
            setEditingId(null);
            fetchCards();
        } catch (e) {
            alert('Error guardando la tarjeta');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar esta tarjeta?')) return;
        try {
            await fetch(`${API_BASE}/cms/cards/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            fetchCards();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Gestor de Contenidos</h2>
                <div className={styles.controls}>
                    <select value={section} onChange={e => setSection(e.target.value)} className={styles.select}>
                        <option value="memorias">Memorias</option>
                        <option value="galerias">Galerías</option>
                        <option value="comite">Miembros del Comité</option>
                        <option value="conferencistas">Oradores Principales</option>
                        <option value="autores">Autores / Trabajos</option>
                    </select>
                    <button 
                        className={styles.addBtn}
                        onClick={() => { setFormData({...DEFAULT_CARD, section}); setEditingId(null); setModalOpen(true); }}
                    >
                        <FiPlus /> Añadir Tarjeta
                    </button>
                </div>
            </div>

            {loading ? <p>Cargando...</p> : (
                <div className={styles.grid}>
                    {cards.length === 0 ? <p className={styles.noData}>No hay contenidos en esta sección aún.</p> : (
                        cards.map(card => (
                            <div key={card.id} className={`${styles.card} ${!card.is_active ? styles.inactive : ''}`}>
                                {card.image_url && <img src={card.image_url} alt={card.title} className={styles.cardImg} />}
                                <div className={styles.cardBody}>
                                    <h3>{card.title}</h3>
                                    <p>{card.description}</p>
                                    <div className={styles.cardActions}>
                                        <button onClick={() => { setFormData(card); setEditingId(card.id); setModalOpen(true); }}><FiEdit /></button>
                                        <button onClick={() => handleDelete(card.id)} className={styles.deleteBtn}><FiTrash2 /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {modalOpen && (
                <div className={styles.overlay} onClick={() => setModalOpen(false)}>
                    <form className={styles.modal} onClick={e => e.stopPropagation()} onSubmit={handleSave}>
                        <h3>{editingId ? 'Editar' : 'Añadir'} Contenido ({section})</h3>
                        
                        <label>Título</label>
                        <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />

                        <label>Descripción</label>
                        <textarea rows="3" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />

                        <label>URL Imagen</label>
                        <input type="url" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />

                        <label>URL Enlace (Botón de la tarjeta)</label>
                        <input type="url" value={formData.link_url || ''} onChange={e => setFormData({...formData, link_url: e.target.value})} placeholder="https://..." />

                        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                            <label><input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} /> Activo Público</label>
                            <label>Orden: <input type="number" style={{width: '60px'}} value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value)})} /></label>
                        </div>

                        <div className={styles.modalFoot}>
                            <button type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button type="submit" className={styles.addBtn}>Guardar</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
