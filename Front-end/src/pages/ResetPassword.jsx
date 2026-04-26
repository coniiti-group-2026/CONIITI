import { useNavigate, useSearchParams } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') ?? '';

    const handleSuccess = () => {
        navigate('/login', {
            replace: true,
            state: { message: 'Contrase\u00f1a actualizada. Ya puedes iniciar sesi\u00f3n.' },
        });
    };

    return <ResetPasswordForm token={token} onSuccess={handleSuccess} />;
}
