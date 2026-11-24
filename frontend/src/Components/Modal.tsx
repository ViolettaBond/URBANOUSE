import { useEffect, type ReactNode } from 'react';

interface Props {
    title: string;
    onClose: () => void;
    wide?: boolean;
    children: ReactNode;
}

export default function Modal({ title, onClose, wide = false, children }: Props) {
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
            onClick={onClose}>
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
                className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-line bg-page p-6 shadow-2xl sm:p-8 ${wide ? 'max-w-5xl' : 'max-w-lg'}`}>
                <div className="mb-6 flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="h-9 w-9 shrink-0 rounded-full border border-line text-muted hover:text-ink">
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
