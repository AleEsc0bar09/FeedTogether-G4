<?php
// solicitudes/listar.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

// El contacto del solicitante solo se muestra a usuarios con sesión iniciada
$logueado = isset($_SESSION['usuario_id']);

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
            (SELECT COUNT(*) FROM compromisos_donacion cd WHERE cd.id_solicitud = s.id_solicitud) AS total_compromisos,
            u.nombre AS nombre_usuario,
            u.telefono AS telefono_contacto,
            u.email AS email_contacto,
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

    $stmtDet = $conexion->prepare("
        SELECT c.nombre_categoria, d.producto, d.cantidad_requerida
        FROM detalles_solicitud d
        JOIN categoria c ON d.id_categoria = c.id_categoria
        WHERE d.id_solicitud = :id
    ");

    // Para cada solicitud, traer sus productos
    foreach ($solicitudes as &$sol) {
        $stmtDet->execute([':id' => $sol['id_solicitud']]);
        $sol['productos'] = $stmtDet->fetchAll();

        // Sin sesión no se envía el contacto
        if (!$logueado) {
            $sol['telefono_contacto'] = null;
            $sol['email_contacto'] = null;
        }
    }
    unset($sol);

    echo json_encode([
        'status' => 'success',
        'solicitudes' => $solicitudes
    ]);

} catch (PDOException $e) {
    error_log('Error al listar solicitudes: ' . $e->getMessage());
    echo json_encode([
        'status' => 'error',
        'message' => 'No se pudieron cargar las solicitudes.'
    ]);
}
?>