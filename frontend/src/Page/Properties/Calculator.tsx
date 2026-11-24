import { useState } from 'react';

export default function Calculator({ price }: { price: number }) {
    const [down, setDown] = useState('20');
    const [rate, setRate] = useState('6.5');
    const [years, setYears] = useState('30');

    const debt = price * (1 - Number(down) / 100);
    const months = Number(years) * 12;
    const r = Number(rate) / 100 / 12;
    const monthly = r === 0 ? debt / months : (debt * r) / (1 - Math.pow(1 + r, -months));

    return (
        <div className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-3 gap-2 text-xs text-muted">
                <label className="flex flex-col gap-1">
                    Down, %
                    <input
                        type="number"
                        value={down}
                        onChange={(e) => setDown(e.target.value)}
                        className="input !px-3 !py-2"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    Rate, %
                    <input
                        type="number"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="input !px-3 !py-2"
                    />
                </label>
                <label className="flex flex-col gap-1">
                    Years
                    <input
                        type="number"
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                        className="input !px-3 !py-2"
                    />
                </label>
            </div>
            <p className="text-sm text-muted">
                Estimated payment:{' '}
                <strong className="text-base text-ink">
                    {Number.isFinite(monthly)
                        ? `$${Math.round(monthly).toLocaleString('en-US')}`
                        : '—'}
                </strong>{' '}
                / month
            </p>
        </div>
    );
}
