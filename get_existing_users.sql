-- Query to find existing users in your database
SELECT id, email, username, full_name, created_at 
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- After running this query, copy the user IDs and replace the chef_id values 
-- in your dishes insert statements with these actual user IDs