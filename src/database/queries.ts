import { emitMostRecentMessges } from "../server";
import pool from "./schema";

export const getMessages = (request, response) => {
    pool.query(
       "SELECT * FROM messages ORDER BY id DESC LIMIT 10",
       (error, results) => {
          if (error) {
             throw error;
          }
          response.status(200).json(results.rows);
       }
    );
 };

export const createMessage = (request, response) => {
    const text = 'username'
    const username='shdf'
    pool.query(
    "INSERT INTO messages (text, username) VALUES ($1, $2) RETURNING text, username, created_at",
       [text, username],
       (error, results) => {
          if (error) {
             throw error;
          }
          response.status(201).send(results.rows);
          }
    );
    emitMostRecentMessges()
 };

 export const getSocketMessages = () => {
    return new Promise((resolve) => {
       pool.query(
          "SELECT * FROM messages ORDER BY id DESC LIMIT 10",
          (error, results) => {
             if (error) {
                throw error;
             }
             resolve(results.rows);
           }
       );
    });
 };
 export const createSocketMessage = (message) => {
    return new Promise((resolve) => {
       pool.query(
          "INSERT INTO messages (text, username) VALUES ($1, $2) RETURNING text, username, created_at",
          [message.text, message.username],
          (error, results) => {
             if (error) {
                throw error;
             }
             resolve(results.rows);
          }
       );
    });
 };