-- First, insert sample users/chefs
INSERT INTO public.users (id, email, username, full_name, phone, created_at) VALUES 
(
  '092b1acf-d412-4991-9683-51f74ba075f6',
  'chef.rajesh@yummichef.com',
  'chef_rajesh',
  'Chef Rajesh Kumar',
  '+91-9876543210',
  NOW()
),
(
  '7f3e8b2a-1c45-4d67-9876-543210987654',
  'chef.maria@yummichef.com',
  'chef_maria',
  'Chef Maria Gonzalez',
  '+91-9876543211',
  NOW()
),
(
  '5a2b9c3d-4e5f-6789-abcd-ef0123456789',
  'chef.david@yummichef.com',
  'chef_david',
  'Chef David Chen',
  '+91-9876543212',
  NOW()
),
(
  '8e7f6d5c-4b3a-2918-7654-321098765432',
  'chef.priya@yummichef.com',
  'chef_priya',
  'Chef Priya Sharma',
  '+91-9876543213',
  NOW()
);

-- Now insert dishes with actual chef IDs
INSERT INTO public.dishes (
  chef_id, 
  name, 
  description, 
  image, 
  alergens, 
  cooking_time, 
  price, 
  created_at, 
  rating, 
  spice_level, 
  service_type, 
  cuisine, 
  ingredients, 
  dietary_type
) VALUES 

-- Indian Vegetarian Dishes (Chef Rajesh)
(
  '092b1acf-d412-4991-9683-51f74ba075f6',
  'Butter Paneer Masala',
  'Creamy tomato-based curry with soft paneer cubes, rich in flavor and aromatic spices',
  'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
  'dairy',
  25,
  320,
  NOW(),
  4.5,
  2,
  'home-delivery',
  'indian',
  ARRAY['paneer', 'tomato', 'butter', 'cream', 'garam masala', 'onion', 'garlic', 'ginger'],
  'vegetarian'
),

(
  '092b1acf-d412-4991-9683-51f74ba075f6',
  'Dal Makhani',
  'Slow-cooked black lentils in creamy tomato gravy with butter and cream',
  'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
  'dairy',
  45,
  280,
  NOW(),
  4.7,
  1,
  'chef-at-home',
  'indian',
  ARRAY['black lentils', 'kidney beans', 'butter', 'cream', 'tomato', 'onion', 'garlic', 'ginger'],
  'vegetarian'
),

(
  '8e7f6d5c-4b3a-2918-7654-321098765432',
  'Palak Paneer',
  'Fresh spinach curry with paneer cubes, packed with iron and nutrients',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
  'dairy',
  30,
  300,
  NOW(),
  4.3,
  2,
  'home-delivery',
  'indian',
  ARRAY['spinach', 'paneer', 'onion', 'tomato', 'garlic', 'ginger', 'cumin', 'coriander'],
  'vegetarian'
),

-- Indian Non-Vegetarian Dishes (Chef Rajesh)
(
  '092b1acf-d412-4991-9683-51f74ba075f6',
  'Chicken Biryani',
  'Fragrant basmati rice layered with marinated chicken and aromatic spices',
  'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
  'none',
  60,
  450,
  NOW(),
  4.8,
  3,
  'chef-at-home',
  'indian',
  ARRAY['basmati rice', 'chicken', 'yogurt', 'onion', 'saffron', 'mint', 'coriander', 'garam masala', 'ghee'],
  'non-vegetarian'
),

(
  '092b1acf-d412-4991-9683-51f74ba075f6',
  'Butter Chicken',
  'Tender chicken pieces in rich, creamy tomato-based curry with butter',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
  'dairy',
  35,
  420,
  NOW(),
  4.6,
  2,
  'home-delivery',
  'indian',
  ARRAY['chicken', 'butter', 'cream', 'tomato', 'onion', 'garlic', 'ginger', 'garam masala', 'fenugreek'],
  'non-vegetarian'
),

-- Chinese Dishes (Chef David)
(
  '5a2b9c3d-4e5f-6789-abcd-ef0123456789',
  'Hakka Noodles',
  'Stir-fried noodles with vegetables and soy sauce',
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
  'gluten, soy',
  15,
  180,
  NOW(),
  4.2,
  1,
  'home-delivery',
  'chinese',
  ARRAY['noodles', 'cabbage', 'carrot', 'bell pepper', 'soy sauce', 'garlic', 'ginger'],
  'vegetarian'
),

(
  '5a2b9c3d-4e5f-6789-abcd-ef0123456789',
  'Sweet and Sour Chicken',
  'Crispy chicken pieces in tangy sweet and sour sauce',
  'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
  'gluten',
  20,
  340,
  NOW(),
  4.3,
  1,
  'home-delivery',
  'chinese',
  ARRAY['chicken', 'bell pepper', 'pineapple', 'vinegar', 'sugar', 'tomato sauce', 'cornflour'],
  'non-vegetarian'
),

-- Continental Dishes (Chef Maria)
(
  '7f3e8b2a-1c45-4d67-9876-543210987654',
  'Margherita Pizza',
  'Classic Italian pizza with fresh mozzarella, tomatoes, and basil',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
  'gluten, dairy',
  20,
  320,
  NOW(),
  4.5,
  0,
  'home-delivery',
  'italian',
  ARRAY['pizza dough', 'mozzarella', 'tomato sauce', 'basil', 'olive oil'],
  'vegetarian'
),

(
  '7f3e8b2a-1c45-4d67-9876-543210987654',
  'Chicken Alfredo Pasta',
  'Creamy pasta with grilled chicken in rich Alfredo sauce',
  'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400',
  'gluten, dairy',
  25,
  420,
  NOW(),
  4.4,
  0,
  'chef-at-home',
  'italian',
  ARRAY['pasta', 'chicken', 'cream', 'parmesan', 'butter', 'garlic', 'herbs'],
  'non-vegetarian'
),

-- Thai Dishes (Chef David)
(
  '5a2b9c3d-4e5f-6789-abcd-ef0123456789',
  'Pad Thai',
  'Stir-fried rice noodles with shrimp, tofu, and peanuts',
  'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400',
  'nuts, seafood',
  20,
  380,
  NOW(),
  4.6,
  2,
  'chef-at-home',
  'thai',
  ARRAY['rice noodles', 'shrimp', 'tofu', 'peanuts', 'bean sprouts', 'lime', 'fish sauce'],
  'non-vegetarian'
),

-- More dishes by Chef Priya
(
  '8e7f6d5c-4b3a-2918-7654-321098765432',
  'Masala Dosa',
  'Crispy South Indian crepe filled with spiced potato filling',
  'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
  'none',
  30,
  180,
  NOW(),
  4.7,
  2,
  'home-delivery',
  'indian',
  ARRAY['rice', 'lentils', 'potato', 'onion', 'mustard seeds', 'curry leaves', 'turmeric'],
  'vegetarian'
),

(
  '8e7f6d5c-4b3a-2918-7654-321098765432',
  'Chole Bhature',
  'Spicy chickpea curry served with deep-fried bread',
  'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400',
  'gluten',
  40,
  250,
  NOW(),
  4.4,
  3,
  'chef-at-home',
  'indian',
  ARRAY['chickpeas', 'flour', 'onion', 'tomato', 'yogurt', 'garam masala', 'ginger', 'garlic'],
  'vegetarian'
);

-- Create favorites table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.favorites (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null,
    dish_id uuid not null,
    created_at timestamp without time zone default now(),
    constraint favorites_pkey primary key (id),
    constraint favorites_dish_id_fkey foreign key (dish_id) references dishes(id) on delete cascade,
    constraint favorites_user_id_dish_id_unique unique (user_id, dish_id)
);