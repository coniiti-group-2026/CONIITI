import { useEffect, useMemo, useState } from 'react';
import { FiEdit, FiImage, FiPlus, FiSave, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

import {
    createContentCard,
    deleteContentCard,
    fetchAdminContentSection,
    updateContentCard,
} from '../services/contentService';
import { uploadAsset } from '../services/filesAdminService';
import styles from '../styles/components/CMSPanel.module.css';


const SECTIONS = [
    { value: 'memorias', label: 'Memorias' },
    { value: 'galerias', label: 'Galerías' },
    { value: 'comite', label: 'Comité' },
    { value: 'conferencistas', label: 'Conferencistas' },
    { value: 'autores', label: 'Autores' },
];

const EMPTY_FORM = {
    section: 'memorias',
    title: '',
    subtitle: '',
    year: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    sort_order: 0,
};

export default function CMSPanel() {
    const [section, setSection] = useState('memorias');
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [editingCard, setEditingCard] = useState(null);
    const [viewingDesc, setViewingDesc] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const sectionLabel = useMemo(
        () => SECTIONS.find((item) => item.value === section)?.label ?? section,
        [section]
    );

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchAdminContentSection(section);
                if (!isCancelled) {
                    setCards(data);
                }
            } catch (err) {
                if (!isCancelled) {
                    setCards([]);
                    setError(err.message);
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            isCancelled = true;
        };
    }, [section]);

    const resetModal = () => {
        setEditingCard(null);
        setForm({ ...EMPTY_FORM, section });
        setModalOpen(false);
        setSubmitting(false);
        setUploadingImage(false);
    };

    const openCreateModal = () => {
        setEditingCard(null);
        setForm({ ...EMPTY_FORM, section });
        setModalOpen(true);
    };

    const openEditModal = (card) => {
        setEditingCard(card);
        setForm({
            section: card.section,
            title: card.title ?? '',
            subtitle: card.subtitle ?? '',
            year: card.year ?? '',
            description: card.description ?? '',
            image_url: card.image_url ?? '',
            link_url: card.link_url ?? '',
            is_active: card.is_active ?? true,
            sort_order: card.sort_order ?? 0,
        });
        setModalOpen(true);
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        setError('');

        try {
            const asset = await uploadAsset(file);
            setForm((prev) => ({
                ...prev,
                image_url: asset.url,
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setUploadingImage(false);
            event.target.value = '';
        }
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError('');

        const payload = {
            section: form.section,
            title: form.title.trim(),
            subtitle: form.subtitle.trim() || null,
            year: form.year === '' ? null : Number(form.year),
            description: form.description.trim() || null,
            image_url: form.image_url.trim() || null,
            link_url: form.link_url.trim() || null,
            is_active: form.is_active,
            sort_order: Number(form.sort_order) || 0,
        };

        try {
            const savedCard = editingCard
                ? await updateContentCard(editingCard.id, payload)
                : await createContentCard(payload);

            setCards((prev) => {
                const next = editingCard
                    ? prev.map((card) => (card.id === savedCard.id ? savedCard : card))
                    : [savedCard, ...prev];

                return next.sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
            });
            resetModal();
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    const handleDelete = async (card) => {
        if (!window.confirm(`¿Deseas eliminar la tarjeta "${card.title}"?`)) return;

        try {
            await deleteContentCard(card.id);
            setCards((prev) => prev.filter((item) => item.id !== card.id));
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div>
                    <h2>Contenido del sitio</h2>
                    <p>Organiza las tarjetas y secciones públicas que verán los asistentes.</p>
                </div>
                <div className={styles.controls}>
                    <select value={section} onChange={(event) => setSection(event.target.value)} className={styles.select}>
                        {SECTIONS.map((item) => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                    <button className={styles.addBtn} onClick={openCreateModal}>
                        <FiPlus /> Nueva tarjeta
                    </button>
                </div>
            </div>

            {error && !modalOpen && <p className={styles.noData}>{error}</p>}

            {loading ? (
                <p className={styles.noData}>Cargando contenido...</p>
            ) : cards.length === 0 ? (
                <p className={styles.noData}>No hay tarjetas cargadas para {sectionLabel.toLowerCase()}.</p>
            ) : (
                <div className={styles.grid}>
                    {cards.map((card) => (
                        <article key={card.id} className={`${styles.card} ${!card.is_active ? styles.inactive : ''}`}>
                            {card.image_url ? (
                                <img src={card.image_url} alt={card.title} className={styles.cardImg} />
                            ) : (
                                <div className={styles.cardImg} style={{ display: 'grid', placeItems: 'center', background: '#edf2f7', color: '#64748b' }}>
                                    <FiImage size={28} />
                                </div>
                            )}
                            <div className={styles.cardBody}>
                                <h3>{card.title}</h3>
                                {card.subtitle && <p className={styles.subtitle}>{card.subtitle}</p>}
                                {card.year && <p className={styles.yearBadge}>{card.year}</p>}
                                <div className={styles.descWrapper}>
                                    <p className={styles.cardDesc}>
                                        {card.description?.length > 120 ? `${card.description.slice(0, 120)}...` : card.description || 'Sin descripción.'}
                                    </p>
                                    {card.description?.length > 120 && (
                                        <button className={styles.readMoreBtn} onClick={() => setViewingDesc(card.description)}>
                                            Ver más
                                        </button>
                                    )}
                                </div>
                                <div className={styles.cardActions}>
                                    <button onClick={() => openEditModal(card)} title="Editar tarjeta">
                                        <FiEdit />
                                    </button>
                                    <button onClick={() => handleDelete(card)} className={styles.deleteBtn} title="Eliminar tarjeta">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {modalOpen && (
                <div className={styles.overlay} onClick={resetModal}>
                    <form className={styles.modal} onClick={(event) => event.stopPropagation()} onSubmit={handleSave}>
                        <h3>{editingCard ? 'Editar tarjeta' : 'Nueva tarjeta'} ({sectionLabel})</h3>

                        <label htmlFor="cms-title">Título</label>
                        <input id="cms-title" name="title" value={form.title} onChange={handleChange} required />

                        <label htmlFor="cms-subtitle">Subtítulo o cargo</label>
                        <input id="cms-subtitle" name="subtitle" value={form.subtitle} onChange={handleChange} />

                        {form.section === 'memorias' && (
                            <>
                                <label htmlFor="cms-year">Año</label>
                                <input id="cms-year" type="number" name="year" value={form.year} onChange={handleChange} placeholder="2026" />
                            </>
                        )}

                        <label htmlFor="cms-description">Descripción</label>
                        <textarea id="cms-description" rows="4" name="description" value={form.description} onChange={handleChange} />

                        <label htmlFor="cms-image-url">Imagen</label>
                        <input
                            id="cms-image-url"
                            name="image_url"
                            value={form.image_url}
                            onChange={handleChange}
                            placeholder="Pega un enlace disponible para la imagen"
                        />

                        <label htmlFor="cms-image-upload">Cargar imagen</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <input id="cms-image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
                            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                <FiUploadCloud style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
                                {uploadingImage ? 'Subiendo imagen...' : 'La imagen quedará lista para usarse en el sitio.'}
                            </span>
                        </div>

                        <label htmlFor="cms-link-url">Enlace de destino</label>
                        <input
                            id="cms-link-url"
                            name="link_url"
                            value={form.link_url}
                            onChange={handleChange}
                            placeholder="Pega el enlace al que quieras dirigir esta tarjeta"
                        />

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                                Visible al público
                            </label>

                            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                Orden
                                <input type="number" name="sort_order" value={form.sort_order} onChange={handleChange} style={{ width: '88px' }} />
                            </label>
                        </div>

                        {error && <p className={styles.noData} style={{ padding: '0.75rem 1rem' }}>{error}</p>}

                        <div className={styles.modalFoot}>
                            <button type="button" onClick={resetModal}>
                                <FiX /> Cancelar
                            </button>
                            <button type="submit" className={styles.addBtn} disabled={submitting || uploadingImage}>
                                <FiSave /> {submitting ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {viewingDesc && (
                <div className={styles.overlay} onClick={() => setViewingDesc(null)}>
                    <div className={styles.readModal} onClick={(event) => event.stopPropagation()}>
                        <h3>Descripción completa</h3>
                        <p className={styles.readText}>{viewingDesc}</p>
                        <div className={styles.modalFoot}>
                            <button type="button" onClick={() => setViewingDesc(null)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
