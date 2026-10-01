<?php
// auth/editar_perfil.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'No active session.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];

// Submitted data (FormData). Role and password are not edited here.
$nombre = trim($_POST['nombre'] ?? '');
$email = trim($_POST['email'] ?? '');
$departamento = trim($_POST['departamento'] ?? '');
$distrito = trim($_POST['distrito'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');

// Empty fields
if ($nombre === '' || $email === '' || $departamento === '' || $distrito === '' || $telefono === '') {
    echo json_encode(['status' => 'error', 'message' => 'Please fill in all fields.']);
    exit;
}

// Email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'The email address is not valid.']);
    exit;
}

// Maximum lengths according to the usuario table
if (
    mb_strlen($nombre) > 100 ||
    mb_strlen($email) > 150 ||
    mb_strlen($departamento) > 50 ||
    mb_strlen($distrito) > 50 ||
    mb_strlen($telefono) > 15
) {
    echo json_encode(['status' => 'error', 'message' => 'One of the fields exceeds the allowed length.']);
    exit;
}

// Profile photo (optional when editing: if not sent, the current one is kept)
$carpetaDestino = '../public/uploads/';
$extension = null;

if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_NO_FILE) {

    if ($_FILES['foto_perfil']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'An error occurred while uploading the profile photo.']);
        exit;
    }

    if ($_FILES['foto_perfil']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['status' => 'error', 'message' => 'The photo cannot exceed 5 MB.']);
        exit;
    }

    // Validate the real file type (not the extension sent by the browser)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $tipoImagen = $finfo->file($_FILES['foto_perfil']['tmp_name']);

    $tiposPermitidos = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($tiposPermitidos[$tipoImagen])) {
        echo json_encode(['status' => 'error', 'message' => 'The photo must be JPG, PNG or WEBP.']);
        exit;
    }

    $extension = $tiposPermitidos[$tipoImagen];
}

$rutaNuevaFoto = null;

try {
    // 1. The email cannot belong to another user
    $stmtCheck = $conexion->prepare("SELECT id_usuario FROM usuario WHERE email = :email AND id_usuario <> :id_usuario");
    $stmtCheck->execute([
        ':email' => $email,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'This email address is already registered by another user.']);
        exit;
    }

    // 2. Current photo of the user
    $stmtActual = $conexion->prepare("SELECT foto_perfil FROM usuario WHERE id_usuario = :id_usuario");
    $stmtActual->execute([':id_usuario' => $idUsuario]);
    $fotoAnterior = $stmtActual->fetchColumn();

    if ($fotoAnterior === false) {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
        exit;
    }

    $fotoFinal = $fotoAnterior;

    // 3. Save the new photo (if one was sent)
    if ($extension !== null) {
        $nombreArchivo = uniqid('perfil_', true) . '.' . $extension;
        $rutaNuevaFoto = $carpetaDestino . $nombreArchivo;

        if (!move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $rutaNuevaFoto)) {
            $rutaNuevaFoto = null;
            throw new Exception('The profile photo could not be saved.');
        }

        $fotoFinal = $nombreArchivo;
    }

    // 4. Update the user
    $stmtUpdate = $conexion->prepare("
        UPDATE usuario
        SET nombre = :nombre,
            email = :email,
            departamento = :departamento,
            distrito = :distrito,
            telefono = :telefono,
            foto_perfil = :foto_perfil
        WHERE id_usuario = :id_usuario
    ");
    $stmtUpdate->execute([
        ':nombre' => $nombre,
        ':email' => $email,
        ':departamento' => $departamento,
        ':distrito' => $distrito,
        ':telefono' => $telefono,
        ':foto_perfil' => $fotoFinal,
        ':id_usuario' => $idUsuario
    ]);

    // 5. Update the session (perfil.php reads the data from here)
    $_SESSION['usuario_nombre'] = $nombre;
    $_SESSION['usuario_email'] = $email;
    $_SESSION['usuario_departamento'] = $departamento;
    $_SESSION['usuario_distrito'] = $distrito;
    $_SESSION['usuario_telefono'] = $telefono;
    $_SESSION['usuario_foto_perfil'] = $fotoFinal;

    // 6. Delete the previous photo from disk if it was replaced
    if ($rutaNuevaFoto !== null && $fotoAnterior) {
        $rutaAnterior = $carpetaDestino . basename($fotoAnterior);
        if (is_file($rutaAnterior)) {
            unlink($rutaAnterior);
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Profile updated successfully!'
    ]);

} catch (Throwable $e) {

    // If the new photo was saved but something failed, delete it
    if ($rutaNuevaFoto !== null && is_file($rutaNuevaFoto)) {
        unlink($rutaNuevaFoto);
    }

    error_log('Error al editar perfil: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'The profile could not be updated. Please try again.'
    ]);
}
?>