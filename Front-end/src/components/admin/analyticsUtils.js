const EVENT_LABELS = {
    'usuario.registrado': 'Registros de usuarios',
    'user.registered': 'Registros de usuarios',
    'otp.enviado': 'Codigos enviados',
    'otp.sent': 'Codigos enviados',
    'notification.sent': 'Notificaciones enviadas',
    'notificacion.enviada': 'Notificaciones enviadas',
    'session.created': 'Sesiones creadas',
    'session.updated': 'Sesiones actualizadas',
    'speaker.updated': 'Cambios en ponentes',
    'checkout.created': 'Pagos iniciados',
    'payment.created': 'Pagos iniciados',
};

export function formatEventLabel(value) {
    const normalized = String(value ?? '').trim().toLowerCase();

    if (!normalized) {
        return 'Otros movimientos';
    }

    if (EVENT_LABELS[normalized]) {
        return EVENT_LABELS[normalized];
    }

    const readable = normalized.replace(/[._-]+/g, ' ').trim();
    return readable.charAt(0).toUpperCase() + readable.slice(1);
}
