import type { AuthUser } from './models';

// Добавляем req.user, который заполняют middleware auth / optionalAuth
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser | null;
        }
    }
}

export {};
