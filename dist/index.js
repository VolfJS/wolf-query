"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.table_db = exports.DB = void 0;
const safe_js_1 = __importDefault(require("colors/safe.js"));
const { red } = safe_js_1.default;
const fecha_1 = require("fecha");
const pg_1 = __importDefault(require("pg"));
const logs_1 = require("../logs");
const { Client } = pg_1.default;
let client;
const paramas = {
    getDateTime() {
        return fecha_1.format(new Date(), 'D.MM.YY H:mm:ss');
    }
};
function isLowerCase(str) {
    return str == str.toLowerCase() && str != str.toUpperCase();
}
const SQL = {
    list: ['tgId', 'id', 'name', 'country', 'vip', 'date'],
    sel_list: async (sql, number) => {
        let res = await client.query('select ' + sql);
        if (number) {
            res.rows.map(x => {
                for (let i = 0; i < SQL.list.length; i++) {
                    if (x[SQL.list[i]])
                        x[SQL.list[i]] = Number(x[SQL.list[i]]);
                }
            });
        }
        return res.rows;
    }
};
class DB {
    constructor(params) {
        this.connect_string = params.connect_string;
        client = new Client(this.connect_string);
        client.connect().then(x => {
            logs_1.create_log(`[${paramas.getDateTime()}] > db_connected_successfull [CORE_By_WOLF_JS X_x]`);
            console.log(`[${paramas.getDateTime()}] > db_connected_successfull [CORE_By_WOLF_JS X_x]`);
        }).catch(err => {
            console.log(red(`[${paramas.getDateTime()}] > error_connected_db:\n ${err}`));
        });
    }
    async query(request) {
        this.request = request;
        if (!this.request)
            console.error('[ERROR] > вы не указали запрос.');
        await client.query(this.request);
    }
    async sel_list(sql, number) {
        let res = await client.query('select ' + sql);
        if (number) {
            res.rows.map(x => {
                for (let i = 0; i < SQL.list.length; i++) {
                    if (x[SQL.list[i]])
                        x[SQL.list[i]] = Number(x[SQL.list[i]]);
                }
            });
        }
        return res.rows;
    }
    async get_count(name_table) {
        try {
            let count = await client.query(`SELECT count(*) FROM ${name_table}`);
            return count.rows[0].count;
        }
        catch (error) {
            if (error.code == '42P01') {
                console.log('Такой таблицы не существует.');
                return;
            }
        }
    }
}
exports.DB = DB;
class table_db {
    constructor(params) {
        this.table_name = params.table_name;
        if (!this.table_name)
            console.error(`error param name "table"`);
    }
    create_record(columns = {}) {
        (async () => {
            try {
                this.columns = columns;
                let columns_params = ``;
                let values_length = [];
                let val_length = ``;
                let params_length = JSON.stringify(this.columns);
                if (params_length.length == 2)
                    return console.error(red(`[./modules/db.js error] params missing the create_record in table ${this.table_name}`));
                for (let i in Object.keys(this.columns)) {
                    let a = ``;
                    let b = Number(i) + 1;
                    if (b != Object.keys(this.columns).length)
                        a += `,`;
                    let len = values_length.length;
                    let len2 = len + 1;
                    values_length.push(len2);
                    if (!isLowerCase(Object.keys(this.columns)[i])) {
                        columns_params += `"${Object.keys(this.columns)[i]}"` + a;
                    }
                    else {
                        columns_params += Object.keys(this.columns)[i] + a;
                    }
                }
                for (let i in Object.keys(values_length)) {
                    let num_keys = 1 + Number(Object.keys(values_length)[i]);
                    let a = ``;
                    let b = Number(i) + 1;
                    if (b != values_length.length)
                        a += `,`;
                    val_length += '$' + num_keys + a;
                }
                let arr = [];
                for (let i in this.columns) {
                    arr.push(this.columns[i]);
                }
                let text = `INSERT INTO ${this.table_name}(${columns_params}) VALUES(${val_length}) RETURNING *`;
                await client.query(text, arr);
                logs_1.create_log(`[${paramas.getDateTime()}] > NEW_RECORD_add_table`);
                console.log("\x1b[34m", `[${paramas.getDateTime()}] > NEW_RECORD_add_table`);
            }
            catch (err) {
                console.error("\x1b[41m", '[./modules/db.js] error create record:\n', err);
            }
        })();
    }
    async get_sel_one(where) {
        try {
            let res = await client.query(`select * from ${this.table_name} ` + where);
            return res.rows[0];
        }
        catch (e) {
            console.log('error query: select * from ' + this.table_name + where);
        }
    }
    async delete_record(params) {
        this.query = params.query;
        logs_1.create_log(`Запись с параметром ${this.query} успешно удалена из таблицы ${this.table_name}.`);
        try {
            await client.query(`DELETE from ${this.table_name} WHERE ${this.query}`);
            console.log(`Запись с параметром ${this.query} успешно удалена из таблицы ${this.table_name}.`);
        }
        catch (e) {
            console.error(e);
        }
    }
}
exports.table_db = table_db;
