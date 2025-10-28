// src/database/database.utils.ts
import fs from "fs";
import path from "path";

// Resolve path to db.json file
const dbPath = path.join(__dirname, "db.json");

/**
 * Read and parse JSON database file
 */
export const readDB = () => {
  try {
    const data = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Error reading database:", error);
    return {};
  }
};

/**
 * Write data back to JSON database file
 */
export const writeDB = (data: any) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
    console.log("✅ Database updated successfully");
  } catch (error) {
    console.error("❌ Error writing to database:", error);
  }
};

/**
 * Get all records from a given collection name
 */
export const getCollection = (collectionName: string) => {
  const db = readDB();
  return db[collectionName] || [];
};

/**
 * Add a record to a given collection
 */
export const addToCollection = (collectionName: string, newItem: any) => {
  const db = readDB();
  if (!db[collectionName]) db[collectionName] = [];
  db[collectionName].push(newItem);
  writeDB(db);
  return newItem;
};

/**
 * Update a record in a collection by ID
 */
export const updateCollectionItem = (
  collectionName: string,
  itemId: string,
  updates: any
) => {
  const db = readDB();
  const collection = db[collectionName];
  if (!collection) return null;

  const index = collection.findIndex((item: any) => item.id === itemId);
  if (index === -1) return null;

  collection[index] = { ...collection[index], ...updates };
  writeDB(db);
  return collection[index];
};

/**
 * Delete a record from a collection by ID
 */
export const deleteCollectionItem = (
  collectionName: string,
  itemId: string
) => {
  const db = readDB();
  const collection = db[collectionName];
  if (!collection) return false;

  const updatedCollection = collection.filter(
    (item: any) => item.id !== itemId
  );
  db[collectionName] = updatedCollection;
  writeDB(db);
  return true;
};
