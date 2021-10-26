declare class DB {
    readonly connect_string: string;
    request: string;
    constructor(params: {
        connect_string: string;
    });
    query(request: string): Promise<void>;
    sel_list(sql: string, number: number): Promise<any>;
    get_count(name_table: string): Promise<any>;
}
declare class table_db {
    columns: object;
    query: string;
    readonly table_name: string;
    constructor(params: {
        table_name: string;
    });
    create_record(columns?: object): void;
    get_sel_one(where: string): Promise<void>;
    delete_record(params: {
        query: string;
    }): Promise<void>;
}
export { DB, table_db };
