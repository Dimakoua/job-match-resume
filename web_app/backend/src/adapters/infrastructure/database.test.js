import { describe, it, expect, beforeEach } from "vitest";
import { Miniflare } from "miniflare";
import { query, execute } from "./database.js";

describe("Database Helper Integration Tests", () => {
  let db;

  beforeEach(() => {
    db = global.DB;
  });

  it("should execute a simple SELECT query", async () => {
    const result = await query(db, "SELECT 1 as test_value");
    expect(result.results).toBeDefined();
    expect(result.results[0].test_value).toBe(1);
  });

  it("should handle parameterized queries", async () => {
    const result = await query(db, "SELECT ? as param", [42]);
    expect(result.results[0].param).toBe(42);
  });

  it("should throw wrapped error on invalid SQL", async () => {
    await expect(query(db, "INVALID SQL")).rejects.toThrow(
      "Database query failed",
    );
  });

  it("should execute INSERT statement successfully", async () => {
    // Create a temporary table for testing
    await execute(
      db,
      "CREATE TABLE test_execute (id INTEGER PRIMARY KEY, value TEXT)",
    );

    // Execute INSERT
    const result = await execute(
      db,
      "INSERT INTO test_execute (value) VALUES (?)",
      ["test_value"],
    );

    // Verify the result has meta information
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.meta).toBeDefined();
    expect(result.meta.changes).toBe(1); // One row inserted

    // Clean up
    await execute(db, "DROP TABLE test_execute");
  });
});
