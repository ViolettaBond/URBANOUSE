import { useEffect, useState, type FormEvent } from 'react';
import Modal from '../../Components/Modal';

interface Field {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'textarea' | 'checkbox' | 'select';
    options?: string[];
}

interface Section {
    title: string;
    list: string;
    api: string;
    columns: { name: string; label: string }[];
    fields: Field[];
}

const sections: Section[] = [
    {
        title: 'Properties',
        list: '/api/properties',
        api: 'properties',
        columns: [
            { name: 'id', label: 'ID' },
            { name: 'title', label: 'Title' },
            { name: 'city', label: 'City' },
            { name: 'listing_type', label: 'Type' },
            { name: 'price', label: 'Price' },
            { name: 'is_featured', label: 'Featured' },
            { name: 'is_popular', label: 'Popular' },
        ],
        fields: [
            { name: 'title', label: 'Title' },
            { name: 'description', label: 'Description', type: 'textarea' },
            {
                name: 'listing_type',
                label: 'Sale or rent',
                type: 'select',
                options: ['sale', 'rent'],
            },
            {
                name: 'status',
                label: 'Status (not "active" = hidden from the site and from this list)',
                type: 'select',
                options: ['active', 'draft', 'sold', 'rented', 'archived'],
            },
            { name: 'price', label: 'Price', type: 'number' },
            { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
            { name: 'bathrooms', label: 'Bathrooms', type: 'number' },
            { name: 'area_sqft', label: 'Area, sq.ft', type: 'number' },
            { name: 'garage_spaces', label: 'Garage spaces', type: 'number' },
            { name: 'year_built', label: 'Year built', type: 'number' },
            { name: 'address_line', label: 'Address' },
            { name: 'postal_code', label: 'Postal code' },
            { name: 'is_featured', label: 'Featured (shown in "Handpicked")', type: 'checkbox' },
            { name: 'is_popular', label: 'Popular', type: 'checkbox' },
        ],
    },
    {
        title: 'Agents',
        list: '/api/agents',
        api: 'agents',
        columns: [
            { name: 'id', label: 'ID' },
            { name: 'first_name', label: 'First name' },
            { name: 'last_name', label: 'Last name' },
            { name: 'city', label: 'City' },
            { name: 'email', label: 'Email' },
            { name: 'rating', label: 'Rating' },
        ],
        fields: [
            { name: 'first_name', label: 'First name' },
            { name: 'last_name', label: 'Last name' },
            { name: 'title', label: 'Job title' },
            { name: 'bio', label: 'About', type: 'textarea' },
            { name: 'photo_url', label: 'Photo URL' },
            { name: 'email', label: 'Email' },
            { name: 'phone', label: 'Phone' },
            { name: 'rating', label: 'Rating (0–5)', type: 'number' },
            { name: 'properties_sold', label: 'Properties sold', type: 'number' },
            { name: 'is_active', label: 'Active (shown on the site)', type: 'checkbox' },
        ],
    },
    {
        title: 'Projects',
        list: '/api/projects',
        api: 'projects',
        columns: [
            { name: 'id', label: 'ID' },
            { name: 'title', label: 'Title' },
            { name: 'units_available', label: 'Units' },
            { name: 'is_published', label: 'Published' },
        ],
        fields: [
            { name: 'title', label: 'Title' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'cover_url', label: 'Cover URL' },
            { name: 'units_available', label: 'Units available', type: 'number' },
            { name: 'is_published', label: 'Published', type: 'checkbox' },
        ],
    },
    {
        title: 'Inquiries',
        list: '/api/inquiries',
        api: 'inquiries',
        columns: [
            { name: 'id', label: 'ID' },
            { name: 'property_title', label: 'Property' },
            { name: 'type', label: 'Type' },
            { name: 'name', label: 'Name' },
            { name: 'email', label: 'Email' },
            { name: 'message', label: 'Message' },
            { name: 'status', label: 'Status' },
        ],
        fields: [
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                options: ['new', 'in_progress', 'done', 'cancelled'],
            },
        ],
    },
    {
        title: 'Messages',
        list: '/api/contact_messages',
        api: 'contact_messages',
        columns: [
            { name: 'id', label: 'ID' },
            { name: 'name', label: 'Name' },
            { name: 'email', label: 'Email' },
            { name: 'message', label: 'Message' },
            { name: 'is_handled', label: 'Handled' },
        ],
        fields: [{ name: 'is_handled', label: 'Handled', type: 'checkbox' }],
    },
];

type Row = Record<string, any>;

export default function Admin() {
    const [tab, setTab] = useState(0);
    const [rows, setRows] = useState<Row[] | null>(null);
    const [editing, setEditing] = useState<Row | null>(null);
    const [values, setValues] = useState<Row>({});
    const [message, setMessage] = useState({ text: '', bad: false });
    const [reload, setReload] = useState(0);

    const section = sections[tab];
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    useEffect(() => {
        document.title = 'Admin — Urbanouse';
    }, []);

    useEffect(() => {
        setRows(null);
        fetch(section.list, { headers })
            .then((res) => res.json())
            .then((json) =>
                json.success ? setRows(json.data) : setMessage({ text: json.error, bad: true }),
            )
            .catch(() => setMessage({ text: 'Cannot reach the server', bad: true }));
    }, [tab, reload]);

    const changeTab = (index: number) => {
        setTab(index);
        setMessage({ text: '', bad: false });
    };

    const startEdit = (row: Row) => {
        const start: Row = {};
        for (const field of section.fields)
            start[field.name] = row[field.name] ?? (field.type === 'checkbox' ? false : '');
        setValues(start);
        setEditing(row);
    };

    const save = async (event: FormEvent) => {
        event.preventDefault();
        if (!editing) return;

        const body: Row = {};
        for (const field of section.fields) {
            const value = values[field.name];
            if (field.type === 'checkbox') body[field.name] = Boolean(value);
            else if (field.type === 'number') {
                if (value !== '') body[field.name] = Number(value);
            } else if (value !== '') body[field.name] = value;
        }

        const res = await fetch(`/api/${section.api}/${editing.id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) return setMessage({ text: json.error, bad: true });

        setEditing(null);
        setMessage({ text: 'Saved', bad: false });
        setReload(reload + 1);
    };

    const remove = async (row: Row) => {
        const name = row.title ?? row.first_name ?? row.email ?? `#${row.id}`;
        if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;

        const res = await fetch(`/api/${section.api}/${row.id}`, { method: 'DELETE', headers });
        const json = await res.json();
        if (!json.success) return setMessage({ text: json.error, bad: true });

        setMessage({ text: 'Deleted', bad: false });
        setReload(reload + 1);
    };

    const show = (value: unknown) =>
        typeof value === 'boolean'
            ? value
                ? '✓'
                : '—'
            : value === null || value === undefined
              ? ''
              : String(value);

    return (
        <section className="section">
            <div className="wrapper">
                <h1 className="mb-8 text-4xl font-semibold tracking-tight sm:text-5xl">
                    Admin panel
                </h1>

                <div className="mb-8 flex flex-wrap gap-3">
                    {sections.map((item, index) => (
                        <button
                            key={item.title}
                            type="button"
                            onClick={() => changeTab(index)}
                            className={`pill ${tab === index ? 'pill-active' : ''}`}>
                            {item.title}
                        </button>
                    ))}
                </div>

                {message.text && (
                    <p
                        role="status"
                        className={
                            message.bad
                                ? 'error mb-6'
                                : 'mb-6 rounded-2xl border border-line bg-panel px-4 py-3 text-sm'
                        }>
                        {message.text}
                    </p>
                )}

                {rows === null && !message.bad && <p className="text-muted">Loading…</p>}
                {rows?.length === 0 && <p className="text-muted">Nothing here yet.</p>}

                {rows && rows.length > 0 && (
                    <div className="overflow-x-auto rounded-3xl border border-line">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-panel">
                                <tr>
                                    {section.columns.map((column) => (
                                        <th key={column.name} className="px-4 py-3 font-medium">
                                            {column.label}
                                        </th>
                                    ))}
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.id} className="border-t border-line">
                                        {section.columns.map((column) => (
                                            <td
                                                key={column.name}
                                                className="max-w-[260px] truncate px-4 py-3">
                                                {show(row[column.name])}
                                            </td>
                                        ))}
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(row)}
                                                className="pill mr-2 !px-4 !py-1.5">
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(row)}
                                                className="rounded-full border border-red-500/50 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-500/10 dark:text-red-400">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {editing && (
                <Modal
                    title={`Edit · ${section.title} #${editing.id}`}
                    onClose={() => setEditing(null)}>
                    <form onSubmit={save} className="flex flex-col gap-4">
                        {editing.message && (
                            <p className="rounded-2xl bg-panel p-4 text-sm text-muted">
                                “{editing.message}”
                            </p>
                        )}

                        {section.fields.map((field) => (
                            <label
                                key={field.name}
                                className={
                                    field.type === 'checkbox'
                                        ? 'flex items-center gap-3 text-sm'
                                        : 'flex flex-col gap-2 text-sm font-medium'
                                }>
                                {field.type === 'checkbox' ? (
                                    <>
                                        <input
                                            type="checkbox"
                                            checked={Boolean(values[field.name])}
                                            onChange={(e) =>
                                                setValues({
                                                    ...values,
                                                    [field.name]: e.target.checked,
                                                })
                                            }
                                            className="h-5 w-5"
                                        />
                                        {field.label}
                                    </>
                                ) : (
                                    <>
                                        {field.label}
                                        {field.type === 'textarea' ? (
                                            <textarea
                                                rows={4}
                                                value={values[field.name]}
                                                onChange={(e) =>
                                                    setValues({
                                                        ...values,
                                                        [field.name]: e.target.value,
                                                    })
                                                }
                                                className="input resize-none font-normal"
                                            />
                                        ) : field.type === 'select' ? (
                                            <select
                                                value={values[field.name]}
                                                onChange={(e) =>
                                                    setValues({
                                                        ...values,
                                                        [field.name]: e.target.value,
                                                    })
                                                }
                                                className="input font-normal">
                                                {field.options?.map((option) => (
                                                    <option key={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field.type ?? 'text'}
                                                step="any"
                                                value={values[field.name]}
                                                onChange={(e) =>
                                                    setValues({
                                                        ...values,
                                                        [field.name]: e.target.value,
                                                    })
                                                }
                                                className="input font-normal"
                                            />
                                        )}
                                    </>
                                )}
                            </label>
                        ))}

                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn flex-1">
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="btn-outline flex-1">
                                Cancel
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </section>
    );
}
