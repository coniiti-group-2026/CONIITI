import { useEffect, useRef } from 'react';

/**
 * usePolling — llama al callback dado en un intervalo regular.
 * Simula la recarga en segundo plano estilo SWR. Reemplazar con
 * React Query / SWR cuando la API real esté disponible.
 *
 * @param {() => void} callback — función a llamar en cada tick
 * @param {number}     intervalMs — intervalo de polling en ms (predeterminado 60 000)
 * @param {boolean}    enabled — si el polling está activo
 */
export function usePolling(callback, intervalMs = 60_000, enabled = true) {
    const savedCallback = useRef(callback);

    // Mantener siempre la última referencia del callback
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (!enabled) return;

        const tick = () => savedCallback.current();
        const id = setInterval(tick, intervalMs);

        return () => clearInterval(id);
    }, [intervalMs, enabled]);
}
