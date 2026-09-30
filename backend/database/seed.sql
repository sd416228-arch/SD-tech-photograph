INSERT INTO services (title, description, image_url)
SELECT 'Newborn Photography', 'Quiet, gentle portraits for the first days of a new life.', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=85'
WHERE NOT EXISTS (SELECT 1 FROM services);

INSERT INTO services (title, description, image_url)
SELECT 'Family Photography', 'Natural photographs of the people and places that feel like home.', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=85'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Family Photography');

INSERT INTO services (title, description, image_url)
SELECT 'Maternity Photography', 'An honest celebration of the season before everything changes.', 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?auto=format&fit=crop&w=900&q=85'
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Maternity Photography');

INSERT INTO services (title, description, image_url)
SELECT 'Milestone Photography', 'Thoughtful coverage for birthdays, blessings and days worth gathering for.', NULL
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title = 'Milestone Photography');

INSERT INTO packages (name, description, price, features)
SELECT 'Little Beginnings', 'A relaxed session for a growing family.', 18000, '["Pre-session planning", "60-minute session", "20 edited photographs"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM packages);

INSERT INTO packages (name, description, price, features)
SELECT 'The Family Story', 'A fuller session for the moments in between.', 28000, '["Location consultation", "90-minute session", "35 edited photographs"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'The Family Story');

INSERT INTO reviews (customer_name, rating, review_text, is_approved)
SELECT 'Aarushi and family', 5, 'The whole session felt calm, personal and completely like us.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews);

INSERT INTO reviews (customer_name, rating, review_text, is_approved)
SELECT 'Suman and Riya', 5, 'We will treasure these photographs through every season of our family.', TRUE
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE customer_name = 'Suman and Riya');

INSERT INTO gallery (title, image_url, category, is_featured)
SELECT 'A new beginning', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1200&q=85', 'Newborn', TRUE
WHERE NOT EXISTS (SELECT 1 FROM gallery);

INSERT INTO gallery (title, image_url, category, is_featured)
SELECT 'Together at home', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=85', 'Family', TRUE
WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE title = 'Together at home');

INSERT INTO business_settings (id, business_name, email, address, about_text)
VALUES (1, 'PicturesSquad Studio Nepal', 'hello@picturesquad.com', 'Kathmandu and Pokhara, Nepal', 'Gentle, honest photography for newborns, babies, families and the milestones that matter.')
ON CONFLICT (id) DO NOTHING;
