const GATEWAY_URL = 'http://localhost'; // Traefik Gateway

export async function createCheckoutSession(amount, currency, paymentRegion) {
    // Simulamos un user_id temporal ya que la sesión la maneja AuthContext
    const user_id = "00000000-0000-0000-0000-000000000000"; 
    
    // Asumiendo que has iniciado el contenedor de Traefik
    const response = await fetch(`${GATEWAY_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id,
            amount,
            currency,
            payment_region: paymentRegion
        })
    });
    
    if (!response.ok) {
        throw new Error("Error al generar link de pago");
    }
    
    return response.json();
}

export async function uploadFile(fileObject) {
    const formData = new FormData();
    formData.append("file", fileObject);
    
    const response = await fetch(`${GATEWAY_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
    });
    
    if (!response.ok) throw new Error("Error subiendo el archivo");
    return response.json();
}

export async function getAnalyticsStats() {
    const response = await fetch(`${GATEWAY_URL}/api/analytics/stats`);
    if (!response.ok) throw new Error("Error obteniendo estadísticas");
    return response.json();
}
