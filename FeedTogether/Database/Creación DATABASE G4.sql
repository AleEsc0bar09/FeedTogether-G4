USE grupo4;

CREATE TABLE usuarios( 

id_usuario INT AUTO_INCREMENT PRIMARY KEY
nombre_contacto VARCHAR(100) NOT NULL
nombre_organizacion VARCHAR(150)
correo VARCHAR(150) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL

rol ENUM(
'solicitante',
'donante',
) NOT NULL

telefono VARCHAR(20)
whatsapp VARCHAR(255)
descripcion TEXT
direccion VARCHAR(255)
municipio VARCHAR(50)
departamentoVARCHAR(50)
logo_url VARCHAR(255)
fecha_registro DATETIME

estado ENUM(
'activo',
'inactivo'
)
);
CREATE TABLE solicitudes(

id_solicitud INT AUTO_INCREMENT PRIMARY KEY

id_usuarios INT NOT NULL

titulo VARCHAR(150) NOT NULL

descripcion TEXT NOT NULL

cantidad_beneficiados INT NULL

ubicacion VARCHAR(200) NULL

fecha_limite DATE NULL

estado ENUM(
 'activa',
 'cerrada'
 ) DEFAULT 'activa'

fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE imagenes_solicitud(

id_imagenes INT AUTO_INCREMENT PRIMARY KEY

id_solicitudes INT NOT NULL

ruta_imagen VARCHAR(255) NOT NULL

fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE detalles_necesidades(

id_detalles INT AUTO_INCREMENT PRIMARY KEY

id_solicitudes INT NOT NULL

id_categoria INT NOT NULL

producto VARCHAR(150) NOT NULL

cantidad_requerida VARCHAR(100) NOT NULL
);


CREATE TABLE categoria(

id_categoria INT AUTO_INCREMENT PRIMARY KEY

nombre_categoria VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE compromisos_donacion(

id_compromiso INT AUTO_INCREMENT PRIMARY KEY

id_solicitudes INT NOT NULL

id_usuarios INT NOT NULL

mensaje TEXT NULL

fecha_compromiso DATETIME DEFAULT CURRENT_TIMESTAMP

estado ENUM(
 'pendiente',
 'completado',
 'cancelado'
 ) DEFAULT 'pendiente'
 );