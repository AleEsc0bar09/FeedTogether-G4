CREATE DATABASE Feedtogether;

USE Feedtogether;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    departamento VARCHAR(50) NOT NULL,
    distrito VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    foto_perfil VARCHAR(255) NOT NULL,
    rol ENUM('donor', 'requester') NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de categorías
CREATE TABLE categoria(
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria ENUM(
        'Víveres básicos',
        'Alimentos infantiles',
        'Agua potable',
        'Frutas y verduras',
        'Alimentos no perecederos',
        'Otro'
    )
);

-- Tabla de solicitudes
CREATE TABLE solicitudes(
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad_beneficiados INT NULL,
    ubicacion VARCHAR(200) NULL,
    fecha_limite DATE NULL,
    estado ENUM('activa','cerrada') DEFAULT 'activa',
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_solicitud_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla de imágenes asociadas a solicitudes
CREATE TABLE imagen_solicitud(
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    ruta_imagen VARCHAR(255) NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_imagen_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud)
);

-- Tabla de detalles de solicitud
CREATE TABLE detalles_solicitud(
    id_detalles INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_categoria INT NOT NULL,
    producto VARCHAR(150) NOT NULL,
    cantidad_requerida VARCHAR(100) NOT NULL,
    CONSTRAINT fk_detalles_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud),
    CONSTRAINT fk_detalles_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);

-- Tabla de compromisos de donación
CREATE TABLE compromisos_donacion(
    id_compromiso INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT NOT NULL,
    id_usuario INT NOT NULL,
    mensaje TEXT NULL,
    fecha_compromiso DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente','completado','cancelado') DEFAULT 'pendiente',
    CONSTRAINT fk_compromiso_solicitud FOREIGN KEY (id_solicitud) REFERENCES solicitudes(id_solicitud),
    CONSTRAINT fk_compromiso_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Tabla de feedback
CREATE TABLE feedback(
    id_feedback INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NULL,
    calificacion TINYINT NOT NULL,
    comentario TEXT NOT NULL,
    fecha_feedback DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);
