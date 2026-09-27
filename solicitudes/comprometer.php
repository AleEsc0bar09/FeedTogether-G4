<?php
// solicitudes/comprometer.php

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
    echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión para hacer un compromiso de donación.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];

$idSolicitud = filter_var($_POST['id_solicitud'] ?? '', FILTER_VALIDATE_INT);
$mensaje = trim($_POST['mensaje'] ?? '');

if (!$idSolicitud) {
    echo json_encode(['status' => 'error', 'message' => 'Solicitud no válida.']);
    exit;
}

try {
    // Verificar que la solicitud exista y esté activa
    $stmtCheck = $conexion->prepare("SELECT id_solicitud FROM solicitudes WHERE id_solicitud = :id AND estado = 'activa'");
    $stmtCheck->execute([':id' => $idSolicitud]);

    if (!$stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Esta solicitud ya no está disponible.']);
        exit;
    }
        // Verificar que el usuario no se haya comprometido ya con esta solicitud
    $stmtDuplicado = $conexion->prepare("
        SELECT id_compromiso FROM compromisos_donacion 
        WHERE id_solicitud = :id_solicitud AND id_usuario = :id_usuario
    ");
    $stmtDuplicado->execute([
        ':id_solicitud' => $idSolicitud,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmtDuplicado->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Ya te has comprometido con esta solicitud anteriormente.']);
        exit;
    }

    $stmtInsert = $conexion->prepare("
        INSERT INTO compromisos_donacion (id_solicitud, id_usuario, mensaje, estado)
        VALUES (:id_solicitud, :id_usuario, :mensaje, 'pendiente')
    ");
    $stmtInsert->execute([
        ':id_solicitud' => $idSolicitud,
        ':id_usuario' => $idUsuario,
        ':mensaje' => $mensaje !== '' ? $mensaje : null
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => '¡Tu compromiso de donación se envió con éxito!'
    ]);

} catch (PDOException $e) {
    error_log('Error al crear compromiso: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudo registrar tu compromiso. Inténtalo nuevamente.'
    ]);
}
?>