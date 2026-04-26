import { useState } from 'react';
import { resetPassword } from '../services/authService';

const MIN_PASSWORD_LENGTH = 8;

function getPasswordError(password, confirmPassword) {
    if (password.length < MIN_PASSWORD_LENGTH) {
        return 'La contrase\u00f1a debe tener al menos 8 caracteres.';
    }

    if (password !== confirmPassword) {
        return 'Las contrase\u00f1as no coinciden.';
    }

    return '';
}

export default function useResetPasswordForm({ token, onSuccess }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const tokenMissing = !token;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (tokenMissing) {
            setError('El enlace de recuperacion es invalido o esta incompleto.');
            return;
        }

        const validationError = getPasswordError(password, confirmPassword);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword({
                token,
                new_password: password,
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        password,
        confirmPassword,
        error,
        isLoading,
        tokenMissing,
        setPassword,
        setConfirmPassword,
        handleSubmit,
    };
}
