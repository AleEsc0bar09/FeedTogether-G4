<?php
// auth/editar_perfil.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'No hay sesión activa.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];

// Datos enviados (FormData). El rol y la contraseña no se editan aquí.
$nombre = trim($_POST['nombre'] ?? '');
$email = trim($_POST['email'] ?? '');
$departamento = trim($_POST['departamento'] ?? '');
$distrito = trim($_POST['distrito'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');

// Campos vacíos
if ($nombre === '' || $email === '' || $departamento === '' || $distrito === '' || $telefono === '') {
    echo json_encode(['status' => 'error', 'message' => 'Por favor, completa todos los campos.']);
    exit;
}

// Formato de email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['status' => 'error', 'message' => 'El correo electrónico no es válido.']);
    exit;
}

// Largos máximos según la tabla usuario
if (
    mb_strlen($nombre) > 100 ||
    mb_strlen($email) > 150 ||
    mb_strlen($departamento) > 50 ||
    mb_strlen($distrito) > 50 ||
    mb_strlen($telefono) > 15
) {
    echo json_encode(['status' => 'error', 'message' => 'Uno de los campos supera la longitud permitida.']);
    exit;
}

// Foto de perfil (opcional al editar: si no se envía, se conserva la actual)
$carpetaDestino = '../public/uploads/';
$extension = null;

if (isset($_FILES['foto_perfil']) && $_FILES['foto_perfil']['error'] !== UPLOAD_ERR_NO_FILE) {

    if ($_FILES['foto_perfil']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(['status' => 'error', 'message' => 'Ocurrió un error al subir la foto de perfil.']);
        exit;
    }

    if ($_FILES['foto_perfil']['size'] > 5 * 1024 * 1024) {
        echo json_encode(['status' => 'error', 'message' => 'La foto no puede superar los 5 MB.']);
        exit;
    }

    // Validar el tipo real del archivo (no la extensión que envía el navegador)
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $tipoImagen = $finfo->file($_FILES['foto_perfil']['tmp_name']);

    $tiposPermitidos = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($tiposPermitidos[$tipoImagen])) {
        echo json_encode(['status' => 'error', 'message' => 'La foto debe ser JPG, PNG o WEBP.']);
        exit;
    }

    $extension = $tiposPermitidos[$tipoImagen];
}

$rutaNuevaFoto = null;

try {
    // 1. El email no puede pertenecer a otro usuario
    $stmtCheck = $conexion->prepare("SELECT id_usuario FROM usuario WHERE email = :email AND id_usuario <> :id_usuario");
    $stmtCheck->execute([
        ':email' => $email,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'El correo electrónico ya está registrado por otro usuario.']);
        exit;
    }

    // 2. Foto actual del usuario
    $stmtActual = $conexion->prepare("SELECT foto_perfil FROM usuario WHERE id_usuario = :id_usuario");
    $stmtActual->execute([':id_usuario' => $idUsuario]);
    $fotoAnterior = $stmtActual->fetchColumn();

    if ($fotoAnterior === false) {
        echo json_encode(['status' => 'error', 'message' => 'Usuario no encontrado.']);
        exit;
    }

    $fotoFinal = $fotoAnterior;

    // 3. Guardar la nueva foto (si se envió una)
    if ($extension !== null) {
        $nombreArchivo = uniqid('perfil_', true) . '.' . $extension;
        $rutaNuevaFoto = $carpetaDestino . $nombreArchivo;

        if (!move_uploaded_file($_FILES['foto_perfil']['tmp_name'], $rutaNuevaFoto)) {
            $rutaNuevaFoto = null;
            throw new Exception('No se pudo guardar la foto de perfil.');
        }

        $fotoFinal = $nombreArchivo;
    }

    // 4. Actualizar el usuario
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

    // 5. Actualizar la sesión (perfil.php lee los datos de aquí)
    $_SESSION['usuario_nombre'] = $nombre;
    $_SESSION['usuario_email'] = $email;
    $_SESSION['usuario_departamento'] = $departamento;
    $_SESSION['usuario_distrito'] = $distrito;
    $_SESSION['usuario_telefono'] = $telefono;
    $_SESSION['usuario_foto_perfil'] = $fotoFinal;

    // 6. Borrar la foto anterior del disco si fue reemplazada
    if ($rutaNuevaFoto !== null && $fotoAnterior) {
        $rutaAnterior = $carpetaDestino . basename($fotoAnterior);
        if (is_file($rutaAnterior)) {
            unlink($rutaAnterior);
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => '¡Perfil actualizado con éxito!'
    ]);

} catch (Throwable $e) {

    // Si se alcanzó a guardar la foto nueva pero algo falló, se elimina
    if ($rutaNuevaFoto !== null && is_file($rutaNuevaFoto)) {
        unlink($rutaNuevaFoto);
    }

    error_log('Error al editar perfil: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo actualizar el perfil. Inténtalo nuevamente.'
    ]);
}
?>