import type { ReactNode } from 'react';
import { houses } from '../houses';

interface Props {
    title: string;
    subtitle: string;
    sideTitle: string;
    sideText: string;
    children: ReactNode;
}

export default function AuthLayout({ title, subtitle, sideTitle, sideText, children }: Props) {
    return (
        <section className="w-full bg-panel py-10 lg:py-16">
            <div className="wrapper flex flex-col gap-6 lg:flex-row lg:gap-8">
                <div className="w-full rounded-3xl border border-line bg-page p-6 sm:p-10 lg:w-1/2 lg:p-12">
                    <h1 className="mb-2 text-3xl font-semibold">{title}</h1>
                    <p className="mb-8 text-sm text-muted">{subtitle}</p>
                    {children}
                </div>

                <div className="relative min-h-[320px] overflow-hidden rounded-3xl lg:w-1/2">
                    <img
                        src={houses[4].main}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8 text-white lg:p-12">
                        <h2 className="mb-3 text-3xl font-semibold lg:text-4xl">{sideTitle}</h2>
                        <p className="max-w-md text-sm text-gray-200 lg:text-base">{sideText}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
