// module by X_x wolf_js X_x
// ------- подключение модулей ---------- //
import pkg from 'colors/safe.js';
const { red } = pkg;
import { format } from 'fecha';
import postgres from 'pg';
import fs from 'fs'
import { VoiceChatEndedContext } from 'puregram';
import { create_log } from '../logs';
import { create } from 'domain';
const { Client } = postgres;
/** 
 * @type {String}
 **/
let client;

const paramas = {
   getDateTime() {
       return format(new Date(), 'D.MM.YY H:mm:ss')
   }
}

function isLowerCase(str)  // функция для определения регистра.
{
   return str == str.toLowerCase() && str != str.toUpperCase();
}

const SQL = {
	list: ['tgId', 'id', 'name', 'country', 'vip', 'date'],
	sel_list: async(sql: string, number: number)=>{
		let res = await client.query('select '+sql);
		if(number) {
			res.rows.map(x=>{
				for(let i = 0; i<SQL.list.length; i++) {
					if(x[SQL.list[i]]) x[SQL.list[i]] = Number(x[SQL.list[i]]);
				}
			});
		}
		return res.rows;
	}
}

class DB {
  /**
   * connect db
   */

  readonly connect_string: string;
  request: string;
 constructor (params: {connect_string: string} ) {
      /**
    * @this {params} 
    * @type {String}
    */
   this.connect_string = params.connect_string;

   client = new Client(this.connect_string);
client.connect().then(x => {
  create_log(`[${paramas.getDateTime()}] > db_connected_successfull [CORE_By_WOLF_JS X_x]`)
  console.log(`[${paramas.getDateTime()}] > db_connected_successfull [CORE_By_WOLF_JS X_x]`)
}).catch(err => {
  console.log(red(`[${paramas.getDateTime()}] > error_connected_db:\n ${err}`))
})
}

/**
 * Функция прямого запроса pg.
 * @param {String} request
 */

 async query (request: string) {
   this.request = request;
   if(!this.request) console.error('[ERROR] > вы не указали запрос.')
   await client.query(this.request)
 }

 /**
 * Функция запроса на одну лишь запись в postgreSQL.
 * @param {String} sql
 * @param {Number} number
 */

 /**
 * Функция запроса на всю таблицу в postgreSQL.
 * @param {String} sql
 * @param {Number} number
 */

async sel_list (sql:string, number:number) {
  let res = await client.query('select '+sql);
  if(number) {
    res.rows.map(x=>{
      for(let i = 0; i<SQL.list.length; i++) {
        if(x[SQL.list[i]]) x[SQL.list[i]] = Number(x[SQL.list[i]]);
      }
    });
  }
  return res.rows;
}

 /**
 * Функция запроса на кол-во строк в таблице.
 * @param {Number} name_db
 */

async get_count (name_table:string) {
  try {
	let count = await client.query(`SELECT count(*) FROM ${name_table}`)
	return count.rows[0].count;
} catch (error) {
  if(error.code == '42P01') {
   console.log('Такой таблицы не существует.');
   return;
 }
  }
 }
}

/**
 * Класс для создания записи в базе данных.
 */

class table_db {

  /**
   * 
   * @param {String} table name_table
   */
  columns: object;
  query: string;
  readonly table_name: string;

  constructor (params: { table_name: string }) {
    this.table_name = params.table_name;
    if(!this.table_name) console.error(`error param name "table"`)
  }

     /**
 * Функция для создания записи в postgreSQL.
 * @param {String} columns
 */

  create_record (columns:object = {}): void { 
    (async () => {
    try {
   this.columns = columns;
   let columns_params = ``;
   let values_length = [];
   let val_length = ``;
   let params_length = JSON.stringify(this.columns)
   if(params_length.length == 2) return console.error(red(`[./modules/db.js error] params missing the create_record in table ${this.table_name}`))
 
   for (let i in Object.keys(this.columns)) {
     let a = ``
     let b = Number(i) + 1
     if(b != Object.keys(this.columns).length) a += `,`
    let len = values_length.length
    let len2 = len + 1
    values_length.push(len2)
    if(!isLowerCase(Object.keys(this.columns)[i])) {
   columns_params += `"${Object.keys(this.columns)[i]}"` + a
    } else {
    columns_params += Object.keys(this.columns)[i] + a
    }
   }
   
   for (let i in Object.keys(values_length)) {
     let num_keys = 1 + Number(Object.keys(values_length)[i])
     let a = ``
     let b = Number(i) + 1
     if(b != values_length.length) a += `,`
     val_length += '$' + num_keys + a
   }
 
  let arr = []
 
    for (let i in this.columns) {
    arr.push(
      this.columns[i]
    )
  }
 
   let text = `INSERT INTO ${this.table_name}(${columns_params}) VALUES(${val_length}) RETURNING *`
   await client.query(text, arr)
   create_log(`[${paramas.getDateTime()}] > NEW_RECORD_add_table`)
   console.log("\x1b[34m", `[${paramas.getDateTime()}] > NEW_RECORD_add_table`)
    } catch (err) {
      console.error("\x1b[41m", '[./modules/db.js] error create record:\n', err)
    }
  }) ()
  }

   /**
 * Функция запроса на одну лишь запись в postgreSQL.
 * @param {String} where
 */

   async get_sel_one (where: string): Promise<void> {
       try {
  let res = await client.query(`select * from ${this.table_name} ` + where);
  return res.rows[0];
} catch (e) {
  console.log('error query: select * from '+ this.table_name + where)
   }
 }

    /**
 * Функция удаления записи в таблице postgreSQL.
 * @param {String} query
 */

 async delete_record (params: {query: string}): Promise<void> {
  this.query = params.query;
  create_log(`Запись с параметром ${this.query} успешно удалена из таблицы ${this.table_name}.`)
  try {
  await client.query(`DELETE from ${this.table_name} WHERE ${this.query}`)
  console.log(`Запись с параметром ${this.query} успешно удалена из таблицы ${this.table_name}.`)
  } catch (e) {
  console.error(e)
  }
 }

}

export { DB, table_db }