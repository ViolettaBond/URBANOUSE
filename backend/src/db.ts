import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
});

export interface DbResult<T> {
    rows: T[];
    rowCount: number | null;
}

// Типизированная обёртка над pool.query: query<Country>('SELECT ...') вернёт Country[] в rows.
// Своя обёртка нужна, потому что pool.query<T> требует тип с индексной сигнатурой,
// а обычные интерфейсы (Country, User...) её не имеют.
export const query = <T extends object = Record<string, unknown>>(
    text: string,
    values?: unknown[]
): Promise<DbResult<T>> => pool.query(text, values);

export default pool;
