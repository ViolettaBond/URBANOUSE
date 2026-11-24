import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({
    children,
    admin = false,
}: {
    children: ReactNode;
    admin?: boolean;
}) {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');

    if (!localStorage.getItem('token') || !user) {
        return (
            <Navigate to="/signin" replace state={{ from: location.pathname + location.search }} />
        );
    }
    if (admin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return <>{children}</>;
}
