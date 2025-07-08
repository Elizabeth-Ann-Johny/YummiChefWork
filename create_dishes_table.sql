-- Create dishes table for YummiChef app
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT NOT NULL,
    cooking_time INTEGER NOT NULL, -- in minutes
    rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    spice_level INTEGER CHECK (spice_level >= 0 AND spice_level <= 5),
    service_type VARCHAR(50) CHECK (service_type IN ('home-delivery', 'chef-at-home')),
    cuisine VARCHAR(100),
    ingredients TEXT[], -- Array of ingredients
    dietary_type VARCHAR(50) CHECK (dietary_type IN ('vegetarian', 'non-vegetarian', 'eggitarian', 'vegan')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_dishes_cuisine ON dishes(cuisine);
CREATE INDEX idx_dishes_dietary_type ON dishes(dietary_type);
CREATE INDEX idx_dishes_service_type ON dishes(service_type);
CREATE INDEX idx_dishes_price ON dishes(price);
CREATE INDEX idx_dishes_rating ON dishes(rating);

-- Insert sample dishes data
INSERT INTO dishes (name, description, price, image, cooking_time, rating, spice_level, service_type, cuisine, ingredients, dietary_type) VALUES

-- Indian Vegetarian Dishes
('Butter Paneer Masala', 'Creamy tomato-based curry with soft paneer cubes, rich in flavor and aromatic spices', 320, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', 25, 4.5, 2, 'home-delivery', 'indian', ARRAY['paneer', 'tomato', 'butter', 'cream', 'garam masala', 'onion', 'garlic', 'ginger'], 'vegetarian'),

('Dal Makhani', 'Slow-cooked black lentils in creamy tomato gravy with butter and cream', 280, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', 45, 4.7, 1, 'chef-at-home', 'indian', ARRAY['black lentils', 'kidney beans', 'butter', 'cream', 'tomato', 'onion', 'garlic', 'ginger'], 'vegetarian'),

('Palak Paneer', 'Fresh spinach curry with paneer cubes, packed with iron and nutrients', 300, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 30, 4.3, 2, 'home-delivery', 'indian', ARRAY['spinach', 'paneer', 'onion', 'tomato', 'garlic', 'ginger', 'cumin', 'coriander'], 'vegetarian'),

('Chole Bhature', 'Spicy chickpea curry served with fluffy deep-fried bread', 250, 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', 35, 4.4, 3, 'chef-at-home', 'indian', ARRAY['chickpeas', 'flour', 'onion', 'tomato', 'garlic', 'ginger', 'cumin', 'coriander', 'red chili'], 'vegetarian'),

-- Indian Non-Vegetarian Dishes
('Chicken Biryani', 'Fragrant basmati rice layered with marinated chicken and aromatic spices', 450, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400', 60, 4.8, 3, 'chef-at-home', 'indian', ARRAY['basmati rice', 'chicken', 'yogurt', 'onion', 'saffron', 'mint', 'coriander', 'garam masala', 'ghee'], 'non-vegetarian'),

('Butter Chicken', 'Tender chicken pieces in rich, creamy tomato-based curry with butter', 420, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 35, 4.6, 2, 'home-delivery', 'indian', ARRAY['chicken', 'butter', 'cream', 'tomato', 'onion', 'garlic', 'ginger', 'garam masala', 'fenugreek'], 'non-vegetarian'),

('Mutton Rogan Josh', 'Aromatic lamb curry with Kashmiri spices and yogurt', 520, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', 75, 4.7, 4, 'chef-at-home', 'indian', ARRAY['mutton', 'yogurt', 'onion', 'kashmiri chili', 'fennel', 'ginger', 'garlic', 'bay leaves'], 'non-vegetarian'),

('Fish Curry', 'Fresh fish cooked in coconut milk with South Indian spices', 380, 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', 25, 4.4, 3, 'home-delivery', 'indian', ARRAY['fish', 'coconut milk', 'curry leaves', 'mustard seeds', 'turmeric', 'red chili', 'tamarind'], 'non-vegetarian'),

-- Chinese Dishes
('Hakka Noodles', 'Stir-fried noodles with vegetables and soy sauce', 180, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400', 15, 4.2, 1, 'home-delivery', 'chinese', ARRAY['noodles', 'cabbage', 'carrot', 'bell pepper', 'soy sauce', 'garlic', 'ginger'], 'vegetarian'),

('Sweet and Sour Chicken', 'Crispy chicken pieces in tangy sweet and sour sauce', 340, 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', 20, 4.3, 1, 'home-delivery', 'chinese', ARRAY['chicken', 'bell pepper', 'pineapple', 'vinegar', 'sugar', 'tomato sauce', 'cornflour'], 'non-vegetarian'),

('Manchurian', 'Deep-fried vegetable balls in spicy Indo-Chinese sauce', 220, 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400', 25, 4.1, 2, 'home-delivery', 'chinese', ARRAY['cabbage', 'carrot', 'bell pepper', 'soy sauce', 'chili sauce', 'garlic', 'ginger', 'cornflour'], 'vegetarian'),

-- Continental Dishes
('Margherita Pizza', 'Classic Italian pizza with fresh mozzarella, tomatoes, and basil', 320, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', 20, 4.5, 0, 'home-delivery', 'italian', ARRAY['pizza dough', 'mozzarella', 'tomato sauce', 'basil', 'olive oil'], 'vegetarian'),

('Chicken Alfredo Pasta', 'Creamy pasta with grilled chicken in rich Alfredo sauce', 420, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400', 25, 4.4, 0, 'chef-at-home', 'italian', ARRAY['pasta', 'chicken', 'cream', 'parmesan', 'butter', 'garlic', 'herbs'], 'non-vegetarian'),

('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing, croutons, and parmesan', 280, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 10, 4.2, 0, 'home-delivery', 'continental', ARRAY['romaine lettuce', 'croutons', 'parmesan', 'caesar dressing', 'lemon'], 'vegetarian'),

-- Mexican Dishes
('Chicken Burrito', 'Grilled chicken wrapped in tortilla with rice, beans, and salsa', 350, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', 15, 4.3, 2, 'home-delivery', 'mexican', ARRAY['chicken', 'tortilla', 'rice', 'black beans', 'salsa', 'cheese', 'lettuce'], 'non-vegetarian'),

('Vegetable Quesadilla', 'Grilled tortilla filled with cheese and mixed vegetables', 280, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=400', 12, 4.1, 1, 'home-delivery', 'mexican', ARRAY['tortilla', 'cheese', 'bell pepper', 'onion', 'mushroom', 'jalapeño'], 'vegetarian'),

-- Thai Dishes
('Pad Thai', 'Stir-fried rice noodles with shrimp, tofu, and peanuts', 380, 'https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400', 20, 4.6, 2, 'chef-at-home', 'thai', ARRAY['rice noodles', 'shrimp', 'tofu', 'peanuts', 'bean sprouts', 'lime', 'fish sauce'], 'non-vegetarian'),

('Green Curry', 'Coconut milk-based curry with vegetables and Thai herbs', 320, 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400', 25, 4.4, 4, 'home-delivery', 'thai', ARRAY['coconut milk', 'green curry paste', 'vegetables', 'basil', 'lime leaves', 'fish sauce'], 'vegetarian'),

-- Healthy Options
('Quinoa Bowl', 'Nutritious quinoa with roasted vegetables and avocado', 350, 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400', 15, 4.3, 0, 'home-delivery', 'healthy', ARRAY['quinoa', 'avocado', 'roasted vegetables', 'olive oil', 'lemon', 'herbs'], 'vegan'),

('Grilled Salmon', 'Fresh salmon fillet with herbs and lemon butter sauce', 520, 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400', 18, 4.7, 0, 'chef-at-home', 'continental', ARRAY['salmon', 'butter', 'lemon', 'herbs', 'garlic', 'olive oil'], 'non-vegetarian'),

-- Desserts
('Gulab Jamun', 'Soft milk dumplings soaked in rose-flavored sugar syrup', 150, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 30, 4.5, 0, 'home-delivery', 'indian', ARRAY['milk powder', 'flour', 'sugar', 'rose water', 'cardamom', 'ghee'], 'vegetarian'),

('Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone', 220, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', 240, 4.6, 0, 'chef-at-home', 'italian', ARRAY['ladyfingers', 'mascarpone', 'coffee', 'cocoa', 'sugar', 'eggs'], 'eggitarian');

-- Create favorites table for user preferences
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    dish_id INTEGER NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, dish_id)
);

-- Create index for favorites
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_dish_id ON favorites(dish_id);

-- Update function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_dishes_updated_at BEFORE UPDATE ON dishes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();