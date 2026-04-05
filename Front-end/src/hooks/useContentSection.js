import { useEffect, useState } from 'react';

import { fetchContentSection, getContentSection } from '../services/contentService';


export default function useContentSection(section) {
    const [items, setItems] = useState(() => getContentSection(section));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isCancelled = false;

        const load = async () => {
            setLoading(true);
            const data = await fetchContentSection(section);
            if (!isCancelled) {
                setItems(data);
                setLoading(false);
            }
        };

        load();

        return () => {
            isCancelled = true;
        };
    }, [section]);

    return { items, loading };
}
