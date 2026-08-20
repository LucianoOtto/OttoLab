-- Tabla de secciones (ej: "Catálogo", "Personalizados", "Destacados")
CREATE TABLE IF NOT EXISTS sections (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vínculo de producto -> sección (si todavía no existe)
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL;

-- Campos que ya usa product.model.js para la importación de MakerWorld
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS makerworld_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS designer_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS print_profiles JSONB DEFAULT '[]'::jsonb;

-- Seguimiento manual de licencias de terceros (MakerWorld, etc.).
-- IMPORTANTE: esto es solo un registro interno para que el admin deje
-- constancia de que revisó la licencia; no se calcula automáticamente.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS license_status VARCHAR(30) DEFAULT 'sin_revisar',
  ADD COLUMN IF NOT EXISTS license_notes TEXT;
-- license_status esperado: 'sin_revisar' | 'personal_no_vender' | 'permite_venta' | 'licencia_comercial'
