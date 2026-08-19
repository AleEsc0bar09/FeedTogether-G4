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

try {
    // 1. Verificar si el correo ya existe
    $stmtCheck = $conexion->prepare("SELECT id FROM usuarios WHERE email = :email");
    $stmtCheck->execute([':email' => $email]);

    if ($stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado.']);
        exit;
    }

    // 2. Encriptar contraseña por seguridad
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // 3. Procesar la subida de la foto de perfil
    $carpetaDestino = '../public/uploads/';
    $extension = strtolower(pathinfo($_FILES['foto_perfil']['name'], PATHINFO_EXTENSION));
    $nombreArchivo = uniqid('perfil_', true) . '.' . $extension;
    $rutaDestino = $carpetaDestino . $nombreArchivo;

    if (!move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $rutaDestino)) {
        echo json_encode(['status' => 'error', 'message' => 'Ocurrió un error al subir la foto de perfil.']);
        exit;
    }

    // 4. Insertar el nuevo usuario en DatabaseTestFinal
    $stmtInsert = $conexion->prepare("INSERT INTO usuarios (nombre, email, password, departamento, distrito, telefono, foto_perfil, rol) VALUES (:nombre, :email, :password, :departamento, :distrito, :telefono, :foto_perfil, :rol)");
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
    error_log('Error al registrar usuario: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'Ocurrió un error al registrar el usuario. Inténtalo de nuevo más tarde.'
    ]);
}
?>