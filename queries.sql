CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('admin'), ('editor'), ('viewer');

CREATE TABLE family_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL,
  role_id INT NOT NULL DEFAULT 3 REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE fridges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id),
  family_group_id UUID REFERENCES family_groups(id) ON DELETE SET NULL
);

CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity >= 0),
  fridge_id UUID NOT NULL REFERENCES fridges(id) ON DELETE CASCADE,
  expiration_date DATE
);

