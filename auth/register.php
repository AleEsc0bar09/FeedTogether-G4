<?php
// auth/register.php

header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

// Get submitted data (supports JSON or $_POST)
$inputData = json_decode(file_get_contents('php://input'), true);

$nombre = trim($inputData['nombre'] ?? $_POST['nombre'] ?? '');
$email = trim($inputData['email'] ?? $_POST['email'] ?? '');
$password = trim($inputData['password'] ?? $_POST['password'] ?? '');
$confirmPassword = trim($inputData['confirm_password'] ?? $_POST['confirm_password'] ?? '');
$departamento = trim($inputData['departamento'] ?? $_POST['departamento'] ?? '');
$distrito = trim($inputData['distrito'] ?? $_POST['distrito'] ?? '');
$telefono = trim($inputData['telefono'] ?? $_POST['telefono'] ?? '');
$rol = trim($inputData['rol'] ?? $_POST['rol'] ?? '');

// Empty fields validation
if (empty($nombre) || empty($email) || empty($password) || empty($confirmPassword) || empty($departamento) || empty($distrito) || empty($telefono) || empty($rol)) {
    echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields.']);
    exit;
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'The email address is not valid.']);
    exit;
}

// Validate that the passwords match
if ($password !== $confirmPassword) {
    echo json_encode(['status' => 'error', 'message' => 'Passwords do not match.']);
    exit;
}

// Validate that the role is one of the allowed ones
if (!in_array($rol, ['donor', 'requester'], true)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid role.']);
    exit;
}

// Validate that a profile photo was uploaded
if (!isset($_FILES['foto_perfil']) || $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['status' => 'error', 'message' => 'You must upload a profile photo.']);
    exit;
}

// Validate size (max. 5 MB)
if ($_FILES['foto_perfil']['size'] > 5 * 1024 * 1024) {
    echo json_encode(['status' => 'error', 'message' => 'The photo cannot exceed 5 MB.']);
    exit;
}

// Validate the REAL file type (not the extension sent by the browser)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$tipoImagen = $finfo->file($_FILES['foto_perfil']['tmp_name']);

$tiposPermitidos = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp'
];

if (!isset($tiposPermitidos[$tipoImagen])) {
    echo json_encode(['status' => 'error', 'message' => 'The photo must be JPG, PNG or WEBP.']);
    exit;
}

// The extension comes from the table above, never from the name the user sends
$extension = $tiposPermitidos[$tipoImagen];

$rutaDestino = null;

try {
    // 1. Check whether the email already exists
    $stmtCheck = $conexion->prepare("SELECT id_usuario FROM usuario WHERE email = :email");
    $stmtCheck->execute([':email' => $email]);

    if ($stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'This email address is already registered.']);
        exit;
    }

    // 2. Hash the password for security
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    // 3. Save the profile photo (the name is built AFTER validating)
    $carpetaDestino = '../public/uploads/';
    $nombreArchivo = uniqid('perfil_', true) . '.' . $extension;
    $rutaDestino = $carpetaDestino . $nombreArchivo;

    if (!move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $rutaDestino)) {
        $rutaDestino = null;
        echo json_encode(['status' => 'error', 'message' => 'An error occurred while uploading the profile photo.']);
        exit;
    }

    // 4. Insert the new user
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
        'message' => 'User registered successfully!'
    ]);

} catch (PDOException $e) {

    // If the photo was already saved but the registration failed, delete it to avoid orphan files
    if ($rutaDestino !== null && is_file($rutaDestino)) {
        unlink($rutaDestino);
    }

    error_log('Error al registrar usuario: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'The registration could not be completed. Please try again.'
    ]);
}
?>