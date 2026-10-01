<?php
// solicitudes/crear.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

// Sends an error message as JSON and stops the script
function fallo(string $mensaje): void
{
    echo json_encode(['status' => 'error', 'message' => $mensaje]);
    exit;
}

// 1. CHECK METHOD
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    fallo('Method not allowed.');
}

// 2. CHECK SESSION
if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    fallo('You must log in to create a request.');
}

$idUsuario = (int) $_SESSION['usuario_id'];

// 3. GET DATA
$titulo = trim($_POST['titulo'] ?? '');
$descripcion = trim($_POST['descripcion'] ?? '');
$cantidadBeneficiados = trim($_POST['cantidad_beneficiados'] ?? '');
$ubicacion = trim($_POST['ubicacion'] ?? '');
$fechaLimite = trim($_POST['fecha_limite'] ?? '');

// Products
$categorias = $_POST['id_categoria'] ?? [];
$productos = $_POST['producto'] ?? [];
$cantidades = $_POST['cantidad_requerida'] ?? [];

// 4. VALIDATE MAIN FIELDS
if ($titulo === '') {
    fallo('The title is required.');
}

if ($descripcion === '') {
    fallo('The description is required.');
}

if (strlen($titulo) > 150) {
    fallo('The title cannot exceed 150 characters.');
}

if ($cantidadBeneficiados !== '') {
    if (!filter_var($cantidadBeneficiados, FILTER_VALIDATE_INT) || (int) $cantidadBeneficiados < 1) {
        fallo('The number of beneficiaries is not valid.');
    }
    $cantidadBeneficiados = (int) $cantidadBeneficiados;
} else {
    $cantidadBeneficiados = null;
}

// 5. VALIDATE DATE
if ($fechaLimite !== '') {
    $fecha = DateTime::createFromFormat('Y-m-d', $fechaLimite);

    if (!$fecha || $fecha->format('Y-m-d') !== $fechaLimite) {
        fallo('The deadline is not valid.');
    }
} else {
    $fechaLimite = null;
}

// 5.1 VALIDATE COORDINATES (optional)
$latitud = trim($_POST['latitud'] ?? '');
$longitud = trim($_POST['longitud'] ?? '');

if ($latitud !== '' && $longitud !== '') {
    if (
        !is_numeric($latitud) ||
        !is_numeric($longitud) ||
        (float) $latitud < 13.0 || (float) $latitud > 14.6 ||
        (float) $longitud < -90.2 || (float) $longitud > -87.6
    ) {
        fallo('The location selected on the map is not valid.');
    }

    $latitud = (float) $latitud;
    $longitud = (float) $longitud;
} else {
    $latitud = null;
    $longitud = null;
}

// 6. VALIDATE PRODUCTS
if (!is_array($categorias) || !is_array($productos) || !is_array($cantidades)) {
    fallo('The product data is not valid.');
}

$totalProductos = count($productos);

if ($totalProductos < 1) {
    fallo('You must add at least one product.');
}

if (count($categorias) !== $totalProductos || count($cantidades) !== $totalProductos) {
    fallo('The product data is incomplete.');
}

// 7. VALIDATE EACH PRODUCT
$categoriasValidas = [1, 2, 3, 4, 5, 6];

for ($i = 0; $i < $totalProductos; $i++) {
    $categoria = (int) $categorias[$i];
    $producto = trim($productos[$i]);
    $cantidad = trim($cantidades[$i]);

    if (!in_array($categoria, $categoriasValidas, true)) {
        fallo('One of the selected categories is not valid.');
    }

    if ($producto === '') {
        fallo('All products must have a name.');
    }

    if ($cantidad === '') {
        fallo('All products must have an amount.');
    }

    if (strlen($producto) > 150) {
        fallo('A product name exceeds 150 characters.');
    }

    if (strlen($cantidad) > 100) {
        fallo('An amount exceeds 100 characters.');
    }
}

// 8. VALIDATE IMAGE
$imagenExiste = false;

if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] !== UPLOAD_ERR_NO_FILE) {

    if ($_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
        fallo('An error occurred while uploading the image.');
    }

    $imagenExiste = true;

    // Maximum 5 MB
    if ($_FILES['imagen']['size'] > 5 * 1024 * 1024) {
        fallo('The image cannot exceed 5 MB.');
    }

    // Validate the real MIME type
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $tipoImagen = $finfo->file($_FILES['imagen']['tmp_name']);

    $tiposPermitidos = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp'
    ];

    if (!isset($tiposPermitidos[$tipoImagen])) {
        fallo('The file must be JPG, PNG or WEBP.');
    }

    $extension = $tiposPermitidos[$tipoImagen];
}

// 9. START TRANSACTION
try {

    $conexion->beginTransaction();

    // 10. INSERT REQUEST
    $stmtSolicitud = $conexion->prepare("
        INSERT INTO solicitudes
        (id_usuario, titulo, descripcion, cantidad_beneficiados, ubicacion, fecha_limite, latitud, longitud)
        VALUES
        (:id_usuario, :titulo, :descripcion, :cantidad_beneficiados, :ubicacion, :fecha_limite, :latitud, :longitud)
    ");

    $stmtSolicitud->execute([
        ':id_usuario' => $idUsuario,
        ':titulo' => $titulo,
        ':descripcion' => $descripcion,
        ':cantidad_beneficiados' => $cantidadBeneficiados,
        ':ubicacion' => $ubicacion !== '' ? $ubicacion : null,
        ':fecha_limite' => $fechaLimite,
        ':latitud' => $latitud,
        ':longitud' => $longitud
    ]);

    // Get the request ID
    $idSolicitud = $conexion->lastInsertId();

    // 11. INSERT DETAILS
    $stmtDetalle = $conexion->prepare("
        INSERT INTO detalles_solicitud
        (id_solicitud, id_categoria, producto, cantidad_requerida)
        VALUES
        (:id_solicitud, :id_categoria, :producto, :cantidad_requerida)
    ");

    for ($i = 0; $i < $totalProductos; $i++) {
        $stmtDetalle->execute([
            ':id_solicitud' => $idSolicitud,
            ':id_categoria' => (int) $categorias[$i],
            ':producto' => trim($productos[$i]),
            ':cantidad_requerida' => trim($cantidades[$i])
        ]);
    }

    // 12. SAVE IMAGE
    if ($imagenExiste) {

        $carpetaDestino = '../public/uploads/solicitudes/';

        // Create the folder if it does not exist
        if (!is_dir($carpetaDestino)) {
            if (!mkdir($carpetaDestino, 0755, true)) {
                throw new Exception('The images folder could not be created.');
            }
        }

        $nombreArchivo = uniqid('solicitud_', true) . '.' . $extension;
        $rutaDestino = $carpetaDestino . $nombreArchivo;

        if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $rutaDestino)) {
            throw new Exception('The image could not be saved.');
        }

        // Save the path in the DB
        $stmtImagen = $conexion->prepare("
            INSERT INTO imagen_solicitud
            (id_solicitud, ruta_imagen)
            VALUES
            (:id_solicitud, :ruta_imagen)
        ");

        $stmtImagen->execute([
            ':id_solicitud' => $idSolicitud,
            ':ruta_imagen' => 'uploads/solicitudes/' . $nombreArchivo
        ]);
    }

    // 13. COMMIT TRANSACTION
    $conexion->commit();

    // 14. RESPONSE
    echo json_encode([
        'status' => 'success',
        'message' => 'Request published successfully!',
        'id_solicitud' => $idSolicitud
    ]);

} catch (Throwable $e) {

    // Undo changes
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }

    error_log('Error al crear solicitud: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'status' => 'error',
        'message' => 'The request could not be created. Please try again.'
    ]);
}
?>