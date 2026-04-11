-- Insert sample books
INSERT INTO books (slug, title, cover_image_url) VALUES
  ('hcv', 'Concepts of Physics', NULL),
  ('irodov', 'Problems in General Physics', NULL),
  ('pathfinder', 'Physics for JEE', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Get book IDs
DO $$
DECLARE
  hcv_id UUID;
  irodov_id UUID;
  pathfinder_id UUID;
BEGIN
  SELECT id INTO hcv_id FROM books WHERE slug = 'hcv';
  SELECT id INTO irodov_id FROM books WHERE slug = 'irodov';
  SELECT id INTO pathfinder_id FROM books WHERE slug = 'pathfinder';

  -- Insert chapters for HCV
  INSERT INTO chapters (book_id, class_identifier, chapter_number, title, slug) VALUES
    (hcv_id, '11', 1, 'Introduction to Physics', 'ch1-introduction-to-physics'),
    (hcv_id, '11', 2, 'Physics and Mathematics', 'ch2-physics-and-mathematics'),
    (hcv_id, '11', 3, 'Rest and Motion: Kinematics', 'ch3-rest-and-motion-kinematics'),
    (hcv_id, '11', 4, 'The Forces', 'ch4-the-forces'),
    (hcv_id, '11', 5, 'Newton''s Laws of Motion', 'ch5-newtons-laws-of-motion'),
    (hcv_id, '11', 6, 'Friction', 'ch6-friction'),
    (hcv_id, '11', 7, 'Circular Motion', 'ch7-circular-motion'),
    (hcv_id, '12', 8, 'Work and Energy', 'ch8-work-and-energy'),
    (hcv_id, '12', 9, 'Centre of Mass, Linear Momentum, Collision', 'ch9-centre-of-mass-linear-momentum-collision'),
    (hcv_id, '12', 10, 'Rotational Mechanics', 'ch10-rotational-mechanics')
  ON CONFLICT DO NOTHING;

  -- Insert chapters for Irodov
  INSERT INTO chapters (book_id, class_identifier, chapter_number, title, slug) VALUES
    (irodov_id, '11_and_12', 1, 'Mechanics', 'ch1-mechanics'),
    (irodov_id, '11_and_12', 2, 'Thermodynamics and Molecular Physics', 'ch2-thermodynamics-and-molecular-physics'),
    (irodov_id, '11_and_12', 3, 'Electrostatics and Current Electricity', 'ch3-electrostatics-and-current-electricity'),
    (irodov_id, '11_and_12', 4, 'Magnetism', 'ch4-magnetism'),
    (irodov_id, '11_and_12', 5, 'Oscillations and Waves', 'ch5-oscillations-and-waves'),
    (irodov_id, '11_and_12', 6, 'Optics', 'ch6-optics'),
    (irodov_id, '11_and_12', 7, 'Atomic and Nuclear Physics', 'ch7-atomic-and-nuclear-physics')
  ON CONFLICT DO NOTHING;

  -- Insert chapters for Pathfinder
  INSERT INTO chapters (book_id, class_identifier, chapter_number, title, slug) VALUES
    (pathfinder_id, '11', 1, 'Kinematics', 'ch1-kinematics'),
    (pathfinder_id, '11', 2, 'Dynamics', 'ch2-dynamics'),
    (pathfinder_id, '11', 3, 'Work, Power, and Energy', 'ch3-work-power-and-energy'),
    (pathfinder_id, '12', 4, 'Electrostatics', 'ch4-electrostatics'),
    (pathfinder_id, '12', 5, 'Current Electricity', 'ch5-current-electricity'),
    (pathfinder_id, '12', 6, 'Magnetism', 'ch6-magnetism')
  ON CONFLICT DO NOTHING;
END $$;
