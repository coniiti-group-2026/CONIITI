import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LiveFilter from './components/LiveFilter/LiveFilter';
import AgendaGrid from './components/AgendaGrid/AgendaGrid';
import { useAgenda } from './hooks/useAgenda';
import { usePolling } from './hooks/usePolling';
import styles from './App.module.css';

/**
 * App — componente raíz.
 * Compone Header + LiveFilter + AgendaGrid + Footer.
 * El estado vive en el hook useAgenda; polling vía usePolling.
 */
export default function App() {
    const {
        sessions,
        days,
        activeDay,
        activeModality,
        isLoading,
        setActiveDay,
        setActiveModality,
        refresh,
    } = useAgenda();

    // Polling cada 60 segundos (SWR simulado)
    usePolling(refresh, 60_000);

    return (
        <div className={styles.app}>
            <Header />

            {/* Indicador de polling */}
            <div className={styles.pollingBar}>
                <span className={styles.pollingDot} />
                Sincronización automática activa — cada 60 segundos
            </div>

            <main className={styles.main}>
                <LiveFilter
                    days={days}
                    activeDay={activeDay}
                    activeModality={activeModality}
                    onDayChange={setActiveDay}
                    onModalityChange={setActiveModality}
                />

                <AgendaGrid sessions={sessions} isLoading={isLoading} />
            </main>

            <Footer />
        </div>
    );
}
