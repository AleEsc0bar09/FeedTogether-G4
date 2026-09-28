<?php
// solicitudes/listar.php

header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

try {
    $sql = "
        SELECT 
            s.id_solicitud,
            s.titulo,
            s.descripcion,
            s.cantidad_beneficiados,
            s.ubicacion,
            s.fecha_limite,
            s.fecha_publicacion,
            s.estado,
            s.latitud,
            s.longitud,
            u.nombre AS nombre_usuario,
            (SELECT ruta_imagen FROM imagen_solicitud 
             WHERE id_solicitud = s.id_solicitud 
             ORDER BY id_imagen ASC LIMIT 1) AS imagen
        FROM solicitudes s
        JOIN usuario u ON s.id_usuario = u.id_usuario
        WHERE s.estado = 'activa'
        ORDER BY s.fecha_publicacion DESC
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $solicitudes = $stmt->fetchAll();

    // Para cada solicitud, traer sus productos
    foreach ($solicitudes as &$sol) {
        $stmtDet = $conexion->prepare("
            SELECT c.nombre_categoria, d.producto, d.cantidad_requerida
            FROM detalles_solicitud d
            JOIN categoria c ON d.id_categoria = c.id_categoria
            WHERE d.id_solicitud = :id
        ");
        $stmtDet->execute([':id' => $sol['id_solicitud']]);
        $sol['productos'] = $stmtDet->fetchAll();
    }

    echo json_encode([
        'status' => 'success',
        'solicitudes' => $solicitudes
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al listar solicitudes: ' . $e->getMessage()
    ]);
}
?>