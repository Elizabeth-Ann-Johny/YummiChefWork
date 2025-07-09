# Foreign Key Constraint Troubleshooting Guide

## Error: "insert or update on table 'dishes' violates foreign key constraint 'DISHES_chef_id_fkey'"

This error occurs when you try to insert a `chef_id` that doesn't exist in the `users` table.

### Solutions:

#### Option 1: Use the Complete Setup File (Recommended)
Run `insert_sample_users_and_dishes.sql` which:
1. Creates sample users first
2. Then inserts dishes with valid chef IDs

#### Option 2: Use Existing Users
1. Run `get_existing_users.sql` to find existing user IDs
2. Replace the `chef_id` values in your insert statements with these actual IDs

#### Option 3: Make chef_id Nullable (if appropriate)
If dishes don't always need a chef, you can modify the table:
```sql
ALTER TABLE dishes ALTER COLUMN chef_id DROP NOT NULL;
```
Then use `NULL` for chef_id in your insert statements.

#### Option 4: Temporarily Disable Constraints (Not Recommended)
```sql
-- Disable foreign key checks
SET foreign_key_checks = 0;

-- Insert your data
INSERT INTO dishes (...) VALUES (...);

-- Re-enable foreign key checks
SET foreign_key_checks = 1;
```

### Prevention Tips:
- Always create referenced records before referencing them
- Use actual IDs from your database, not random UUIDs
- Check foreign key relationships before inserting data
- Consider using transactions to ensure data consistency

### Common Foreign Key Issues:
1. **Wrong table name**: Make sure you're referencing the correct table
2. **Case sensitivity**: Check if column names match exactly
3. **Data type mismatch**: Ensure IDs are the same type (UUID vs INT)
4. **Missing records**: Referenced records must exist first
5. **Soft deletes**: Referenced records might be soft-deleted but still in the table