<?php
// auth/register.php

header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

// Obtener datos enviados (Soporta JSON o $_POST)
$inputData = json_decode(file_get_contents('php://input'), true);

$nombre = trim($inputData['nombre'] ?? $_POST['nombre'] ?? '');
$email = trim($inputData['email'] ?? $_POST['email'] ?? '');
$password = trim($inputData['password'] ?? $_POST['password'] ?? '');
$confirmPassword = trim($inputData['confirm_password'] ?? $_POST['confirm_password'] ?? '');
$departamento = trim($inputData['departamento'] ?? $_POST['departamento'] ?? '');
$distrito = trim($inputData['distrito'] ?? $_POST['distrito'] ?? '');
$telefono = trim($inputData['telefono'] ?? $_POST['telefono'] ?? '');
$rol = trim($inputData['rol'] ?? $_POST['rol'] ?? '');

// Validación de campos vacíos
if (empty($nombre) || empty($email) || empty($password) || empty($confirmPassword) || empty($departamento) || empty($distrito) || empty($telefono) || empty($rol)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor, completa todos los campos.']);
    exit;
}

// Validar formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'El correo electrónico no es válido.']);
    exit;
}

// Validar que las contraseñas coincidan
if ($password !== $confirmPassword) {
    echo json_encode(['status' => 'error', 'message' => 'Las contraseñas no coinciden.']);
    exit;
}

// Validar que el rol sea uno de los permitidos
if (!in_array($rol, ['donor', 'requester'], true)) {
    echo json_encode(['status' => 'error', 'message' => 'Rol no válido.']);
    exit;
}

// Validar que se haya subido la foto de perfil
if (!isset($_FILES['foto_perfil']) || $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'Debes subir una foto de perfil.']);
    exit;
}

// Validar tamaño (máx. 5 MB)
if ($_FILES['foto_perfil']['size'] > 5 * 1024 * 1024) {
    echo json_encode(['status' => 'error', 'message' => 'La foto no puede superar los 5 MB.']);
    exit;
}

// Validar el tipo REAL del archivo (no la extensión que manda el navegador)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$tipoImagen = $finfo->file($_FILES['foto_perfil']['tmp_name']);

$tiposPermitidos = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!isset($tiposPermitidos[$tipoImagen])) {
    echo json_encode(['status' => 'error', 'message' => 'La foto debe ser JPG, PNG o WEBP.']);
    exit;
}

// La extensión sale de la tabla de arriba, nunca del nombre que envía el usuario
$extension = $tiposPermitidos[$tipoImagen];

$rutaDestino = null;

try {
    // 1. Verificar si el correo ya existe
    $stmtCheck = $conexion->prepare("SELECT id_usuario FROM usuario WHERE email = :email");
    $stmtCheck->execute([':email' => $email]);

    if ($stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado.']);
        exit;
    }

    // 2. Encriptar contraseña por seguridad
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // 3. Guardar la foto de perfil (el nombre se arma DESPUÉS de validar)
    $carpetaDestino = '../public/uploads/';
    $nombreArchivo = uniqid('perfil_', true) . '.' . $extension;
    $rutaDestino = $carpetaDestino . $nombreArchivo;

    if (!move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $rutaDestino)) {
        $rutaDestino = null;
        echo json_encode(['status' => 'error', 'message' => 'Ocurrió un error al subir la foto de perfil.']);
        exit;
    }

    // 4. Insertar el nuevo usuario
    $stmtInsert = $conexion->prepare("INSERT INTO usuario (nombre, email, password, departamento, distrito, telefono, foto_perfil, rol) VALUES (:nombre, :email, :password, :departamento, :distrito, :telefono, :foto_perfil, :rol)");
    $stmtInsert->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':password' => $passwordHash,
        ':departamento' => $departamento,
        ':distrito' => $distrito,
        ':telefono' => $telefono,
        ':foto_perfil' => $nombreArchivo,
        ':rol' => $rol
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => '¡Usuario registrado con éxito!'
    ]);

} catch (PDOException $e) {

    // Si la foto ya se guardó pero el registro falló, se borra para no dejar archivos huérfanos
    if ($rutaDestino !== null && is_file($rutaDestino)) {
        unlink($rutaDestino);
    }

    error_log('Error al registrar usuario: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo completar el registro. Inténtalo nuevamente.'
    ]);
}
?>