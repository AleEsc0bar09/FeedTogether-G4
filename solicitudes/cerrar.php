<?php
// solicitudes/cerrar.php

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
    echo json_encode(['status' => 'error', 'message' => 'Debes iniciar sesión.']);
    exit;
}

$idUsuario = (int) $_SESSION['usuario_id'];
$idSolicitud = filter_var($_POST['id_solicitud'] ?? '', FILTER_VALIDATE_INT);

if (!$idSolicitud) {
    echo json_encode(['status' => 'error', 'message' => 'Solicitud no válida.']);
    exit;
}

try {
    // El id_usuario en el WHERE garantiza que solo el dueño pueda cerrarla
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
        echo json_encode(['status' => 'error', 'message' => 'No se pudo cerrar la solicitud.']);
        exit;
    }

    echo json_encode(['status' => 'success', 'message' => 'Solicitud cerrada correctamente.']);

} catch (PDOException $e) {
    error_log('Error al cerrar solicitud: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'No se pudo cerrar la solicitud.']);
}
?>