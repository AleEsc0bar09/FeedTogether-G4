<?php
// solicitudes/comprometer.php

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
    echo json_encode(['status' => 'error', 'message' => 'You must log in to make a donation pledge.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];

$idSolicitud = filter_var($_POST['id_solicitud'] ?? '', FILTER_VALIDATE_INT);
$mensaje = trim($_POST['mensaje'] ?? '');

if (!$idSolicitud) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
    exit;
}

try {
    // Check that the request exists and is active
    $stmtCheck = $conexion->prepare("SELECT id_solicitud FROM solicitudes WHERE id_solicitud = :id AND estado = 'activa'");
    $stmtCheck->execute([':id' => $idSolicitud]);

    if (!$stmtCheck->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'This request is no longer available.']);
        exit;
    }

    // Check that the user has not already pledged to this request
    $stmtDuplicado = $conexion->prepare("
        SELECT id_compromiso FROM compromisos_donacion
        WHERE id_solicitud = :id_solicitud AND id_usuario = :id_usuario
    ");
    $stmtDuplicado->execute([
        ':id_solicitud' => $idSolicitud,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmtDuplicado->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'You have already pledged to this request.']);
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
        'message' => 'Your donation pledge was sent successfully!'
    ]);

} catch (PDOException $e) {
    error_log('Error al crear compromiso: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Your pledge could not be registered. Please try again.'
    ]);
}
?>