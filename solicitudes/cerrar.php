<?php
// solicitudes/cerrar.php

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
    echo json_encode(['status' => 'error', 'message' => 'You must log in.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];
$idSolicitud = filter_var($_POST['id_solicitud'] ?? '', FILTER_VALIDATE_INT);

if (!$idSolicitud) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request.']);
    exit;
}

try {
    // The id_usuario in the WHERE guarantees that only the owner can close it
    $stmt = $conexion->prepare("
        UPDATE solicitudes
        SET estado = 'cerrada'
        WHERE id_solicitud = :id_solicitud
          AND id_usuario = :id_usuario
          AND estado = 'activa'
    ");
    $stmt->execute([
        ':id_solicitud' => $idSolicitud,
        ':id_usuario' => $idUsuario
    ]);

    if ($stmt->rowCount() === 0) {
        echo json_encode(['status' => 'error', 'message' => 'The request could not be closed.']);
        exit;
    }

    echo json_encode(['status' => 'success', 'message' => 'Request closed successfully.']);

} catch (PDOException $e) {
    error_log('Error al cerrar solicitud: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'The request could not be closed.']);
}
?>