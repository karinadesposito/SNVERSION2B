import { config } from 'dotenv';
config({path: '.env'});

export const DB_TYPE: any = process.env.DB_TYPE || 'mysql';
export const SECRET: string = process.env.SECRET;
export const HOST: string = process.env.HOST || 'localhost';
export const USER_DB_NAME: string = process.env.USER_DB_NAME;
export const USER_DB_PASSWORD: string = process.env.USER_DB_PASSWORD;
export const PORT: number = parseInt(process.env.PORT || '3300', 10);
export const DB_NAME: string = process.env.DB_NAME;
