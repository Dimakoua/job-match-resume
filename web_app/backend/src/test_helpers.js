// test_helpers.js
export async function cleanTestDatabase(db) {
  if (!db) return;

  // Clean in reverse dependency order to avoid foreign key constraints
  await db.prepare('DELETE FROM JobSearchLists').run();
  await db.prepare('DELETE FROM Resumes').run();
  await db.prepare('DELETE FROM Users').run();
}